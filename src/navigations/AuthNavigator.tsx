import { Login } from "../pages";
import { ROUTES } from "../constants";
import { createBrowserRouter } from "react-router-dom";

const AuthNavigator = createBrowserRouter([
  {
    path: ROUTES.INDEX,
    Component: Login,
  },
]);

export default AuthNavigator;
