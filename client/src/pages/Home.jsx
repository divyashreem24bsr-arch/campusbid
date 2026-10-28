import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>CampusBid</h1>

      <h2>Welcome, {user.name}!</h2>

      <p>Email: {user.email}</p>
      <p>Department: {user.department || "Not provided"}</p>
      <p>Year: {user.year || "Not provided"}</p>

      <button onClick={logout}>Log out</button>
    </div>
  );
}
