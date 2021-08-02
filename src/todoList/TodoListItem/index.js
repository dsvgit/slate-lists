import { ReactEditor, useSlate } from "slate-react";
import { Transforms } from "slate";
import React, { useContext } from "react";
import TreeItem from "todoList/TodoListItem/TreeItem";
import { ListContext } from "todoList/TodoList";
import SortableTreeItem from "todoList/TodoListItem/SortableTreeItem";

const TodoListItem = (props) => {
  const { attributes, children, element, clone } = props;
  const { id, checked, depth } = element || {};
  const editor = useSlate();

  const { indentationWidth, activeId, projected } =
    useContext(ListContext) || {};

  const handleCheck = (e) => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { checked: e.target.checked }, { at: path });
  };

  const content = (
    <div
      className="listItem"
      // style={{ marginLeft: (depth + 1) * 20 }}
      {...attributes}
    >
      <div contentEditable={false} className="input">
        <input type="checkbox" checked={checked} onChange={handleCheck} />
      </div>
      {children}
    </div>
  );

  return clone ? (
    <TreeItem id={id} depth={props.depth} indentationWidth={indentationWidth}>
      {content}
    </TreeItem>
  ) : (
    <SortableTreeItem
      id={id}
      depth={id === activeId && projected ? projected.depth : depth}
      indentationWidth={indentationWidth}
    >
      {content}
    </SortableTreeItem>
  );
};

export default TodoListItem;
