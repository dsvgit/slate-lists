import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const MeasuringStrategy = {
  Always: 0,
  BeforeDragging: 1,
  WhileDragging: 2,
};

import {
  buildTree,
  flattenTree,
  getProjection,
  removeChildrenOf,
} from "./utilities";
import SortableTreeItem from "./components/SortableTreeItem";

const initialItems = [
  {
    id: "Home",
    children: [],
  },
  {
    id: "Collections",
    children: [
      { id: "Spring", children: [] },
      { id: "Summer", children: [] },
      { id: "Fall", children: [] },
      { id: "Winter", children: [] },
    ],
  },
  {
    id: "About Us",
    children: [],
  },
  {
    id: "My Account",
    children: [
      { id: "Addresses", children: [] },
      { id: "Order History", children: [] },
    ],
  },
];

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

export default function SortableTree({
  defaultItems = initialItems,
  indentationWidth = 50,
}) {
  const [items, setItems] = useState(() => defaultItems);
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(null);

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);

    return removeChildrenOf(flattenedTree, activeId ? [activeId] : []);
  }, [activeId, items]);

  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null;
  const sensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });
  const sensors = useSensors(useSensor(PointerSensor));

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems]
  );

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const announcements = {
    onDragStart(id) {
      return `Picked up ${id}.`;
    },
    onDragMove(id, overId) {
      return getMovementAnnouncement("onDragMove", id, overId);
    },
    onDragOver(id, overId) {
      return getMovementAnnouncement("onDragOver", id, overId);
    },
    onDragEnd(id, overId) {
      return getMovementAnnouncement("onDragEnd", id, overId);
    },
    onDragCancel(id) {
      return `Moving was cancelled. ${id} was dropped in its original position.`;
    },
  };

  return (
    <DndContext
      announcements={announcements}
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        {flattenedItems.map(({ id, depth }) => (
          <SortableTreeItem
            key={id}
            id={id}
            value={id}
            depth={id === activeId && projected ? projected.depth : depth}
            indentationWidth={indentationWidth}
          />
        ))}
      </SortableContext>
    </DndContext>
  );

  function handleDragStart({ active: { id: activeId } }) {
    setActiveId(activeId);
    setOverId(activeId);

    const activeItem = flattenedItems.find(({ id }) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId,
      });
    }

    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ delta }) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({ active, over }) {
    resetState();

    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems = JSON.parse(JSON.stringify(flattenTree(items)));
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      setItems(newItems);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty("cursor", "");
  }

  function getMovementAnnouncement(eventName, activeId, overId) {
    if (overId && projected) {
      if (eventName !== "onDragEnd") {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return;
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId,
          });
        }
      }

      const clonedItems = JSON.parse(JSON.stringify(flattenTree(items)));
      const overIndex = clonedItems.findIndex(({ id }) => id === overId);
      const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const previousItem = sortedItems[overIndex - 1];

      let announcement;
      const movedVerb = eventName === "onDragEnd" ? "dropped" : "moved";
      const nestedVerb = eventName === "onDragEnd" ? "dropped" : "nested";

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1];
        announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`;
      } else {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
        } else {
          let previousSibling = previousItem;
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId = previousSibling.parentId;
            previousSibling = sortedItems.find(({ id }) => id === parentId);
          }

          if (previousSibling) {
            announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
          }
        }
      }

      return announcement;
    }

    return;
  }
}
