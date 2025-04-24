"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "@clerk/clerk-react"
import { supabase } from "../supabaseClient"
import "../styles/EventForm.css"

function CreateEvent() {
  const { user } = useUser()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validar fechas
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)

      if (end < start) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio")
      }

      // Crear evento en Supabase
      const { data, error } = await supabase
        .from("events")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            start_date: formData.startDate,
            end_date: formData.endDate,
            host_id: user.id,
            host_name: `${user.firstName} ${user.lastName}` || user.username || user.id,
          },
        ])
        .select()

      if (error) throw error

      // Redirigir a la página de detalles del evento
      navigate(`/events/${data[0].id}`)
    } catch (err) {
      console.error("Error creating event:", err)
      setError(err.message || "Error al crear el evento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="event-form-container">
      <h1>Crear Nuevo Evento</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="title">Título *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Ej: Reunión de equipo"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe el propósito del evento"
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Fecha de inicio *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">Fecha de fin *</label>
            <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate("/dashboard")}>
            Cancelar
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creando..." : "Crear Evento"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateEvent
