import { getItem } from "./localStorageMethods";
import { LOCAL_STORAGE_KEYS } from "../constants";

const { USER } = LOCAL_STORAGE_KEYS;

const getDefaultValUser = () => {
  return getItem(USER);
};

export { getDefaultValUser };
