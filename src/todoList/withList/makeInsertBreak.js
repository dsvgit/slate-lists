import { Editor, Range, Transforms } from "slate";
import { isEmptyNode } from "list/utils";
import { ELEMENT_PARAGRAPH } from "@udecode/plate";

const makeInsertBreak = (editor) => {
  const { insertBreak } = editor;

  return () => {
    const [entry] = Editor.nodes(editor, { match: isListItem, mode: "lowest" });

    if (entry) {
      const [node] = entry;

      if (isEmptyNode(node)) {
        if (node.depth > 0) {
          moveItemsBack(editor, entry);
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
};

export default makeInsertBreak;
