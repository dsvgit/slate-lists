import { ELEMENT_TODO_LIST, ELEMENT_TODO_LIST_ITEM } from "todoList/defaults";
import { Editor } from "slate";

export const isList = (node) => node.type === ELEMENT_TODO_LIST;
export const isListItem = (node) => node.type === ELEMENT_TODO_LIST_ITEM;

export const getPreviousEntry = (editor, [node, path]) => {
  const previousEntry = Editor.previous(editor, {
    at: path,
    match: isListItem, // check if it is a list
  });

  return previousEntry;
};

export const getNextEntry = (editor, [node, path]) => {
  const nextEntry = Editor.next(editor, {
    at: path,
    match: isListItem, // check if it is a list
  });

  return nextEntry;
};
