/* src/App.jsx — Debug version to show what's happening with auth, localStorage & components */
import React, { useContext, useEffect, useState } from "react";
import Login from "./components/Auth/Login";
import EmployeeDashboard from "./components/Dashboard/EmployeeDashboard";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import { AuthContext } from "./context/AuthProvider";

export default function App() {
  const [user, setUser] = useState(null);
  const [loggedInUserData, setLoggedInUserData] = useState(null);

  // get whatever the AuthContext provides, but don't assume shape
  const authCtx = useContext(AuthContext);

  // Safe extraction of userData if context is array/object
  const userData = (() => {
    if (!authCtx) return null;
    if (Array.isArray(authCtx)) return authCtx[0] ?? null;
    if (typeof authCtx === "object") return authCtx.userData ?? authCtx[0] ?? null;
    return null;
  })();

  // show what localStorage currently contains on mount
  useEffect(() => {
    const raw = localStorage.getItem("loggedInUser");
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed) {
        setUser(parsed.role ?? null);
        setLoggedInUserData(parsed.data ?? null);
      }
    } catch (err) {
      console.error("invalid JSON in localStorage.loggedInUser", raw, err);
    }
    console.log("AuthContext (on mount):", authCtx);
  }, []); // run once

  // expose a debug login handler to be sure setUser works
  const handleLogin = (email, password) => {
    if (email === "admin@me.com" && password === "123") {
      setUser("admin");
      localStorage.setItem("loggedInUser", JSON.stringify({ role: "admin" }));
      return;
    }
    if (Array.isArray(userData) && userData.length) {
      const employee = userData.find((e) => e.email === email && e.password === password);
      if (employee) {
        setUser("employee");
        setLoggedInUserData(employee);
        localStorage.setItem("loggedInUser", JSON.stringify({ role: "employee", data: employee }));
        return;
      }
    }
    alert("Invalid Credentials (debug)");
  };

  // debug helpers: clear login & simulate employee
  const clearLogin = () => {
    localStorage.removeItem("loggedInUser");
    setUser(null);
    setLoggedInUserData(null);
  };

  const simulateEmployee = () => {
    // pick first user from userData if available
    let employee = null;
    if (Array.isArray(userData) && userData.length) employee = userData[0];
    else if (userData && Array.isArray(userData.users) && userData.users.length) employee = userData.users[0];

    if (!employee) {
      alert("No userData available in AuthContext to simulate an employee. See AuthContext value below.");
      return;
    }
    setUser("employee");
    setLoggedInUserData(employee);
    localStorage.setItem("loggedInUser", JSON.stringify({ role: "employee", data: employee }));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>DEBUG: Auth status</h2>

      <div style={{ marginBottom: 12 }}>
        <strong>Current user (state):</strong> {String(user)}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Logged-in user data (state):</strong>
        <pre style={{ whiteSpace: "pre-wrap", maxHeight: 120, overflow: "auto", background: "#111", color: "#fff", padding: 8 }}>
          {JSON.stringify(loggedInUserData, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>AuthContext value:</strong>
        <pre style={{ whiteSpace: "pre-wrap", maxHeight: 140, overflow: "auto", background: "#111", color: "#fff", padding: 8 }}>
          {JSON.stringify(authCtx, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>localStorage.loggedInUser:</strong>
        <pre style={{ whiteSpace: "pre-wrap", maxHeight: 120, overflow: "auto", background: "#111", color: "#fff", padding: 8 }}>
          {localStorage.getItem("loggedInUser")}
        </pre>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => handleLogin("admin@me.com", "123")}>Simulate Admin Login</button>
        <button onClick={simulateEmployee}>Simulate Employee Login (from AuthContext)</button>
        <button onClick={clearLogin}>Clear Login</button>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <h3>Rendered UI (below)</h3>
      <div style={{ border: "1px solid #333", padding: 12, background: "#0b0b0b" }}>
        {!user ? (
          // show real Login component so you can still use it
          <Login handleLogin={handleLogin} />
        ) : user === "admin" ? (
          <AdminDashboard changeUser={setUser} />
        ) : user === "employee" ? (
          <EmployeeDashboard changeUser={setUser} data={loggedInUserData} />
        ) : null}
      </div>
    </div>
  );
}
