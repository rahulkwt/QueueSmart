import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);

  // Handle sticky navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", path: "/" },
    // { label: "About", path: "/about" },
    // { label: "Doctors", path: "/doctors" },
    // { label: "Department", path: "/department" },
    // { 
    //   label: "Blog", 
    //   path: "/blog",
    //   dropdown: [
    //     { label: "Blog", path: "/blog" },
    //     { label: "Blog Details", path: "/blog-details" },
    //     { label: "Elements", path: "/elements" }
    //   ]
    // },
    // { label: "Contact", path: "/contact" }
  ];

  return (
    <header className="header-area">
    <div className={`main-header ${isSticky ? "header-sticky" : ""}`}>
        <div className="container-fluid">
        <div className="row align-items-center">

            {/* Logo */}
            <div className="col-xl-2 col-lg-2 col-md-1">
            <div className="logo">
                <Link to="/">
                <img src="/frontend/public/assets/images/logo/logo.png" alt="" />
                </Link>
            </div>
            </div>

            {/* Menu */}
            <div className="col-xl-10 col-lg-10 col-md-10">
            <div className="menu-main d-flex align-items-center justify-content-end">

                {/* Main menu */}
                <div className="main-menu f-right d-none d-lg-block">
                <nav>
                    <ul id="navigation">
                    {navItems.map((item, index) => (
                        <li key={index}>
                        <Link to={item.path}>{item.label}</Link>
                        </li>
                    ))}
                    </ul>
                </nav>
                </div>

                {/* Login button */}
                <div className="header-right-btn f-right d-none d-lg-block ml-30">
                <Link to="/login" className="btn header-btn">
                    Login / Signup
                </Link>
                </div>

            </div>
            </div>

            {/* Mobile menu */}
            <div className="col-12">
            <div className="mobile_menu d-block d-lg-none"></div>
            </div>

        </div>
        </div>
    </div>
    </header>
  );
};

export default Navbar;