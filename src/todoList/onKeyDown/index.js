import isHotkey from "is-hotkey";
import { Editor } from "slate";

import { moveItemsBack, moveItemsForward } from "todoList/transforms";
import { isListItem } from "todoList/queries";

const onKeyDown = (editor) => (e) => {
  if (isHotkey(["tab", "shift+tab"], e)) {
    const [entry] = Editor.nodes(editor, { match: isListItem });

    entry && e.preventDefault();
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
        moveItemsForward(editor, entry, prevNode.depth + 1);
      }
    }
  }

  if (isHotkey("shift+tab", e)) {
    const entries = Editor.nodes(editor, { match: isListItem });
    for (const entry of entries) {
      moveItemsBack(editor, entry);
    }
  }

  if (isHotkey("shift+down", e)) {
    const entries = Editor.nodes(editor, { match: isListItem });
    for (const entry of entries) {
      moveItemsBack(editor, entry);
    }
  }
};

export default onKeyDown;
