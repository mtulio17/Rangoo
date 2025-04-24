"use client"

import { Link } from "react-router-dom"
import { useUser, UserButton, SignInButton } from "@clerk/clerk-react"
import "../styles/Navbar.css"

function Navbar() {
  const { isSignedIn } = useUser()

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">Rangoo</Link>
        </div>
        <div className="navbar-links">
          {isSignedIn && (
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
          )}
        </div>
        <div className="navbar-auth">
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <button className="signin-button">Iniciar Sesión</button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
