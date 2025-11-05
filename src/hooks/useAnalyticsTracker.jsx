import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

export default function useAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Send a pageview hit whenever the route changes
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
      title: document.title,
    });
  }, [location]);
}
