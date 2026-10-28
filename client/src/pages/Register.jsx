import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    year: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register({
        ...form,
        year: form.year ? Number(form.year) : undefined,
      });
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ padding: "2rem", maxWidth: 360 }}
    >
      <h2>Create your CampusBid account</h2>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <input
        name="name"
        placeholder="Full name"
        value={form.name}
        onChange={change}
        required
        maxLength={60}
      />

      <br />
      <br />

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={change}
        required
      />

      <br />
      <br />

      <input
        name="password"
        type="password"
        placeholder="Password (min 8 characters)"
        value={form.password}
        onChange={change}
        required
        minLength={8}
      />

      <br />
      <br />

      <input
        name="department"
        placeholder="Department"
        value={form.department}
        onChange={change}
        maxLength={60}
      />

      <br />
      <br />

      <input
        name="year"
        type="number"
        min="1"
        max="6"
        placeholder="Year of study"
        value={form.year}
        onChange={change}
      />

      <br />
      <br />

      <button type="submit" disabled={submitting}>
        {submitting ? "Registering..." : "Register"}
      </button>

      <p>
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </form>
  );
}
