import { arrayMove } from "@dnd-kit/sortable";

export const iOS = /iPad|iPhone|iPod/.test(navigator.platform);

function getDragDepth(offset, indentationWidth) {
  return Math.round(offset / indentationWidth);
}

export const getProjection = (
  items,
  activeId,
  overId,
  dragOffset,
  indentationWidth
) => {
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
    return 0;
  }

  return 0;
};

export const getChildren = (listItems, activeId) => {
  const children = [];
  let index = listItems.findIndex((item) => item.id === activeId);
  const activeItem = listItems[index];

  if (!activeItem) {
    return children;
  }

  while (true) {
    index++;
    const item = listItems[index];
    if (item && item.depth > activeItem.depth) {
      children.push(item);
    } else {
      break;
    }
  }

  return children;
};
