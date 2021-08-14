import { ReactEditor, useSlateStatic } from "slate-react";
import { Transforms } from "slate";
import React, {
  useContext,
  forwardRef,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import classNames from "classnames";
import { useDndContext } from "@dnd-kit/core";

import { ListContext } from "todoList/elements/TodoList";
import Handle from "todoList/elements/TodoListItem/Handle";
import { iOS } from "todoList/utilities";
import { listTypes } from "todoList/constants";

import styles from "todoList/elements/TodoListItem/TreeItem.module.scss";
import "./counters.scss";

const TodoListItemBase = forwardRef((props, ref) => {
  const {
    attributes,
    children,
    depth,
    counterDepth,
    checked,
    onCheck,
    indentationWidth,
    wrapperRef,
    ghost,
    disableSelection,
    disableInteraction,
    handleProps,
    style,
    resetCounters,
    listType,
  } = props;

  return (
    <li
      className={classNames(
        styles.Wrapper,
        ghost && styles.ghost,
        styles.indicator,
        disableSelection && styles.disableSelection,
        disableInteraction && styles.disableInteraction
      )}
      ref={wrapperRef}
      style={{
        "--spacing": `${indentationWidth * depth}px`,
        "--counter": `counter-${counterDepth}`,
        "--reset-counters": resetCounters,
      }}
    >
      <div className={styles.TreeItem} ref={ref} style={style}>
        <div className={styles.Text}>
          <div className="listItem" {...attributes}>
            <Handle {...handleProps}>
              <div className="input">
                {listType === listTypes.todoList && (
                  <input type="checkbox" checked={checked} onChange={onCheck} />
                )}
                {listType === listTypes.numbered && <div className="counter" />}
                {listType === listTypes.bulleted && <div className="bullet" />}
              </div>
            </Handle>
            <div className="listItemContent">{children}</div>
          </div>
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

  const {
    indentationWidth,
    activeId,
    projected,
    getCountersToReset,
    activeChildren,
  } = useContext(ListContext) || {};

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

  const context = useDndContext();

  const depth = id === activeId && projected ? projected.depth : element.depth;
  const counterDepth = useMemo(() => {
    return depth;
  }, [context.active, id]);
  const resetCounters = useMemo(() => {
    return getCountersToReset(id);
  }, [context.active, id]);

  if (activeChildren.includes(element)) {
    return null;
  }

  return (
    <TodoListItemBase
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={depth}
      counterDepth={counterDepth}
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
      resetCounters={resetCounters}
      listType={listType}
      activeChildren={activeChildren}
    >
      {children}
    </TodoListItemBase>
  );
};

export const TodoListItemClone = ({ activeChildren }) => {
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
