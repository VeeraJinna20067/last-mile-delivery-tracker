import {
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  useAuth
} from "../../context/AuthContext.jsx";

const Login = () => {

  const navigate =
    useNavigate();

  const {
    login
  } = useAuth();


  const [
    email,
    setEmail
  ] = useState("");


  const [
    password,
    setPassword
  ] = useState("");


  const [
    error,
    setError
  ] = useState("");


  const [
    submitting,
    setSubmitting
  ] = useState(false);


  const handleSubmit =
    async (event) => {

      event.preventDefault();

      setError("");

      setSubmitting(true);

      try {

        const user =
          await login(
            email,
            password
          );


        if (
          user.role === "admin"
        ) {
          navigate(
            "/admin"
          );

        } else if (
          user.role === "agent"
        ) {
          navigate(
            "/agent"
          );

        } else {
          navigate(
            "/dashboard"
          );
        }

      } catch (error) {

        setError(
          error.response?.data
            ?.message ||
          "Unable to sign in"
        );

      } finally {

        setSubmitting(false);
      }
    };


  return (
    <div className="auth-box">

      <h1>
        Sign in
      </h1>

      <p>
        Access your delivery workspace.
      </p>


      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

        <div className="form-group">

          <label>
            Email
          </label>

          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            placeholder="you@example.com"
            required
          />

        </div>


        <div className="form-group">

          <label>
            Password
          </label>

          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            placeholder="Enter your password"
            required
          />

        </div>


        {error && (
          <div className="form-error">
            {error}
          </div>
        )}


        <button
          className="btn btn-primary"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Signing in..."
            : "Sign in"}
        </button>

      </form>


      <div className="auth-footer">
        Don't have an account?{" "}
        <Link to="/register">
          Create one
        </Link>
      </div>

    </div>
  );
};

export default Login;