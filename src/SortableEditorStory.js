import React, { useMemo } from "react";
import {
  Plate,
  createReactPlugin,
  createHistoryPlugin,
  createParagraphPlugin,
  createHeadingPlugin,
  createNodeIdPlugin,
  createSoftBreakPlugin,
  ELEMENT_PARAGRAPH,
  ELEMENT_H1,
  useStoreEditorValue,
  useStoreEditorRef,
} from "@udecode/plate";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  useSortable,
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { identity, map, omit } from "ramda";
import { Editor, Transforms } from "slate";
import cn from "classnames";

import { createElement, makeNodeId } from "./utils";

import "./styles.css";

const Heading = (props) => {
  const { attributes, children } = props;

  return <h1 {...attributes}>{children}</h1>;
};

const Paragraph = (props) => {
  const { attributes, children } = props;

  return <p {...attributes}>{children}</p>;
};

const withSortable = (Component) => {
  const ElementWrapper = (props) => {
    const { element, children } = props;
    const { id } = element;

    const test = useSortable({ id, animateLayoutChanges: () => false });

    const {
      isDragging,
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = test;

    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn("draggable", {
          dragging: isDragging,
        })}
        {...omit(["tabIndex", "role"], attributes)}
        {...listeners}
      >
        {children}
      </div>
    );
  };

  const Wrapper = (props) => {
    const { element } = props;

    if (!element) {
      return <Component {...props} />;
    }

    return (
      <ElementWrapper {...props}>
        <Component {...props} />
      </ElementWrapper>
    );
  };

  return Wrapper;
};

const components = map(withSortable, {
  [ELEMENT_H1]: Heading,
  [ELEMENT_PARAGRAPH]: Paragraph,
});

export default function App() {
  const plugins = useMemo(
    () => [
      createReactPlugin(),
      createHistoryPlugin(),
      createParagraphPlugin(),
      createHeadingPlugin(),
      createSoftBreakPlugin(),
      createNodeIdPlugin({ idCreator: makeNodeId }),
    ],
    []
  );

  const editableProps = useMemo(
    () => ({
      placeholder: "Type something...",
    }),
    []
  );

  const initialValue = useMemo(
    () => [
      createElement(ELEMENT_H1, "Heading"),
      createElement(ELEMENT_PARAGRAPH, "paragraph 1"),
      createElement(ELEMENT_PARAGRAPH, "paragraph 2"),
    ],
    []
  );

  const sensors = useSensors(useSensor(PointerSensor));

  const editor = useStoreEditorRef("main");
  const value = useStoreEditorValue("main");

  const handleDragStart = () => {
    document.body.classList.add("dragging");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    document.body.classList.remove("dragging");

    const [entry] = Editor.nodes(editor, {
      at: [],
      match: (node) => {
        return node.id === over.id;
      },
    });

    if (entry) {
      const [overNode, overPath] = entry;

      Transforms.moveNodes(editor, {
        match: (node) => node.id === active.id,
        to: overPath,
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={value || []}
        strategy={verticalListSortingStrategy}
      >
        <Plate
          plugins={plugins}
          components={components}
          editableProps={editableProps}
          initialValue={initialValue}
        />
      </SortableContext>
    </DndContext>
  );
}
