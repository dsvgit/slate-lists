import { ELEMENT_PARAGRAPH, getRenderElement } from "@udecode/plate";
import isHotkey from "is-hotkey";
import { Transforms, Editor, Range, Path } from "slate";
import {
  moveListItemDown,
  moveListItemUp,
  isList,
  isListItem,
  isEmptyNode,
  createList,
  isCursorAtStart
} from "./utils";
import { ELEMENT_UL, ELEMENT_OL, KEYS_LIST } from "./defaults";
import { createElement } from "../utils";
import { last } from "ramda";

const withList = (editor) => {
  const { normalizeNode, insertBreak, deleteBackward } = editor;

  editor.insertBreak = () => {
    const [entry] = Editor.nodes(editor, { match: isListItem, mode: "lowest" });
    if (entry) {
      const [node, path] = entry;

      const ancestorEntry = Editor.above(editor, {
        match: isListItem,
        at: path
      });

      if (isEmptyNode(node)) {
        if (ancestorEntry) {
          moveListItemDown(editor, entry);
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
      } else {
        editor.deleteFragment();
        editor.insertBreak();
        return;
      }
    }

    insertBreak();
  };

  editor.normalizeNode = ([node, path]) => {
    if (isList(node)) {
    }

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

    const [listItemEntry] = Editor.nodes(editor, { match: isListItem });

    if (listItemEntry) {
      const [node, path] = listItemEntry;

      if (isCursorAtStart(editor, path) && last(path) > 0) {
        Transforms.mergeNodes(editor, { at: path });
        // Transforms.mergeNodes(editor, { at: [...Path.previous(path)] });
        return;
      }
    }

    deleteBackward([node, path]);
  };

  return editor;
};

const onKeyDown = (editor) => (e) => {
  if (isHotkey("alt+mod+7", e)) {
    Transforms.insertNodes(editor, createList(ELEMENT_OL));
  }

  if (isHotkey("alt+mod+8", e)) {
    Transforms.insertNodes(editor, createList(ELEMENT_UL));
  }

  if (isHotkey(["tab", "shift+tab"], e)) {
    const [nodes] = Editor.nodes(editor, { match: isListItem });
    if (nodes) {
      e.preventDefault();
    }
  }

  if (isHotkey("tab", e)) {
    if (Range.isExpanded(editor.selection)) {
      return;
    }

    const [entry] = Editor.nodes(editor, { match: isListItem, mode: "lowest" });
    moveListItemUp(editor, entry);
  }

  if (isHotkey("shift+tab", e)) {
    if (Range.isExpanded(editor.selection)) {
      return;
    }

    const [entry] = Editor.nodes(editor, { match: isListItem, mode: "lowest" });
    moveListItemDown(editor, entry);
  }
};

export const createListPlugin = () => {
  return {
    pluginKeys: KEYS_LIST,
    renderElement: getRenderElement(KEYS_LIST),
    onKeyDown,
    withOverrides: withList
  };
};
