import { useState } from "react";
import UserForm from "./components/UserForm";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import "./index.css";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="app-container">
      <div className="top-bar">
        <button onClick={() => setIsAdmin(!isAdmin)}>
          {isAdmin ? "User Registration" : "Admin Login"}
        </button>
      </div>
      <div className="main-view">
        {isAdmin ? (
          loggedIn ? (
            <AdminDashboard onLogout={() => setLoggedIn(false)} />
          ) : (
            <AdminLogin onLogin={() => setLoggedIn(true)} />
          )
        ) : (
          <UserForm />
        )}
      </div>
    </div>
  );
}

export default App;
