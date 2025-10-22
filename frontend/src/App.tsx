import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="p-4 bg-white shadow">
        <div className="container mx-auto">
          <Link to="/" className="font-bold mr-4">Credify</Link>
          <Link to="/login" className="mr-2">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}
