import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

//This is authentication for the Protected Pages
function CheckAuth({ children, protectedRoute }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (protectedRoute && !token) {
      navigate("/signup", { replace: true });
    } else if (!protectedRoute && token) {
      navigate("/", { replace: true });
    }

    setLoading(false);
  }, [navigate, protectedRoute]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg">Checking authentication...</p>
      </div>
    );
  }

  return children;
}

export default CheckAuth;
