import { Editor, Transforms } from "slate";
import { getChildren } from "todoList/utilities";

export const moveListNode = (
  editor,
  { listItems, activeId, overId, depth }
) => {
  const [overEntry] = Editor.nodes(editor, {
    at: [],
    match: (node) => {
      return node.id === overId;
    },
  });

  if (overEntry) {
    const activeItem = listItems.find((item) => item.id === activeId);
    const activeChildrenIds = getChildren(listItems, activeId).map(
      (item) => item.id
    );
    const isActiveItem = (node) => node.id === activeId;
    const isActiveChild = (node) => activeChildrenIds.includes(node.id);

    const [, overPath] = overEntry;

    if (activeItem.depth !== depth) {
      updateNodes(editor, [activeId, ...activeChildrenIds], (node) => {
        const diff = activeItem.depth - depth;
        return { depth: node.depth - diff };
      });
    }

    if (activeItem.id !== overId) {
      Transforms.moveNodes(editor, {
        at: [],
        match: (node) => isActiveItem(node) || isActiveChild(node),
        to: overPath,
      });
    }
  }
};

export const moveItemsForward = (editor, entry, maxDepth) => {
  const [node, path] = entry;

  Transforms.setNodes(
    editor,
    { depth: Math.min(maxDepth, node.depth + 1) },
    { at: path }
  );
};

export const moveItemsBack = (editor, entry) => {
  const [node, path] = entry;

  Transforms.setNodes(
    editor,
    { depth: Math.max(0, node.depth - 1) },
    { at: path }
  );
};

const hasId = (id) => (node) => node.id === id;
const hasIds = (ids) => (node) => ids.includes(node.id);

const updateNodes = (editor, ids, updateFn) => {
  const entries = Editor.nodes(editor, { at: [], match: hasIds(ids) });
  for (let [node] of entries) {
    Transforms.setNodes(editor, updateFn(node), {
      at: [],
      match: hasId(node.id),
    });
  }
};
