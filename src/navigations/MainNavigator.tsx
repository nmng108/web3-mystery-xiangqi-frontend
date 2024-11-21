import { Leaderboard, Home, MarketPlace, NotFoundErrorPage } from '../pages';
import { ROUTES } from "../constants";
import { createBrowserRouter } from "react-router-dom";

const MainNavigator = createBrowserRouter([
  {
    path: ROUTES.INDEX,
    Component: Home,
    errorElement: <NotFoundErrorPage />
  },
  {
    path: ROUTES.LEADERBOARD,
    Component: Leaderboard,
    errorElement: <NotFoundErrorPage />
  },
  {
    path: ROUTES.MARKETPLACE,
    Component: MarketPlace,
    errorElement: <NotFoundErrorPage />
  },
  {
    path: ROUTES.PROFILE,
    Component: Home,
    errorElement: <NotFoundErrorPage />
  },
  {
    path: ROUTES.HISTORY,
    Component: Home,
    errorElement: <NotFoundErrorPage />
  },
]);

export default MainNavigator;
