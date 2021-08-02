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
import TodoList from "todoList/TodoList";
import TodoListItem from "todoList/TodoListItem";
import { createTodoListPlugin } from "todoList/createTodoListPlugin";

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
          { depth: 0 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Collections"),
          { depth: 0 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Spring"),
          { depth: 1 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Summer"),
          { depth: 1 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Fall"),
          { depth: 1 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Winter"),
          { depth: 1 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "About Us"),
          { depth: 0 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "My Account"),
          { depth: 0 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Addresses"),
          { depth: 1 }
        ),
        createElement(
          ELEMENT_TODO_LIST_ITEM,
          createElement(ELEMENT_PARAGRAPH, "Order History"),
          { depth: 1 }
        ),
      ]),
    ],
    []
  );

  const editor = useStoreEditorRef("main");
  const value = useStoreEditorValue("main");

  // const debugValue = useMemo(() => {
  //   return value && mapSlateDebugValue(value);
  // }, [value]);

  return (
    <div>
      <Plate
        plugins={plugins}
        components={components}
        editableProps={editableProps}
        initialValue={initialValue}
      />
    </div>
  );
}
