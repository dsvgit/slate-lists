import React, {useDebugValue, useState} from "react";
import {
  Plate,
  createReactPlugin,
  createHistoryPlugin,
  createParagraphPlugin,
  createNodeIdPlugin,
  ELEMENT_PARAGRAPH,
  createPlateComponents
} from "@udecode/plate";
import { Editor, Node } from "slate";
import { useSlate } from "slate-react";
import yaml from "js-yaml";
import crawl from "tree-crawl";
import { clone } from "ramda";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import {createElement, useSlateDebugValue} from "./utils";
import { components } from "./config/components";

import "./styles.css";

const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  createParagraphPlugin(),
  createNodeIdPlugin()
];

const editableProps = {
  placeholder: "Type something..."
};

const Toolbar = () => {
  const editor = useSlate();

  const handleApply = () => {
  };

  return <button onClick={handleApply}>apply</button>;
};

export default function App() {
  const [debugValue, setDebugValue] = useSlateDebugValue();

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <Plate
          plugins={plugins}
          components={components}
          editableProps={editableProps}
          onChange={setDebugValue}
          initialValue={[
            createElement(ELEMENT_PARAGRAPH),
            createElement(ELEMENT_PARAGRAPH)
          ]}
        >
          <Toolbar />
          <div className="debug">
            <pre>{debugValue}</pre>
          </div>
        </Plate>
    </div>
  );
}
