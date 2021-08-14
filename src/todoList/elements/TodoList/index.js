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

import { getChildren, getProjection } from "todoList/utilities";
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
    y: transform.y - 4,
  };
};

const TodoList = (props) => {
  const indentationWidth = 30;
  const { attributes, children, element } = props;

  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const listItems = element.children;

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

  const sensorContext = useRef({
    items: listItems,
    offset: offsetLeft,
  });
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    })
  );

  const sortedIds = useMemo(() => listItems.map(({ id }) => id), [listItems]);

  const editor = useSlateStatic();

  useEffect(() => {
    sensorContext.current = {
      items: listItems,
      offset: offsetLeft,
    };
  }, [listItems, offsetLeft]);

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
      modifiers={[adjustTranslate]}
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
            activeChildren,
          }}
        >
          {createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeId && activeItem ? (
                <TodoListItemClone activeChildren={activeChildren} />
              ) : null}
            </DragOverlay>,
            document.body
          )}
          <ul
            style={{
              maxWidth: 500,
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
