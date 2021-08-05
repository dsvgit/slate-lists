import isHotkey from "is-hotkey";
import { Editor, Transforms } from "slate";
import { head, last } from "ramda";

import { moveItemsBack, moveItemsForward } from "todoList/transforms";
import { getNextEntry, getPreviousEntry, isListItem } from "todoList/queries";

const onKeyDown = (editor) => (e) => {
  if (isHotkey(["tab", "shift+tab"], e)) {
    const [entry] = Editor.nodes(editor, { match: isListItem });

    if (entry) {
      e.preventDefault();
    }
  }

  if (isHotkey(["opt+down", "opt+up", "opt+left", "opt+right"], e)) {
    const [entry] = Editor.nodes(editor, { match: isListItem });

    if (entry) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  if (isHotkey(["tab", "opt+right"], e)) {
    const entries = Array.from(Editor.nodes(editor, { match: isListItem }));

    const [firstEntry] = entries;
    if (firstEntry) {
      const prevEntry = getPreviousEntry(editor, firstEntry);

      if (prevEntry) {
        const [prevNode] = prevEntry;
        for (const entry of entries) {
          moveItemsForward(editor, entry, prevNode.depth + 1);
        }
      }
    }
  }

  if (isHotkey(["shift+tab", "opt+left"], e)) {
    const entries = Editor.nodes(editor, { match: isListItem });
    for (const entry of entries) {
      moveItemsBack(editor, entry);
    }
  }

  if (isHotkey("opt+up", e)) {
    const entries = Array.from(Editor.nodes(editor, { match: isListItem }));
    const firstEntry = head(entries);

    if (firstEntry) {
      const prevEntry = getPreviousEntry(editor, firstEntry);

      if (prevEntry) {
        const [, path] = prevEntry;

        Transforms.moveNodes(editor, {
          match: isListItem,
          to: path,
        });
      }
    }
  }

  if (isHotkey("opt+down", e)) {
    const entries = Array.from(Editor.nodes(editor, { match: isListItem }));
    const firstEntry = head(entries);
    const lastEntry = last(entries);

    if (lastEntry) {
      const nextEntry = getNextEntry(editor, lastEntry);

      if (nextEntry) {
        const [, path] = nextEntry;
        const [, firstEntryPath] = firstEntry;

        Transforms.moveNodes(editor, {
          at: path,
          match: isListItem,
          to: firstEntryPath,
        });
      }
    }
  }
};

export default onKeyDown;
