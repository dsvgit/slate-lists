import { ELEMENT_PARAGRAPH, getRenderElement } from "@udecode/plate";
import isHotkey from "is-hotkey";
import { Transforms, Editor, Range, Path } from "slate";
import {
  ELEMENT_TODO_LIST,
  ELEMENT_TODO_LIST_ITEM,
  KEYS_LIST,
} from "./defaults";
import { isEmptyNode } from "list/utils";
import { createElement } from "utils";

const isList = (node) => node.type === ELEMENT_TODO_LIST;
const isListItem = (node) => node.type === ELEMENT_TODO_LIST_ITEM;

const moveItemUp = (editor, entry, maxDepth) => {
  const [node, path] = entry;

  Transforms.setNodes(
    editor,
    { depth: Math.min(maxDepth, node.depth + 1) },
    { at: path }
  );
};

const moveItemDown = (editor, entry) => {
  const [node, path] = entry;

  Transforms.setNodes(
    editor,
    { depth: Math.max(0, node.depth - 1) },
    { at: path }
  );
};

const withList = (editor) => {
  const { normalizeNode, insertBreak, deleteBackward } = editor;

  editor.insertBreak = () => {
    const [entry] = Editor.nodes(editor, { match: isListItem, mode: "lowest" });

    if (entry) {
      const [node] = entry;

      if (isEmptyNode(node)) {
        if (node.depth > 0) {
          moveItemDown(editor, entry);
          return;
        } else {
          // turn list item into paragraph if it is empty
          Transforms.setNodes(editor, { type: ELEMENT_PARAGRAPH });
          Transforms.unwrapNodes(editor, { match: isListItem });
          Transforms.unwrapNodes(editor, { match: isList, split: true });
          return;
        }
      }

      // handle operations in list item level instead of its children
      if (Range.isCollapsed(editor.selection)) {
        Transforms.splitNodes(editor, { match: isListItem, always: true });
        return;
      }
    }

    insertBreak();
  };

  editor.normalizeNode = ([node, path]) => {
    normalizeNode([node, path]);
  };

  editor.deleteBackward = ([node, path]) => {
    const [listEntry] = Editor.nodes(editor, { match: isList });

    if (listEntry) {
      const [node, path] = listEntry;
      if (isEmptyNode(editor, node)) {
        // remove whole list if it is empty and put paragraph instead
        Transforms.removeNodes(editor, { at: path });
        Transforms.insertNodes(editor, createElement(ELEMENT_PARAGRAPH));
        return;
      }
    }

    deleteBackward([node, path]);
  };

  return editor;
};

const onKeyDown = (editor) => (e) => {
  if (isHotkey(["tab", "shift+tab"], e)) {
    const [entry] = Editor.nodes(editor, { match: isListItem });
    if (entry) {
      e.preventDefault();
    }
  }

  if (isHotkey("tab", e)) {
    const entries = Array.from(Editor.nodes(editor, { match: isListItem }));

    const [firstEntry] = entries;
    if (firstEntry) {
      const [, path] = firstEntry;
      const [prevNode] =
        Editor.previous(editor, {
          at: path,
          match: isListItem, // check if it is the first item in a list
        }) || [];

      if (!prevNode) {
        return;
      }

      for (const entry of entries) {
        moveItemUp(editor, entry, prevNode.depth + 1);
      }
    }
  }

  if (isHotkey("shift+tab", e)) {
    const entries = Editor.nodes(editor, { match: isListItem });
    for (const entry of entries) {
      moveItemDown(editor, entry);
    }
  }
};

export const createTodoListPlugin = () => {
  return {
    pluginKeys: KEYS_LIST,
    renderElement: getRenderElement(KEYS_LIST),
    onKeyDown,
    withOverrides: withList,
  };
};
