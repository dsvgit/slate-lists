import { ELEMENT_PARAGRAPH } from "@udecode/plate";

const castArray = (array) => {
  return Array.isArray(array) ? array : [array];
};

const castChild = (element) => {
  return typeof element === "string" ? { text: element } : element;
};

export const createElement = (type, _children = "") => {
  const children = castArray(_children).map(castChild);

  return {
    id: new Date().getTime(),
    type,
    children
  };
};
