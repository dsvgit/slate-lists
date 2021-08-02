import { createPlateComponents } from "@udecode/plate";
import { List, ListItem } from "../list/elements";

import {
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_LI,
  ELEMENT_CL
} from "../list/defaults";

export const components = createPlateComponents({
  [ELEMENT_UL]: List,
  [ELEMENT_OL]: List,
  [ELEMENT_CL]: List,
  [ELEMENT_LI]: ListItem
});
