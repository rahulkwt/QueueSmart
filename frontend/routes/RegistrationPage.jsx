import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const RegistrationPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /**
   * Validates form input and posts new account data to the register API.
   * Client-side password match is checked first to avoid a needless network request.
   * On success, redirects to /login so the user can sign in immediately.
   * @param {React.FormEvent} e
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Client-side guard — server also validates, but this gives instant feedback
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      navigate("/login");
    } catch {
      setError("Could not connect to server.");
    }
  }

  return (
    <main className="auth-cover-wrapper">
      <div className="auth-cover-content-inner">
        <div className="auth-cover-content-wrapper">
          <div className="auth-img">
            <img
              src="/frontend/public/assets/images/auth/auth-cover-register-bg.svg"
              alt=""
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

            <h2 className="fs-20 fw-bolder mb-4">Register</h2>
            <h4 className="fs-13 fw-bold mb-2">Create your QueueSmart account</h4>
            <p className="fs-12 fw-medium text-muted">
              Let's get you set up so you can start managing your queues.
            </p>

            <form onSubmit={handleSubmit} className="w-100 mt-4 pt-2">
              {error && (
                <div className="alert alert-danger py-2 fs-12">{error}</div>
              )}

              <div className="mb-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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

              <div className="mb-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mt-5">
                <button type="submit" className="btn btn-lg btn-primary w-100">
                  Create Account
                </button>
              </div>
            </form>

            <div className="mt-5 text-muted">
              <span>Already have an account?</span>{" "}
              <Link to="/login" className="fw-bold text-primary">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegistrationPage;
