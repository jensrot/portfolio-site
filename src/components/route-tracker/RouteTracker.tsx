import { useEffect } from "react";

import { useLocation } from "react-router-dom";

import { track } from "../../utils/analytics";

/**
 * Fires one analytics beacon per client-side route change.
 * Renders nothing. Must be mounted inside <BrowserRouter> so useLocation works.
 */
const RouteTracker = (): null => {
  const location = useLocation();

  useEffect(() => {
    track(location.pathname + location.search);
    console.log(location.pathname + location.search);

  }, [location.pathname, location.search]);

  return null;
};

export default RouteTracker;
