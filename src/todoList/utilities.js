import { arrayMove } from "@dnd-kit/sortable";

export const iOS = /iPad|iPhone|iPod/.test(navigator.platform);

function getDragDepth(offset, indentationWidth) {
  return Math.round(offset / indentationWidth);
}

export const getProjection = (
  listItems,
  activeId,
  overId,
  dragOffset,
  indentationWidth
) => {
  const children = getChildren(listItems, activeId);
  const items = listItems.filter(
    (item) => !children.map((item) => item.id).includes(item.id)
  );
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = getMaxDepth({
    previousItem,
  });
  const minDepth = getMinDepth({ nextItem });
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, maxDepth, minDepth };
};

const getMaxDepth = ({ previousItem }) => {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
};

const getMinDepth = ({ nextItem }) => {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
};

export const getChildren = (listItems, itemId) => {
  const children = [];
  let index = listItems.findIndex((item) => item.id === itemId);
  const targetItem = listItems[index];

  if (!targetItem) {
    return children;
  }

  while (true) {
    index++;
    const item = listItems[index];
    if (item && item.depth > targetItem.depth) {
      children.push(item);
    } else {
      return children;
    }
  }
};

export const getParentIndex = (listItems, itemId) => {
  let index = listItems.findIndex((item) => item.id === itemId);
  const targetItem = listItems[index];

  while (true) {
    index--;

    if (index < 0) {
      return null;
    }

    const item = listItems[index];
    if (item && item.depth < targetItem.depth) {
      return index;
    }
  }
};
