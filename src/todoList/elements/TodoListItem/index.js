import { ReactEditor, useSlateStatic } from "slate-react";
import { Transforms } from "slate";
import React, {
  useContext,
  forwardRef,
  useRef,
  useEffect,
} from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import classNames from "classnames";
import { useDndContext } from "@dnd-kit/core";

import { ListContext } from "todoList/elements/TodoList";
import Handle from "todoList/elements/TodoListItem/Handle";
import { iOS } from "todoList/utilities";

import styles from "todoList/elements/TodoListItem/TreeItem.module.scss";

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
            <div className="listItemContent">{children}</div>
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
  const rootRef = useRef(null);
  const context = useDndContext();

  useEffect(() => {
    if (context.activeNode && rootRef.current) {
      const clonedElement = context.activeNode.cloneNode(true);
      const content = clonedElement.querySelector(".listItemContent");
      content.innerHTML = content.innerHTML.replaceAll("\n", "<br />"); // line breaks support
      rootRef.current.append(clonedElement);
    } else {
      rootRef.current.innerHTML = "";
    }
  }, [context.activeNode]);

  return <div ref={rootRef} className={styles.clone} />;
};

export default TodoListItem;
