import { Link } from "react-router-dom";

function Navbar() {
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

          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;