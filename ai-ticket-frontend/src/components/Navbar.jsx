import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");
  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="navbar bg-[#0f172a] text-white shadow-md px-6 py-3 relative">
      {/* Left: Logo */}
      <div className="flex-1">
        <Link
          to="/"
          className="text-2xl font-extrabold text-blue-400 hover:text-blue-300 transition"
        >
          Tickzy<span className="text-gray-400">.AI</span>
        </Link>
      </div>

      {/* Center: Username */}
      {user?.username && (
        <div className="absolute left-1/2 -translate-x-1/2 hidden sm:block">
          <span className="text-md  font-medium text-gray-300">
            Hi, {user.username}
          </span>
        </div>
      )}

      {/* Right: Buttons */}
      <div className="flex items-center gap-3 text-sm">
        {!token ? (
          <>
            <Link
              to="/signup"
              className="btn btn-sm bg-gray-700 hover:bg-gray-600 text-white border-none"
            >
              Signup
            </Link>
            <Link
              to="/login"
              className="btn btn-sm bg-blue-600 hover:bg-blue-500 text-white border-none"
            >
              Login
            </Link>
          </>
        ) : (
          <>
            <span className="hidden sm:block text-gray-400">{user?.email}</span>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="btn btn-sm bg-blue-900 hover:bg-blue-800 text-white border-none"
              >
                Admin
              </Link>
            )}
            <button
              onClick={logout}
              className="btn btn-sm bg-red-500 hover:bg-red-400 text-white border-none"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
