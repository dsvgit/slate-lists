import { ELEMENT_PARAGRAPH } from "@udecode/plate";
import { last } from "ramda";
import { Transforms, Editor, Node, Path, Range } from "slate";

import { ELEMENT_UL, ELEMENT_OL, ELEMENT_CL, ELEMENT_LI } from "./defaults";
import { createElement } from "../utils";

export const isList = (node) =>
  [ELEMENT_UL, ELEMENT_OL, ELEMENT_CL].includes(node.type);
export const isListItem = (node) => node.type === ELEMENT_LI;

export const isEmptyNode = (node) => node && Node.string(node) === "";

export const createList = (listType) =>
  createElement(listType, createListItem());
export const createListItem = (children = createElement(ELEMENT_PARAGRAPH)) =>
  createElement(ELEMENT_LI, children);

const isCursorAtEnd = (editor, path) =>
  Range.includes(editor.selection, Editor.end(editor, path));
export const isCursorAtStart = (editor, path) =>
  Range.includes(editor.selection, Editor.start(editor, path));
const isFirstChild = (path) => last(path) === 0;
const previousNode = (editor, path) => Editor.node(editor, Path.previous(path));
const lastChild = (node, path) => [
  last(node.children),
  [...path, node.children.length - 1]
];

export const moveListItemDown = (editor, entry) => {
  if (entry) {
    const [node, path] = entry;
    const ancestorEntry = Editor.above(editor, {
      match: isListItem,
      at: path
    });

    if (!ancestorEntry) {
      return;
    }

    const [parent, parentPath] = Editor.parent(editor, path);
    const listType = parent.type;
    const hasSiblings = parent.children.length > 1;
    const hasSiblingsAfter = last(path) < parent.children.length - 1;
    const hasSiblingsBefore = last(path) > 0;

    const [, ancestorPath] = ancestorEntry;

    const dest = Path.next(ancestorPath);
    const [sublist, sublistPath] = lastChild(node, path);
    const hasSublist = isList(sublist);

    if (hasSiblingsAfter) {
      if (hasSublist) {
        // move node inside sublist if already exists
        const [, sublistLastChildPath] = lastChild(sublist, sublistPath);
        Transforms.moveNodes(editor, {
          match: (_node, _path) => {
            const result =
              isListItem(_node) &&
              Path.isSibling(path, _path) &&
              Path.isAfter(_path, path);
            return result;
          },
          at: parentPath,
          to: Path.next(sublistLastChildPath)
        });
      } else {
        // create sublist based on current list item
        const dest = Path.next(sublistPath);
        Transforms.moveNodes(editor, {
          match: (_node, _path) => {
            const result =
              Path.isSibling(path, _path) && Path.isAfter(_path, path);

            return result;
          },
          at: parentPath,
          to: dest
        });
        Transforms.wrapNodes(editor, createElement(listType), {
          match: (_node, _path) => {
            const firstChildPath = [...path, 0];
            const result =
              Path.isSibling(firstChildPath, _path) &&
              Path.isAfter(_path, firstChildPath);
            return result;
          },
          at: path
        });
      }
    }

    Transforms.moveNodes(editor, {
      at: path,
      to: dest
    });

    if (!hasSiblingsBefore) {
      // clean list element if list item was last there
      Transforms.removeNodes(editor, { at: parentPath });
    }
  }
};

export const moveListItemUp = (editor, entry) => {
  if (entry) {
    const [, path] = entry;
    const [{ type: listType }] = Editor.parent(editor, path);

    if (isFirstChild(path)) {
      return;
    }

    const [prevNode, prevPath] = previousNode(editor, path);

    const [sublist, sublistPath] = lastChild(prevNode, prevPath);
    const hasSublist = isList(sublist);

    if (hasSublist) {
      // move node inside sublist if already exists
      const [, sublistLastChildPath] = lastChild(sublist, sublistPath);
      Transforms.moveNodes(editor, {
        at: path,
        to: Path.next(sublistLastChildPath)
      });
    } else {
      // create sublist based on current list item
      const dest = Path.next(sublistPath);
      Transforms.moveNodes(editor, {
        at: path,
        to: dest
      });
      Transforms.wrapNodes(editor, createElement(listType), {
        at: dest
      });
    }
  }
};
