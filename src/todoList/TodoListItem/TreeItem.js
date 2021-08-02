import React, { forwardRef } from "react";
import classNames from "classnames";

import styles from "./TreeItem.module.scss";

const Handle = ({ active, className, cursor, style, ...props }) => {
  return (
    <button
      contentEditable={false}
      {...props}
      // className={classNames(styles.Action, className)}
      tabIndex={0}
      className={styles.Handle}
      style={{
        ...style,
        cursor,
        "--fill": active?.fill,
        "--background": active?.background,
      }}
    >
      <svg viewBox="0 0 20 20" width="12">
        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
      </svg>
    </button>
  );
};

const TreeItem = forwardRef(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      style,
      value,
      wrapperRef,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <li
        className={classNames(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction
        )}
        ref={wrapperRef}
        style={{
          "--spacing": `${indentationWidth * depth}px`,
        }}
        {...props}
      >
        <div className={styles.TreeItem} ref={ref} style={style}>
          <Handle {...handleProps} />
          <div className={styles.Text}>{children}</div>
        </div>
      </li>
    );
  }
);

export default TreeItem;
