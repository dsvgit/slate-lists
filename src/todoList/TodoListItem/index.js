import { ReactEditor, useSlateStatic } from "slate-react";
import { Transforms } from "slate";
import React, { useContext, forwardRef, useMemo } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import classNames from "classnames";

import { ListContext } from "todoList/TodoList";
import Handle from "todoList/TodoListItem/Handle";
import { iOS } from "todoList/utilities";

import styles from "todoList/TodoListItem/TreeItem.module.scss";
import { useDndContext } from "@dnd-kit/core";

const TodoListItemBase = forwardRef((props, ref) => {
  const {
    attributes,
    children,
    depth,
    checked,
    onCheck,
    indentationWidth,
    wrapperRef,
    ghost,
    disableSelection,
    disableInteraction,
    handleProps,
    style,
  } = props;

  return (
    <li
      className={classNames(
        styles.Wrapper,
        ghost && styles.ghost,
        disableSelection && styles.disableSelection,
        disableInteraction && styles.disableInteraction
      )}
      ref={wrapperRef}
      style={{
        "--spacing": `${indentationWidth * depth}px`,
      }}
    >
      <div className={styles.TreeItem} ref={ref} style={style}>
        <Handle {...handleProps} />
        <div className={styles.Text}>
          <div className="listItem" {...attributes}>
            <div contentEditable={false} className="input">
              <input type="checkbox" checked={checked} onChange={onCheck} />
            </div>
            {children}
          </div>
        </div>
      </div>
    </li>
  );
});

const animateLayoutChanges = ({ isSorting, wasSorting }) =>
  isSorting || wasSorting ? false : true;

const TodoListItem = (props) => {
  const { element, children } = props;
  const { id, depth, checked } = element;

  const editor = useSlateStatic();

  const handleCheck = (e) => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { checked: e.target.checked }, { at: path });
  };

  const { indentationWidth, activeId, projected } =
    useContext(ListContext) || {};

  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <TodoListItemBase
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={id === activeId && projected ? projected.depth : depth}
      indentationWidth={indentationWidth}
      ghost={isDragging}
      disableSelection={iOS}
      disableInteraction={isSorting}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      attributes={props.attributes}
      checked={checked}
      onCheck={handleCheck}
    >
      {children}
    </TodoListItemBase>
  );
};

export const TodoListItemClone = () => {
  const context = useDndContext();

  const html = useMemo(() => {
    if (!context.activeNode) {
      return;
    }
    return context.activeNode.outerHTML;
  }, [context.activeNode]);

  if (!html) {
    return null;
  }

  return (
    <div className={styles.clone} dangerouslySetInnerHTML={{ __html: html }} />
  );
};

export default TodoListItem;
