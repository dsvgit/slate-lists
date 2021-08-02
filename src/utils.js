import { nanoid } from "nanoid";
import { useState } from "react";
import { clone } from "ramda";
import { Node } from "slate";
import crawl from "tree-crawl";
import yaml from "js-yaml";

export const makeNodeId = () => nanoid(16);

const castArray = (array) => {
  return Array.isArray(array) ? array : [array];
};

const castChild = (element) => {
  return typeof element === "string" ? { text: element } : element;
};

export const createElement = (type, _children = "", rest) => {
  const children = castArray(_children).map(castChild);

  return {
    id: makeNodeId(),
    type,
    children,
    ...rest,
  };
};

export const mapSlateDebugValue = (v) => {
  const c = { children: clone(v) };
  const entries = new WeakMap(Node.nodes(c));
  crawl(c, (node) => {
    const { children } = node;
    const path = entries.get(node);
    node.path = path.join(", ");
    delete node.children;
    node.children = children;
  });
  return yaml.dump(c.children);
};

export const useSlateDebugValue = () => {
  const [debugValue, _setDebugValue] = useState(null);
  const setDebugValue = (v) => {
    _setDebugValue(mapSlateDebugValue(v));
  };

  return [debugValue, setDebugValue];
};
