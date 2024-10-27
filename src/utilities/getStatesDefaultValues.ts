import { getItem } from "./localStorageMethods";
import { LOCAL_STORAGE_KEYS } from "../constants";

const { USER_KEY } = LOCAL_STORAGE_KEYS;

const getDefaultValUser = () => {
  return getItem(USER_KEY);
};

export { getDefaultValUser };
