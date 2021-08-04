import { ELEMENT_TODO_LIST, ELEMENT_TODO_LIST_ITEM } from "todoList/defaults";

export const isList = (node) => node.type === ELEMENT_TODO_LIST;
export const isListItem = (node) => node.type === ELEMENT_TODO_LIST_ITEM;
