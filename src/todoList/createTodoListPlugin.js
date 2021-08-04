import { getRenderElement } from "@udecode/plate";

import { KEYS_LIST } from "./defaults";
import withList from "./withList";
import onKeyDown from "./onKeyDown";

export const createTodoListPlugin = () => {
  return {
    pluginKeys: KEYS_LIST,
    renderElement: getRenderElement(KEYS_LIST),
    onKeyDown,
    withOverrides: withList,
  };
};
