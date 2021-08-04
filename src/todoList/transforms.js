import { Editor, Transforms } from "slate";

export const moveListNode = (editor, { activeId, overId, depth }) => {
  const [entry] = Editor.nodes(editor, {
    at: [],
    match: (node) => {
      return node.id === overId;
    },
  });

  if (entry) {
    const [, overPath] = entry;

    Transforms.setNodes(
      editor,
      { depth },
      {
        at: [],
        match: (node) => {
          return node.id === activeId;
        },
      }
    );

    Transforms.moveNodes(editor, {
      at: [],
      match: (node) => node.id === activeId,
      to: overPath,
    });
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

export const moveItemsDown = () => {

}
