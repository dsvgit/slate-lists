import React, { createContext, useMemo, useState } from "react";
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

import { getChildren, getIndexes, getProjection } from "todoList/utilities";
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

const adjustTranslate = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 10,
  };
};

const TodoList = (props) => {
  const indentationWidth = 30;
  const { attributes, children, element } = props;

  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const listItems = element.children;
  const indexes = useMemo(() => getIndexes(listItems), [listItems]);
  const ids = useMemo(() => listItems.map((item) => item.id), [listItems]);

  const activeItem = useMemo(
    () => (activeId ? listItems.find(({ id }) => id === activeId) : null),
    [activeId, listItems]
  );

  const activeChildren = useMemo(
    () => getChildren(listItems, activeId),
    [activeId, listItems]
  );

  const projected =
    activeId && overId
      ? getProjection(listItems, activeId, overId, offsetLeft, indentationWidth)
      : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    })
  );

  const editor = useSlateStatic();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      modifiers={[adjustTranslate]}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ListContext.Provider
          value={{
            activeId,
            projected,
            indentationWidth,
            activeChildren,
            indexes,
          }}
        >
          {createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeId && activeItem ? <TodoListItemClone /> : null}
            </DragOverlay>,
            document.body
          )}
          <ul
            style={{
              maxWidth: 500,
            }}
            {...attributes}
          >
            {children}
          </ul>
        </ListContext.Provider>
      </SortableContext>
    </DndContext>
  );

  function handleDragStart({ active }) {
    const activeId = active.id;

    setActiveId(activeId);
    setOverId(activeId);

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

      moveListNode(editor, {
        listItems,
        activeId: active.id,
        overId: over.id,
        depth,
      });
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);

    document.body.classList.remove("dragging");
  }
};

export default TodoList;
