import { ReactEditor, useSlateStatic } from "slate-react";
import { Transforms } from "slate";
import React, { useContext, forwardRef, useRef, useEffect } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import classNames from "classnames";
import { useDndContext } from "@dnd-kit/core";

import { ListContext } from "todoList/elements/TodoList";
import { iOS } from "todoList/utilities";
import { listTypes } from "todoList/constants";

import styles from "./index.module.scss";

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
    listType,
    index,
  } = props;

  return (
    <li
      className={classNames(
        styles.wrapper,
        ghost && styles.ghost,
        styles.indicator,
        disableSelection && styles.disableSelection,
        disableInteraction && styles.disableInteraction
      )}
      ref={wrapperRef}
      style={{
        "--spacing": `${indentationWidth * depth}px`,
        "--counter-content": `"${index}."`,
      }}
    >
      <div className={styles.treeItem} ref={ref} style={style}>
        <div className={styles.text} {...attributes}>
          <div
            contentEditable={false}
            {...handleProps}
            className={styles.handle}
          >
            {listType === listTypes.todoList && (
              <input
                {...handleProps}
                className={styles.checkbox}
                type="checkbox"
                checked={checked}
                onChange={onCheck}
              />
            )}
            {listType === listTypes.numbered && (
              <div className={styles.counter} />
            )}
            {listType === listTypes.bulleted && (
              <div className={styles.bullet} />
            )}
          </div>

          <div data--item-content={true}>{children}</div>
        </div>
      </div>
    </li>
  );
});

const animateLayoutChanges = ({ isSorting, wasSorting }) => {
  return false;
  // return isSorting || wasSorting ? false : true;
};

const TodoListItem = (props) => {
  const { element, children } = props;
  const { id, checked, listType } = element;

  const editor = useSlateStatic();

  const handleCheck = (e) => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { checked: e.target.checked }, { at: path });
  };

  const { indentationWidth, activeId, projected, activeChildren, indexes } =
    useContext(ListContext) || {};
  const index = indexes[id];

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

  const depth = id === activeId && projected ? projected.depth : element.depth;

  if (activeChildren.includes(element)) {
    return null;
  }

  return (
    <TodoListItemBase
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={depth}
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
      listType={listType}
      index={index}
    >
      {children}
    </TodoListItemBase>
  );
};

export const TodoListItemClone = () => {
  const rootRef = useRef(null);
  const context = useDndContext();

  const { activeChildren } = useContext(ListContext) || {};

  useEffect(() => {
    if (context.activeNode && rootRef.current) {
      const clonedElement = context.activeNode.cloneNode(true);
      const content = clonedElement.querySelector("[data--item-content]");
      content.innerHTML = content.innerHTML.replaceAll("\n", "<br />"); // line breaks support
      rootRef.current.append(clonedElement);
    } else {
      rootRef.current.innerHTML = "";
    }
  }, [context.activeNode]);

  return (
    <div
      ref={rootRef}
      className={styles.clone}
      style={{
        "--children-count":
          context.activeNode && activeChildren.length
            ? `"${activeChildren.length + 1}"`
            : "",
      }}
    />
  );
};

export default TodoListItem;
