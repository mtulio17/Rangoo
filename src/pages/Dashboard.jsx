"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useUser } from "@clerk/clerk-react"
import { supabase } from "../supabaseClient"
import "../styles/Dashboard.css"

function Dashboard() {
  const { user } = useUser()
  const [createdEvents, setCreatedEvents] = useState([])
  const [invitedEvents, setInvitedEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      if (!user) return

      // Obtener eventos creados por el usuario
      const { data: hostEvents, error: hostError } = await supabase.from("events").select("*").eq("host_id", user.id)

      if (hostError) console.error("Error fetching host events:", hostError)
      else setCreatedEvents(hostEvents || [])

      // Obtener eventos a los que el usuario fue invitado
      const { data: guestEvents, error: guestError } = await supabase
        .from("availabilities")
        .select("event_id")
        .eq("user_id", user.id)

      if (guestError) {
        console.error("Error fetching guest events:", guestError)
      } else if (guestEvents && guestEvents.length > 0) {
        const eventIds = [...new Set(guestEvents.map((item) => item.event_id))]

        const { data: events, error } = await supabase.from("events").select("*").in("id", eventIds)

        if (error) console.error("Error fetching invited events details:", error)
        else setInvitedEvents(events || [])
      }

      setLoading(false)
    }

    fetchEvents()
  }, [user])

  const deleteEvent = async (eventId) => {
    try {
      // Primero eliminar todas las disponibilidades asociadas
      await supabase.from("availabilities").delete().eq("event_id", eventId)

      // Luego eliminar el evento
      const { error } = await supabase.from("events").delete().eq("id", eventId)

      if (error) throw error

      // Actualizar la lista de eventos
      setCreatedEvents(createdEvents.filter((event) => event.id !== eventId))
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("Error al eliminar el evento")
    }
  }

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Bienvenido, {user?.firstName || "Usuario"}</h1>
        <Link to="/events/create" className="create-event-btn">
          Crear Nuevo Evento
        </Link>
      </header>

      <section className="events-section">
        <h2>Eventos que has creado</h2>
        {createdEvents.length === 0 ? (
          <p>No has creado ningún evento todavía.</p>
        ) : (
          <div className="events-grid">
            {createdEvents.map((event) => (
              <div key={event.id} className="event-card">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className="event-dates">
                  <span>Desde: {new Date(event.start_date).toLocaleDateString()}</span>
                  <span>Hasta: {new Date(event.end_date).toLocaleDateString()}</span>
                </div>
                <div className="event-actions">
                  <Link to={`/events/${event.id}`} className="view-btn">
                    Ver Detalles
                  </Link>
                  <Link to={`/events/edit/${event.id}`} className="edit-btn">
                    Editar
                  </Link>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      if (window.confirm("¿Estás seguro de que quieres eliminar este evento?")) {
                        deleteEvent(event.id)
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="events-section">
        <h2>Eventos a los que has sido invitado</h2>
        {invitedEvents.length === 0 ? (
          <p>No has sido invitado a ningún evento todavía.</p>
        ) : (
          <div className="events-grid">
            {invitedEvents.map((event) => (
              <div key={event.id} className="event-card invited">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className="event-dates">
                  <span>Desde: {new Date(event.start_date).toLocaleDateString()}</span>
                  <span>Hasta: {new Date(event.end_date).toLocaleDateString()}</span>
                </div>
                <Link to={`/events/${event.id}`} className="view-btn">
                  Ver Detalles
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard
