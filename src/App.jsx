import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import MedicationHistory from "./pages/MedicationHistory";
import CRASection from "./pages/CRASection";
import ClinicalRulesAdmin from "./pages/ClinicalRulesAdmin";

// Simple in-memory authentication state (no localStorage)
let isAuthenticated = false;
let isAdminAuthenticated = false;
let currentUser = null;

// Protected Route Component for regular users
const ProtectedRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(true); // Removed loading state since we're not using localStorage

  useEffect(() => {
    // Just check the in-memory state
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Protected Route Component for admin users
const AdminProtectedRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(true); // Removed loading state since we're not using localStorage

  useEffect(() => {
    // Just check the in-memory state
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return isAdminAuthenticated ? children : <Navigate to="/admin-login" />;
};

function App() {
  // You might want to handle login here or pass these functions to Login/AdminLogin components
  const handleUserLogin = (email, password) => {
    if (email === "eskinder.cpat@gmail.com" && password === "addismed2025") {
      isAuthenticated = true;
      currentUser = { email };
      return { success: true, redirectTo: "/home" };
    }
    return { success: false, message: "Invalid credentials" };
  };

  const handleAdminLogin = (email, password) => {
    if (email === "admin@cpat.com" && password === "addismed") {
      isAdminAuthenticated = true;
      currentUser = { email, isAdmin: true };
      return { success: true, redirectTo: "/admin" };
    }
    return { success: false, message: "Invalid admin credentials" };
  };

  const handleLogout = () => {
    isAuthenticated = false;
    isAdminAuthenticated = false;
    currentUser = null;
  };

  const handleAdminLogout = () => {
    isAdminAuthenticated = false;
    currentUser = null;
  };

  return (
    <Router>
      <Routes>
        {/* Redirect root based on authentication status */}
        <Route path="/" element={<Navigate to="/home" />} />
        
        {/* Public Routes - Pass login handlers as props */}
        <Route 
          path="/login" 
          element={<Login onLogin={handleUserLogin} onLogout={handleLogout} />} 
        />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/admin-login" 
          element={<AdminLogin onLogin={handleAdminLogin} onLogout={handleAdminLogout} />} 
        />

        {/* Protected Routes for Regular Users */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home onLogout={handleLogout} user={currentUser} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/medication-history" 
          element={
            <ProtectedRoute>
              <MedicationHistory user={currentUser} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cra-assessment" 
          element={
            <ProtectedRoute>
              <CRASection user={currentUser} />
            </ProtectedRoute>
          } 
        />

        {/* Protected Routes for Admin Users */}
        <Route 
          path="/admin" 
          element={
            <AdminProtectedRoute>
              <AdminDashboard onLogout={handleAdminLogout} user={currentUser} />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/clinical-rules" 
          element={
            <AdminProtectedRoute>
              <ClinicalRulesAdmin user={currentUser} />
            </AdminProtectedRoute>
          } 
        />

        {/* Catch-all redirect to home (will go to login if not authenticated) */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default App;
