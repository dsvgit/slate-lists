import React, { useState } from "react";
import {
  Plate,
  createReactPlugin,
  createHistoryPlugin,
  createParagraphPlugin,
  createNodeIdPlugin,
  ELEMENT_PARAGRAPH,
  createPlateComponents
} from "@udecode/plate";
import { Editor, Node, Transforms } from "slate";
import { useSlate } from "slate-react";
import {
  ELEMENT_CL,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_UL
} from "./list/defaults";
import yaml from "js-yaml";
import crawl from "tree-crawl";
import { clone } from "ramda";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { createListPlugin } from "./list/createListPlugin";
import { createElement } from "./utils";
import { components } from "./config/components";

import "./styles.css";

const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  createParagraphPlugin(),
  createListPlugin(),
  createNodeIdPlugin()
];

const editableProps = {
  placeholder: "Type something..."
};

const Toolbar = () => {
  const editor = useSlate();

  const handleApply = () => {
    Transforms.mergeNodes(editor, {
      at: [0, 1]
    });
    Transforms.mergeNodes(editor, {
      at: [0, 0, 1]
    });
  };

  const handleApply1 = () => {
    Transforms.wrapNodes(editor, createElement("test"), {
      match: (node) => node.type === ELEMENT_PARAGRAPH,
      at: Editor.range(editor, [])
    });
  };

  const handleApply2 = () => {
    Transforms.moveNodes(editor, {
      match: (node) => node.type === ELEMENT_PARAGRAPH,
      at: [],
      to: [0, 0]
    });
  };

  return <button onClick={handleApply}>apply</button>;
};

export default function App() {
  const [debugValue, setDebugValue] = useState(null);
  const handleChange = (v) => {
    // const c = { children: clone(v) };
    // const entries = new WeakMap(Node.nodes(c));
    // crawl(c, (node) => {
    //   const { children } = node;
    //   const path = entries.get(node);
    //   node.path = path.join(", ");
    //   delete node.children;
    //   node.children = children;
    // });
    // setDebugValue(yaml.dump(c.children));
  };

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <Plate
          plugins={plugins}
          components={components}
          editableProps={editableProps}
          onChange={handleChange}
          // initialValue={[
          //   createElement(ELEMENT_PARAGRAPH),
          //   { type: ELEMENT_OL, children: [{ text: "tes" }] }
          // ]}
          initialValue={[
            createElement(ELEMENT_CL, [
              createElement(ELEMENT_LI, createElement(ELEMENT_PARAGRAPH, "1")),
              createElement(ELEMENT_LI, [
                createElement(ELEMENT_PARAGRAPH, "2"),
                createElement(
                  ELEMENT_CL,
                  createElement(
                    ELEMENT_LI,
                    createElement(ELEMENT_PARAGRAPH, "3")
                  )
                )
              ])
            ])
          ]}
          // initialValue={[
          //   createElement("test"),
          //   createElement(ELEMENT_PARAGRAPH),
          //   createElement(ELEMENT_PARAGRAPH)
          // ]}
        >
          <Toolbar />
          <div className="debug">
            <pre>{debugValue}</pre>
          </div>
        </Plate>
      </DndProvider>
    </div>
  );
}
