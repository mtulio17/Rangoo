"use client"

import { useNavigate } from "react-router-dom"
import { SignIn, useAuth } from "@clerk/clerk-react"
import "../styles/Landing.css"

function Landing() {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()

  if (isSignedIn) {
    navigate("/dashboard")
  }

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>Coordina tus eventos fácilmente</h1>
        <p>Encuentra el mejor momento para reunirte con tus amigos, colegas o familia</p>

        <div className="landing-features">
          <div className="feature">
            <h3>Crea eventos</h3>
            <p>Define fechas y períodos para tus reuniones</p>
          </div>
          <div className="feature">
            <h3>Recopila disponibilidades</h3>
            <p>Tus invitados indican cuándo están disponibles</p>
          </div>
          <div className="feature">
            <h3>Encuentra el mejor momento</h3>
            <p>Visualiza fácilmente las coincidencias de horarios</p>
          </div>
        </div>

        <div className="landing-cta">
          <p>Inicia sesión desde el botón en la barra de navegación para comenzar</p>
        </div>
      </div>
    </div>
  )
}

export default Landing
