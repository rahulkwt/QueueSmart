import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../utils/NavbarPublic.jsx";

const Homepage = () => {
    return (
        <>
            <div>
                <Navbar />
                {/* <Link to="/dashboard">Go to Dashboard</Link> */}
                <div className="slider-area position-relative">

                    <div
                        id="templateCarousel"
                        className="carousel slide"
                        data-bs-ride="carousel"
                        data-bs-interval="6000"

                    >

                    <div className="carousel-inner">

                        {/* Slide 1 */}
                        <div className="carousel-item active">
                            <div className="single-slider slider-height d-flex align-items-center">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-xl-7 col-lg-9 col-md-8 col-sm-9">

                                            <div className="hero__caption">
                                            <span>Committed to success</span>
                                            <h1 className="cd-headline letters scale">
                                                We care about your{" "}
                                                <strong className="cd-words-wrapper">
                                                <b className="is-visible">health</b>
                                                </strong>
                                            </h1>
                                            <p>
                                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                            </p>
                                            <Link
                                                to="/register"
                                                className="btn hero-btn"
                                            >
                                                Appointment{" "}
                                                <i className="ti-arrow-right"></i>
                                            </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Slide 2 */}
                        <div className="carousel-item">
                            <div className="single-slider slider-height d-flex align-items-center">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-xl-7 col-lg-9 col-md-8 col-sm-9">
                                            <div className="hero__caption">
                                            <span>Committed to success</span>
                                            <h1 className="cd-headline letters scale">
                                                We care about your{" "}
                                                <strong className="cd-words-wrapper">
                                                <b className="is-visible">family</b>
                                                </strong>
                                            </h1>
                                            <p>
                                                Professional medical services with smart queue management.
                                            </p>
                                            <Link
                                                to="/register"
                                                className="btn hero-btn"
                                            >
                                                Appointment{" "}
                                                <i className="ti-arrow-right"></i>
                                            </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        </div>

                        {/* Controls */}
                        <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target="#templateCarousel"
                        data-bs-slide="prev"
                        >
                        <span className="carousel-control-prev-icon"></span>
                        </button>

                        <button
                        className="carousel-control-next"
                        type="button"
                        data-bs-target="#templateCarousel"
                        data-bs-slide="next"
                        >
                        <span className="carousel-control-next-icon"></span>
                        </button>

                    </div>

                </div>

                {/* About Section */}

                <div className="about-area section-padding2">
                    <div className="container">

                        <div className="row">
                            {/* Left Content */}
                            <div className="col-lg-6 col-md-10">
                                <div className="about-caption mb-50">
                                    {/* Section Title */}
                                    <div className="section-tittle section-tittle2 mb-35">
                                        <span>About Our Company</span>
                                        <h2>Welcome To Our Hospital</h2>
                                    </div>
                                    <p>
                                        There are many variations of passages of Lorem Ipsum available,
                                        but the majority have suffered alteration in some form, by injected humour,
                                        or randomised words which don't look even slightly believable.
                                    </p>
                                    {/* Buttons */}

                                    <div className="about-btn1 mb-30">
                                        <Link
                                        to="/doctors"
                                        className="btn about-btn"
                                        >
                                        Find Doctors{" "}
                                        <i className="ti-arrow-right"></i>
                                        </Link>
                                    </div>

                                    <div className="about-btn1 mb-30">
                                        <Link
                                        to="/appointments"
                                        className="btn about-btn2"
                                        >
                                        Appointment{" "}
                                        <i className="ti-arrow-right"></i>
                                        </Link>
                                    </div>
                                </div>

                            </div>
                            {/* Right Images */}
                            <div className="col-lg-6 col-md-12">

                                <div className="about-img">

                                <div className="about-font-img d-none d-lg-block">
                                    <img
                                    src="/frontend/public/assets/img/gallery/about2.png"
                                    alt="Doctor working"
                                    />
                                </div>

                                <div className="about-back-img">
                                    <img
                                    src="/frontend/public/assets/img/gallery/about1.png"
                                    alt="Medical equipment"
                                    />
                                </div>

                                </div>

                            </div>

                        </div>

                    </div>
                </div>

                {/* Department Section */}
    <div className="department_area section-padding2">
      <div className="container">

        {/* Section Title */}
        <div className="row">
          <div className="col-lg-12">
            <div className="section-tittle text-center mb-100">
              <span>Our Departments</span>
              <h2>Our Medical Services</h2>
            </div>
          </div>
        </div>

        {/* Tabs Buttons */}
        <div className="row">
          <div className="col-lg-12">
            <div className="depart_ment_tab mb-30">

              <ul className="nav" id="myTab" role="tablist">

                <li className="nav-item">
                  <a
                    className="nav-link active"
                    id="home-tab"
                    data-bs-toggle="tab"
                    href="#home"
                    role="tab"
                    aria-controls="home"
                    aria-selected="true"
                  >
                    <i className="flaticon-teeth"></i>
                    <h4>Dentistry</h4>
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link"
                    id="profile-tab"
                    data-bs-toggle="tab"
                    href="#profile"
                    role="tab"
                    aria-controls="profile"
                    aria-selected="false"
                  >
                    <i className="flaticon-cardiovascular"></i>
                    <h4>Cardiology</h4>
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link"
                    id="contact-tab"
                    data-bs-toggle="tab"
                    href="#contact"
                    role="tab"
                    aria-controls="contact"
                    aria-selected="false"
                  >
                    <i className="flaticon-ear"></i>
                    <h4>ENT Specialists</h4>
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link"
                    id="Astrology-tab"
                    data-bs-toggle="tab"
                    href="#Astrology"
                    role="tab"
                    aria-controls="Astrology"
                    aria-selected="false"
                  >
                    <i className="flaticon-bone"></i>
                    <h4>Astrology</h4>
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link"
                    id="Neuroanatomy-tab"
                    data-bs-toggle="tab"
                    href="#Neuroanatomy"
                    role="tab"
                    aria-controls="Neuroanatomy"
                    aria-selected="false"
                  >
                    <i className="flaticon-lung"></i>
                    <h4>Neuroanatomy</h4>
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link"
                    id="Blood-tab"
                    data-bs-toggle="tab"
                    href="#Blood"
                    role="tab"
                    aria-controls="Blood"
                    aria-selected="false"
                  >
                    <i className="flaticon-cell"></i>
                    <h4>Blood Screening</h4>
                  </a>
                </li>

              </ul>

            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="dept_main_info white-bg">
          <div className="tab-content" id="myTabContent">

            {/* HOME */}
            <div
              className="tab-pane fade show active"
              id="home"
              role="tabpanel"
              aria-labelledby="home-tab"
            >
              <DepartmentContent />
            </div>

            {/* PROFILE */}
            <div
              className="tab-pane fade"
              id="profile"
              role="tabpanel"
              aria-labelledby="profile-tab"
            >
              <DepartmentContent />
            </div>

            {/* CONTACT */}
            <div
              className="tab-pane fade"
              id="contact"
              role="tabpanel"
              aria-labelledby="contact-tab"
            >
              <DepartmentContent />
            </div>

            {/* ASTROLOGY */}
            <div
              className="tab-pane fade"
              id="Astrology"
              role="tabpanel"
              aria-labelledby="Astrology-tab"
            >
              <DepartmentContent />
            </div>

            {/* NEUROANATOMY */}
            <div
              className="tab-pane fade"
              id="Neuroanatomy"
              role="tabpanel"
              aria-labelledby="Neuroanatomy-tab"
            >
              <DepartmentContent />
            </div>

            {/* BLOOD */}
            <div
              className="tab-pane fade"
              id="Blood"
              role="tabpanel"
              aria-labelledby="Blood-tab"
            >
              <DepartmentContent />
            </div>

          </div>
        </div>

      </div>
    </div>
            </div>
        </>
    );
};
const DepartmentContent = () => {
  return (
    <div className="row align-items-center no-gutters">

      <div className="col-lg-7">
        <div className="dept_info">

          <h3>
            Dentist with surgical mask holding <br />
            scaler near patient
          </h3>

          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.
          </p>

          <a href="#" className="dep-btn">
            Appointment<i className="ti-arrow-right"></i>
          </a>

        </div>
      </div>

      <div className="col-lg-5">
        <div className="dept_thumb">
          <img
            src="/frontend/public/assets/img/gallery/department_man.png"
            alt=""
          />
        </div>
      </div>

    </div>
  );
};

export default Homepage;