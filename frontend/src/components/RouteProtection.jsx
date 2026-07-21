import { Navigate } from "react-router-dom";

// 1. Protects private pages (forces login)
export const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// 2. Protects auth pages (prevents logged-in users from seeing login/register)
export const GuestRoute = ({ user, children }) => {
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};
