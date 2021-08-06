import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSlateStatic } from "slate-react";
import { reduce, max, range } from "ramda";

import { getProjection, removeChildrenOf } from "todoList/utilities";
import { TodoListItemClone } from "todoList/elements/TodoListItem";
import { moveListNode } from "todoList/transforms";

import "todoList/index.css";

export const ListContext = createContext();

const dropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

const MeasuringStrategy = {
  Always: 0,
  BeforeDragging: 1,
  WhileDragging: 2,
};

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const TodoList = (props) => {
  const indentationWidth = 20;
  const { attributes, children, element } = props;

  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(null);

  const flattenedItems = useMemo(() => {
    return removeChildrenOf(element.children, activeId ? [activeId] : []);
  }, [activeId]);

  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    })
  );

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems]
  );

  const editor = useSlateStatic();

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const maxDepth = reduce(
    max,
    0,
    element.children.map((item) => item.depth)
  );

  const getCountersToReset = (id) => {
    const index = element.children.findIndex((x) => x.id === id);

    if (index !== -1) {
      const currentDepth = element.children[index].depth;
      const prevDepth = element.children[index - 1]?.depth || 0;

      if (currentDepth < prevDepth) {
        return range(currentDepth + 1, maxDepth + 1)
          .map((x) => `counter-${x}`)
          .join(" ");
      }
    }

    return null;
  };

  return (
    <DndContext
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
        <ListContext.Provider
          value={{
            activeId,
            projected,
            indentationWidth,
            maxDepth,
            getCountersToReset,
          }}
        >
          {createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeId && activeItem ? (
                <TodoListItemClone activeItem={activeItem} />
              ) : null}
            </DragOverlay>,
            document.body
          )}
          <ul
            style={{
              "--init-counters": range(0, maxDepth + 1)
                .map((x) => `counter-${x}`)
                .join(" "),
            }}
            {...attributes}
          >
            {children}
          </ul>
        </ListContext.Provider>
      </SortableContext>
    </DndContext>
  );

  function handleDragStart({ active: { id: activeId } }) {
    setActiveId(activeId);
    setOverId(activeId);

    const activeItem = flattenedItems.find(({ id }) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        overId: activeId,
      });
    }

    document.body.classList.add("dragging");
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
      const { depth } = projected;

      moveListNode(editor, { activeId: active.id, overId: over.id, depth });
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

    document.body.classList.remove("dragging");
  }
};

export default TodoList;
