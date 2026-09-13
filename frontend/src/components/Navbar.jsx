import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, loading, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">

        <Link to="/" className="logo">
          🍴 Food Recipes
        </Link>

        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          {!loading && user ? (
            <>
              <Link to="/create-recipe">
                Create Recipe
              </Link>

              <Link to="/bookmarks">
                My Bookmarks
              </Link>

              <span className="navbar-user">
                👤 {user.name}
              </span>

              <button
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : !loading ? (
            <>
              <Link to="/login">
                Login
              </Link>

              <Link to="/register">
                Register
              </Link>
            </>
          ) : null}

        </div>

      </div>
    </nav>
  );
}

export default Navbar;