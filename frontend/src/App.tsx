import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TwoFactorSetup from './pages/TwoFactorSetup'
import TwoFactorVerify from './pages/TwoFactorVerify'
import EmailVerified from './pages/EmailVerified'

export default function App() {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="p-4 bg-white shadow">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <Link to="/" className="font-bold mr-4">Credify</Link>
          </div>
          <div>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="mr-4">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mr-4">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/2fa-setup" element={
            <ProtectedRoute>
              <TwoFactorSetup />
            </ProtectedRoute>
          } />
          <Route path="/2fa-verify" element={
            <PublicRoute>
              <TwoFactorVerify />
            </PublicRoute>
          } />
          <Route path="/email-verified" element={<EmailVerified />} />
        </Routes>
      </main>
    </div>
  )
}
