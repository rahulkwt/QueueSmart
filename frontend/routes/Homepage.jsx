import React from "react";
import { Link } from "react-router-dom";

const Homepage = () => {
    return (
        <>
            <div>
                {/* <Link to="/dashboard">Go to Dashboard</Link> */}
                <div className="slider-area position-relative">
                    <div
                        className="single-slider slider-height d-flex align-items-center"
                        style={{ backgroundImage: "url('/frontend/public/assets/images/gallery/blog2.png')", backgroundSize: "cover", backgroundPosition: "center" }}
                    >
                        <div className="container">
                            <div className="row">
                                <div className="col-xl-7 col-lg-9 col-md-8 col-sm-9">
                                    <div className="hero__caption">
                                        <span>Committed to success</span>
                                        <h1>We care about your health</h1>
                                        <p>
                                            Skip the waiting room. Join your queue online and get notified when it's your turn.
                                        </p>
                                        <Link to="/login" className="btn-home hero-btn-home">
                                            Appointment{" "}
                                            <i className="ti-arrow-right"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                        We provide smart queue management so you spend less time waiting and more time receiving the care you need.
                                    </p>
                                    {/* Buttons */}

                                    <div className="about-btn-home1 mb-30">
                                        <Link
                                        to="/login"
                                        className="btn-home about-btn-home2"
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
                                    src="/frontend/public/assets/images/gallery/about2.png"
                                    alt="Doctor working"
                                    />
                                </div>

                                <div className="about-back-img">
                                    <img
                                    src="/frontend/public/assets/images/gallery/about1.png"
                                    alt="Medical equipment"
                                    />
                                </div>

                                </div>

                            </div>

                        </div>

                    </div>
                </div>

            </div>
        </>
    );
};

export default Homepage;