import {
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import api from "../../services/api.js";

const Register = () => {

  const navigate =
    useNavigate();


  const [
    form,
    setForm
  ] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });


  const [
    error,
    setError
  ] = useState("");


  const [
    submitting,
    setSubmitting
  ] = useState(false);


  const handleChange =
    (event) => {

      setForm({
        ...form,

        [event.target.name]:
          event.target.value
      });
    };


  const handleSubmit =
    async (event) => {

      event.preventDefault();

      setError("");

      setSubmitting(true);


      try {

        await api.post(
          "/auth/register",
          form
        );


        navigate(
          "/login",
          {
            state: {
              message:
                "Account created successfully. Please sign in."
            }
          }
        );

      } catch (error) {

        setError(
          error.response?.data
            ?.message ||
          "Unable to create account"
        );

      } finally {

        setSubmitting(false);
      }
    };


  return (
    <div className="auth-box">

      <h1>
        Create account
      </h1>

      <p>
        Start managing your deliveries.
      </p>


      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

        <div className="form-group">

          <label>
            Full name
          </label>

          <input
            className="form-input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />

        </div>


        <div className="form-group">

          <label>
            Email
          </label>

          <input
            className="form-input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

        </div>


        <div className="form-group">

          <label>
            Phone
          </label>

          <input
            className="form-input"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone number"
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
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
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
            ? "Creating..."
            : "Create account"}
        </button>

      </form>


      <div className="auth-footer">
        Already have an account?{" "}
        <Link to="/login">
          Sign in
        </Link>
      </div>

    </div>
  );
};

export default Register;