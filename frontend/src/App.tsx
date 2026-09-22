import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
  const [message, setMessage] = useState("Connecting...");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/health")
      .then((response) => {
        console.log("Backend response:", response.data);
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error("Backend error:", error);
        console.error("Response:", error.response);
        setError(error.message);
      });
  }, []);

  return (
    <div>
      <h1>Industrial IoT Platform</h1>

      <p>{message}</p>

      {error && <p>Backend connection failed: {error}</p>}
    </div>
  );
}

export default App;