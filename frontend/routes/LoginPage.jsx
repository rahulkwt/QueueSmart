import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Submits credentials to the login API.
   * On success, stores user data via AuthContext and redirects based on role:
   *   - "admin" → /portal/admin
   *   - anything else → /portal/user
   * @param {React.FormEvent} e
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      // Persist session and redirect to role-appropriate dashboard
      login(data);
      navigate(data.role === "admin" ? "/portal/admin" : "/portal/user");
    } catch {
      setError("Could not connect to server.");
    }
  }

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
                Welcome back to <strong>QueueSmart</strong>. Please enter your
                credentials to continue.
              </p>

              <form onSubmit={handleSubmit} className="w-100 mt-4 pt-2">
                {error && (
                  <div className="alert alert-danger py-2 fs-12">{error}</div>
                )}

                <div className="mb-4">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mt-5">
                  <button type="submit" className="btn btn-lg btn-primary w-100">
                    Login
                  </button>
                </div>
              </form>

              <div className="mt-5 text-muted">
                <span>Don't have an account?</span>{" "}
                <Link to="/register" className="text-primary fw-bold">
                  Create an Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default LoginPage;
