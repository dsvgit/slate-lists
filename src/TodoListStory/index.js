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

import { createElement, makeNodeId, mapSlateDebugValue } from "utils";
import { ELEMENT_TODO_LIST, ELEMENT_TODO_LIST_ITEM } from "todoList/defaults";
import TodoList from "todoList/elements/TodoList";
import TodoListItem from "todoList/elements/TodoListItem";
import { createTodoListPlugin } from "todoList/createTodoListPlugin";
import { listTypes } from "todoList/constants";
import { Transforms } from "slate";
import { isListItem } from "todoList/queries";

const Heading = (props) => {
  const { attributes, children } = props;

  return <h1 {...attributes}>{children}</h1>;
};

const Paragraph = (props) => {
  const { attributes, children } = props;

  return <p {...attributes}>{children}</p>;
};

const components = {
  [ELEMENT_H1]: Heading,
  [ELEMENT_PARAGRAPH]: Paragraph,
  [ELEMENT_TODO_LIST]: TodoList,
  [ELEMENT_TODO_LIST_ITEM]: TodoListItem,
};

const Toolbar = ({ editor }) => {
  return (
    <div>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          console.log("test");
          Transforms.setNodes(
            editor,
            { listType: listTypes.bulleted, checked: false },
            { match: isListItem }
          );
        }}
      >
        Bulleted
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          console.log("test");
          Transforms.setNodes(
            editor,
            { listType: listTypes.numbered, checked: false },
            { match: isListItem }
          );
        }}
      >
        Numbered
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          console.log("test");
          Transforms.setNodes(
            editor,
            { listType: listTypes.todoList },
            { match: isListItem }
          );
        }}
      >
        Todo
      </button>
    </div>
  );
};

export default function App() {
  const plugins = useMemo(
    () => [
      createReactPlugin(),
      createHistoryPlugin(),
      createParagraphPlugin(),
      createHeadingPlugin(),
      createSoftBreakPlugin(),
      createTodoListPlugin(),
      createNodeIdPlugin({ idCreator: makeNodeId }),
    ],
    []
  );

  const editableProps = useMemo(
    () => ({
      placeholder: "Type something...",
      spellCheck: true,
    }),
    []
  );

  const initialValue = useMemo(
    () => [
      createElement(ELEMENT_TODO_LIST, [
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Home"),
          { listType: listTypes.todoList, depth: 0 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Collections"),
          { listType: listTypes.todoList, depth: 0 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Spring"),
          { listType: listTypes.numbered, depth: 1 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Summer"),
          { listType: listTypes.numbered, depth: 1 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Fall"),
          { listType: listTypes.numbered, depth: 1 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Winter"),
          { listType: listTypes.numbered, depth: 1 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "About Us"),
          { listType: listTypes.todoList, depth: 0 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "My Account"),
          { listType: listTypes.todoList, depth: 0 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Addresses"),
          { listType: listTypes.numbered, depth: 1 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Order History"),
          { listType: listTypes.numbered, depth: 1 }
        ),
      ]),
    ],
    []
  );

  const editor = useStoreEditorRef("main");
  const value = useStoreEditorValue("main");

  const debugValue = useMemo(() => {
    return value && mapSlateDebugValue(value);
  }, [value]);

  return (
    <div>
      <Toolbar editor={editor} />
      <Plate
        plugins={plugins}
        components={components}
        editableProps={editableProps}
        initialValue={initialValue}
      />
      {/*<div className="debug">*/}
      {/*  <pre>{debugValue}</pre>*/}
      {/*</div>*/}
    </div>
  );
}
