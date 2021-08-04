import { Editor, Transforms } from "slate";
import { ELEMENT_PARAGRAPH } from "@udecode/plate";

import { createElement, isEmptyNode } from "utils";
import { isList } from "todoList/queries";

const makeDeleteBackward = (editor) => {
  const { deleteBackward } = editor;

  return ([node, path]) => {
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
};

export default makeDeleteBackward;
