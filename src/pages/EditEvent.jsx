"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useUser } from "@clerk/clerk-react"
import { supabase } from "../supabaseClient"
import "../styles/EventForm.css"

function EditEvent() {
  const { id } = useParams()
  const { user } = useUser()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchEvent() {
      try {
        const { data, error } = await supabase.from("events").select("*").eq("id", id).single()

        if (error) throw error

        // Verificar que el usuario actual es el anfitrión
        if (data.host_id !== user.id) {
          navigate("/dashboard")
          return
        }

        // Formatear fechas para el input date
        const startDate = new Date(data.start_date).toISOString().split("T")[0]
        const endDate = new Date(data.end_date).toISOString().split("T")[0]

        setFormData({
          title: data.title,
          description: data.description || "",
          startDate,
          endDate,
        })
      } catch (err) {
        console.error("Error fetching event:", err)
        setError("No se pudo cargar el evento")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchEvent()
    }
  }, [id, user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Validar fechas
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)

      if (end < start) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio")
      }

      // Actualizar evento en Supabase
      const { error } = await supabase
        .from("events")
        .update({
          title: formData.title,
          description: formData.description,
          start_date: formData.startDate,
          end_date: formData.endDate,
        })
        .eq("id", id)

      if (error) throw error

      // Redirigir a la página de detalles del evento
      navigate(`/events/${id}`)
    } catch (err) {
      console.error("Error updating event:", err)
      setError(err.message || "Error al actualizar el evento")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  return (
    <div className="event-form-container">
      <h1>Editar Evento</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="title">Título *</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" />
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
          <button type="button" className="cancel-btn" onClick={() => navigate(`/events/${id}`)}>
            Cancelar
          </button>
          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditEvent
