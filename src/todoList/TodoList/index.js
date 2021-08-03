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
import { Editor, Transforms } from "slate";
import { useSlateStatic } from "slate-react";

import { getProjection, removeChildrenOf } from "../utilities";
import { TodoListItemClone } from "todoList/TodoListItem";

import "../index.css";

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
  const sensors = useSensors(useSensor(PointerSensor));

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
        <ListContext.Provider value={{ activeId, projected, indentationWidth }}>
          {createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeId && activeItem ? (
                <TodoListItemClone activeItem={activeItem} />
              ) : null}
            </DragOverlay>,
            document.body
          )}
          <ul {...attributes}>{children}</ul>
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

      const [entry] = Editor.nodes(editor, {
        at: [],
        match: (node) => {
          return node.id === over.id;
        },
      });

      if (entry) {
        const [overNode, overPath] = entry;

        Transforms.setNodes(
          editor,
          { depth },
          {
            at: [],
            match: (node) => {
              return node.id === active.id;
            },
          }
        );

        Transforms.moveNodes(editor, {
          at: [],
          match: (node) => node.id === active.id,
          to: overPath,
        });
      }
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
