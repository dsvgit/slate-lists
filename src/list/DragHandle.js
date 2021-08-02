import React, { Fragment } from "react";
import cn from "classnames";

import "./DragHandle.css";

export const DragHandle = (props) => {
  const { element, rootRef, dropLine, dragRef } = props;

  return (
    <Fragment>
      {Boolean(dropLine) && (
        <div
          className={cn("dropLine", {
            dropLineTop: dropLine === "top",
            dropLineBottom: dropLine === "bottom"
          })}
          contentEditable={false}
        />
      )}

      <button
        contentEditable={false}
        ref={dragRef}
        type="button"
        className="handle"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        draggable={true}
      />
    </Fragment>
  );
};
