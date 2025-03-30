import { useEffect, useState } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

function App() {
  const [metrics, setMetrics] = useState("");
  const [deployments, setDeployments] = useState([]);
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/metrics`)
      .then((res) => res.text())
      .then(setMetrics)
      .catch(console.error);

    fetch(`${API_URL}/deployments`)
      .then((res) => res.json())
      .then(setDeployments)
      .catch(console.error);
  }, []);

  // ✅ Fetch deployments when seed status changes
  useEffect(() => {
    if (isSeeded) {
      fetch(`${API_URL}/deployments/seed`, { method: "POST" })
        .then((res) => res.json())
        .then(setDeployments)
        .catch(console.error);
    } else {
      fetch(`${API_URL}/deployments/clear`, { method: "DELETE" })
        .then(() => setDeployments([]))
        .catch(console.error);
    }
  }, [isSeeded]);

  return (
    <div className='dashboard'>
      <header className='header'>
        <h1>🚀 DevOps Deployment Dashboard</h1>
      </header>

      <section className='metrics-card'>
        <h2>📊 System Metrics</h2>
        <p>{metrics || "Loading metrics..."}</p>
      </section>

      <section className='deployments-container'>
        <h3>📦 Recent Deployments</h3>
        <div>
          <button onClick={() => setIsSeeded(true)}>Seed</button>
          <button onClick={() => setIsSeeded(false)}>Clear</button>
        </div>
        <div className='table-wrapper'>
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Environment</th>
                <th>Status</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {deployments.length > 0 ? (
                deployments.map((d, i) => (
                  <tr key={i}>
                    <td>{d.application}</td>
                    <td>{d.environment}</td>
                    <td className={`status ${d.status.toLowerCase()}`}>
                      {d.status}
                    </td>
                    <td>{d.duration}s</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='4'>No deployments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;
