
import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [status, setStatus] = useState("Checking server...");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/health`)
      .then((res) => {
        setStatus(`${res.data.app} API: ${res.data.status}`);
      })
      .catch((error) => {
        console.error("API error:", error);
        setStatus("Cannot reach the server");
      });
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>CampusBid</h1>
      <p>{status}</p>
    </div>
  );
}
