import React, { createContext, useContext, useRef } from "react";
import { Transforms } from "slate";
import { ReactEditor, useSlate } from "slate-react";

import { ELEMENT_UL, ELEMENT_CL } from "./defaults";
import { DragHandle } from "./DragHandle";

import "./index.css";
import { useDndBlock } from "@udecode/plate";

const ListContext = createContext();

export const List = (props) => {
  const { attributes, children, element } = props;
  const { type } = element;

  if (type === ELEMENT_UL) {
    return <ul {...attributes}>{children}</ul>;
  }

  return (
    <ListContext.Provider value={{ listType: type }}>
      <ol className={type === ELEMENT_CL && "checkList"} {...attributes}>
        {children}
      </ol>
    </ListContext.Provider>
  );
};

export const ListItem = (props) => {
  const { attributes, children, element } = props;
  const { checked } = element;
  const editor = useSlate();
  const { listType } = useContext(ListContext) || {};

  // const { dropLine, dragRef, isDragging } = useDndBlock({
  //   id: element.id,
  //   blockRef: attributes.ref,
  // });

  return (
    <li className="listItem" {...attributes}>
      {/*<DragHandle dropLine={dropLine} dragRef={dragRef} {...props} />*/}
      {listType === ELEMENT_CL && (
        <div contentEditable={false} className="input">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => {
              const path = ReactEditor.findPath(editor, element);
              Transforms.setNodes(
                editor,
                { checked: event.target.checked },
                { at: path }
              );
            }}
          />
        </div>
      )}
      {children}
    </li>
  );
};
