
import { Navigate } from "react-router-dom";

// This page is no longer needed as we've moved to a LandingPage
// Redirecting to the landing page for any direct access
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
