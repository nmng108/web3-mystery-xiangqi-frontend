import {Dashboard, Home, MarketPlace} from "../pages";
import { ROUTES } from "../constants";
import { createBrowserRouter } from "react-router-dom";

const MainNavigator = createBrowserRouter([
  {
    path: ROUTES.INDEX,
    Component: Home,
    errorElement: <div>Error: page is not found</div>
  },
  {
    path: ROUTES.DASHBOARD,
    Component: Dashboard,
    errorElement: <div>Error: page is not found</div>
  },
  {
    path: ROUTES.MARKETPLACE,
    Component: MarketPlace,
    errorElement: <div>Error: page is not found</div>
  },
]);

export default MainNavigator;
