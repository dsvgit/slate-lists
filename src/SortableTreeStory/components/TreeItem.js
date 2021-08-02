import React, { forwardRef } from "react";
import classNames from "classnames";

import styles from "./TreeItem.module.scss";

const Handle = ({ active, className, cursor, style, ...props }) => {
  return (
    <button
      {...props}
      // className={classNames(styles.Action, className)}
      tabIndex={0}
      style={{
        ...style,
        cursor,
        "--fill": active?.fill,
        "--background": active?.background,
      }}
    >
      handle
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
          <span className={styles.Text}>{value}</span>
          {clone && childCount && childCount > 1 ? (
            <span className={styles.Count}>{childCount}</span>
          ) : null}
        </div>
      </li>
    );
  }
);

export default TreeItem;
