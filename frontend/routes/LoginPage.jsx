import React from "react";
import { Link } from "react-router-dom";

const LoginPage = () => {
    return (
        <>
            <main className="auth-cover-wrapper">
                <div className="auth-cover-content-inner">
                    <div className="auth-cover-content-wrapper">
                        <div className="auth-img">
                            <img
                            src="/frontend/public/assets/images/auth/auth-cover-login-bg.svg"
                            alt="Login cover"
                            className="img-fluid"
                            />
                        </div>
                    </div>
                </div>

                <div className="auth-cover-sidebar-inner">
                    <div className="auth-cover-card-wrapper">
                        <div className="auth-cover-card p-sm-5">
                            <div className="wd-50 mb-5">
                            <img
                                src="/frontend/public/assets/images/logo-abbr.png"
                                alt=""
                                className="img-fluid"
                            />
                            </div>

                            <h2 className="fs-20 fw-bolder mb-4">Login</h2>
                            <h4 className="fs-13 fw-bold mb-2">Login to your account</h4>

                            <p className="fs-12 fw-medium text-muted">
                            Thank you for get back <strong>Nelel</strong> web applications,
                            let's access our the best recommendation for you.
                            </p>

                            <form action="index.html" className="w-100 mt-4 pt-2">
                            <div className="mb-4">
                                <input
                                type="email"
                                className="form-control"
                                placeholder="Email or Username"
                                required
                                />
                            </div>

                            <div className="mb-3">
                                <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                required
                                />
                            </div>

                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                <div className="custom-control custom-checkbox">
                                    <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    id="rememberMe"
                                    />
                                    <label
                                    className="custom-control-label c-pointer"
                                    htmlFor="rememberMe"
                                    >
                                    Remember Me
                                    </label>
                                </div>
                                </div>

                                <div>
                                <a
                                    href="auth-reset-cover.html"
                                    className="fs-11 text-primary"
                                >
                                    Forget password?
                                </a>
                                </div>
                            </div>

                            <div className="mt-5">
                                <button
                                type="submit"
                                className="btn btn-lg btn-primary w-100"
                                >
                                Login
                                </button>
                            </div>
                            </form>

                            <div className="mt-5 text-muted">
                            <span> Don't have an account?</span>{" "}
                            <a href="auth-register-cover.html" className="fw-bold">
                                Create an Account
                            </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default LoginPage;