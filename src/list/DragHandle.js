import React, { Fragment } from "react";
import cn from "classnames";
import { useDndBlock } from "@udecode/plate";

import "./DragHandle.css";

export const DragHandle = (props) => {
  const { element, rootRef } = props;

  console.log(props);

  const { dropLine, dragRef, isDragging } = useDndBlock({
    id: element.id,
    blockRef: rootRef,
    removePreview: true
  });

  console.log(isDragging);

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
