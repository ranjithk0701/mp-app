import { useState } from "react";
import useFetch from "./useFetch";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [formData, setFormData] = useState({ email: "", password: "", role: "student" });
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(true);

  const { data: students, loading, error } = useFetch(`${import.meta.env.VITE_API_URL}/students`);
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    fetch(`${import.meta.env.VITE_API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        setFormData({ email: "", password: "", role: "student" });
      });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);
          setToken(data.token);
          setRole(data.role);
        } else {
          setMessage(data.message);
        }
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
  };

  const handleDelete = (id) => {
    fetch(`${import.meta.env.VITE_API_URL}/students/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
      });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const filteredStudents = students.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [resultData, setResultData] = useState({ studentId: "", testName: "", score: "" });
  const [results, setResults] = useState([]);

  const handleResultChange = (e) => {
    setResultData({ ...resultData, [e.target.name]: e.target.value });
  };

  const handleResultSubmit = (e) => {
    e.preventDefault();
    fetch(`${import.meta.env.VITE_API_URL}/students/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resultData)
    })
      .then((res) => res.json())
      .then(() => {
        setResultData({ studentId: "", testName: "", score: "" });
        fetchResults();
      });
  };

  const fetchResults = () => {
    fetch(`${import.meta.env.VITE_API_URL}/students/results`)
      .then((res) => res.json())
      .then((data) => setResults(data));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>

      {!token && (
        <div style={{ marginBottom: "30px", maxWidth: "300px" }}>
          <h2>{isRegistering ? "Register" : "Login"}</h2>
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              style={{ display: "block", marginBottom: "10px", width: "100%" }}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              style={{ display: "block", marginBottom: "10px", width: "100%" }}
            />
            {isRegistering && (
              <select name="role" value={formData.role} onChange={handleChange} style={{ display: "block", marginBottom: "10px" }}>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            )}
            <button type="submit">{isRegistering ? "Register" : "Login"}</button>
          </form>
          {message && <p>{message}</p>}
          <button onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
          </button>
        </div>
      )}

      {token && (
        <div style={{ marginBottom: "20px" }}>
          <p>Logged in as: {role}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
      {role === "admin"  && 
        (<>
          <h1>Students</h1>

      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "10px", padding: "6px" }}
      />
        

      <ul>
        {filteredStudents.map((s) => (
          <li key={s._id}>
            {s.name} - {s.cgpa}
            {token && role === "admin" && (
              <button onClick={() => handleDelete(s._id)} style={{ marginLeft: "10px" }}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
      {filteredStudents.length === 0 && <p>No students found.</p>}
      </>
      )}
    
      <div style={{ marginTop: "30px" }}>
        <h2>Add Test Result</h2>
          <form onSubmit={handleResultSubmit}>
            <input
              name="studentId"
              placeholder="Student ID"
              value={resultData.studentId}
              onChange={handleResultChange}
              style={{ display: "block", marginBottom: "10px" }}
            />
            <input
              name="testName"
              placeholder="Test Name"
              value={resultData.testName}
              onChange={handleResultChange}
              style={{ display: "block", marginBottom: "10px" }}
            />
            <input
              name="score"
              placeholder="Score"
              value={resultData.score}
              onChange={handleResultChange}
              style={{ display: "block", marginBottom: "10px" }}
            />
            <button type="submit">Add Result</button>
          </form>

          <button onClick={fetchResults} style={{ marginTop: "10px" }}>Load Results</button>

          <ul>
            {results.map((r) => (
              <li key={r._id}>
                {r.student?.name} - {r.testName} - {r.score}
              </li>
            ))}
          </ul>
      </div>
    </div>
  )};


export default App;