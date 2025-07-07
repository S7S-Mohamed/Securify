import { Link, NavLink } from "react-router-dom";
import { useEffect } from "react";
import $ from "jquery";
import "./Navbar.css";

export function Navbar(tabs) {
  useEffect(() => {
    $(".nav-link").on("click", function () {
      $(".nav-link").removeClass("active");
      $(this).addClass("active");
    });
  }, []);

  return (
    <section className="navigation ">
      <nav className="navbar navbar-expand-lg navbar-dark pt-1 pb-1 bg-dark ps-3 pe-3 ">
        <NavLink className="cyberware navbar-brand" to="home">
          Securify
        </NavLink>
        <button
          className="navbar-toggler "
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon "></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item pb-2">
              <Link className="nav-link active" to="home">
                Read Topic
              </Link>
            </li>
            <li className="nav-item pb-2">
              <Link className="nav-link " to="awareness">
                Take Quiz
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </section>
  );
}
