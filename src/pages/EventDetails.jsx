"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useUser, SignInButton } from "@clerk/clerk-react"
import { supabase } from "../supabaseClient"
import AvailabilitySelector from "../components/AvailabilitySelector"
import AvailabilitySummary from "../components/AvailabilitySummary"
import "../styles/EventDetails.css"

function EventDetails() {
  const { id } = useParams()
  const { user, isSignedIn } = useUser()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [isHost, setIsHost] = useState(false)
  const [userAvailabilities, setUserAvailabilities] = useState([])
  const [allAvailabilities, setAllAvailabilities] = useState([])
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    async function fetchEventData() {
      try {
        // Obtener detalles del evento
        const { data: eventData, error: eventError } = await supabase.from("events").select("*").eq("id", id).single()

        if (eventError) throw eventError
        setEvent(eventData)

        // Generar URL para compartir
        setShareUrl(`${window.location.origin}/events/${id}`)

        if (isSignedIn) {
          // Verificar si el usuario actual es el anfitrión
          setIsHost(eventData.host_id === user.id)

          if (eventData.host_id === user.id) {
            // Si es anfitrión, obtener todas las disponibilidades
            const { data: availData, error: availError } = await supabase
              .from("availabilities")
              .select("*")
              .eq("event_id", id)

            if (availError) throw availError
            setAllAvailabilities(availData || [])
          } else {
            // Si es invitado, obtener sus disponibilidades
            const { data: userAvailData, error: userAvailError } = await supabase
              .from("availabilities")
              .select("*")
              .eq("event_id", id)
              .eq("user_id", user.id)

            if (userAvailError) throw userAvailError
            setUserAvailabilities(userAvailData || [])
            setHasSubmitted(userAvailData && userAvailData.length > 0)
          }
        }
      } catch (err) {
        console.error("Error fetching event data:", err)
        setError("No se pudo cargar la información del evento")
      } finally {
        setLoading(false)
      }
    }

    fetchEventData()
  }, [id, user, isSignedIn])

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
    alert("¡Enlace copiado al portapapeles!")
  }

  const handleAvailabilitySubmit = async (availabilities) => {
    try {
      // Primero eliminar disponibilidades existentes
      await supabase.from("availabilities").delete().eq("event_id", id).eq("user_id", user.id)

      // Si hay nuevas disponibilidades, insertarlas
      if (availabilities.length > 0) {
        const availabilityRecords = availabilities.map((avail) => {
          // Asegurarse de que la fecha esté en el formato correcto
          const dateStr = avail.date

          return {
            event_id: id,
            user_id: user.id,
            user_name: `${user.firstName} ${user.lastName}` || user.username || user.id,
            date: dateStr,
            all_day: avail.all_day || false,
            start_time: avail.start_time || null,
            end_time: avail.end_time || null,
          }
        })

        const { error } = await supabase.from("availabilities").insert(availabilityRecords)

        if (error) throw error
      }

      setHasSubmitted(true)
      setUserAvailabilities(
        availabilities.map((avail) => {
          // Asegurarse de que la fecha esté en el formato correcto
          const dateStr = avail.date

          return {
            event_id: id,
            user_id: user.id,
            user_name: `${user.firstName} ${user.lastName}` || user.username || user.id,
            date: dateStr,
            all_day: avail.all_day || false,
            start_time: avail.start_time || null,
            end_time: avail.end_time || null,
          }
        }),
      )

      alert("¡Tus disponibilidades han sido guardadas!")
    } catch (err) {
      console.error("Error submitting availabilities:", err)
      alert("Error al guardar tus disponibilidades")
    }
  }

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  if (error || !event) {
    return <div className="error-container">{error || "Evento no encontrado"}</div>
  }

  return (
    <div className="event-details-container">
      <header className="event-header">
        <h1>{event.title}</h1>
        <p className="event-host">Organizado por: {event.host_name}</p>

        <div className="event-dates">
          <span>Desde: {new Date(event.start_date).toLocaleDateString()}</span>
          <span>Hasta: {new Date(event.end_date).toLocaleDateString()}</span>
        </div>

        {event.description && <p className="event-description">{event.description}</p>}

        <div className="share-container">
          <input type="text" value={shareUrl} readOnly className="share-url" />
          <button onClick={copyShareLink} className="copy-btn">
            Copiar Enlace
          </button>
        </div>

        {isHost && (
          <button onClick={() => navigate(`/events/edit/${id}`)} className="edit-event-btn">
            Editar Evento
          </button>
        )}
      </header>

      {!isSignedIn ? (
        <div className="auth-prompt">
          <p>Inicia sesión para indicar tu disponibilidad</p>
          <SignInButton mode="modal" />
        </div>
      ) : isHost ? (
        <div className="host-view">
          <h2>Resumen de Disponibilidades</h2>
          <AvailabilitySummary
            eventId={id}
            startDate={event.start_date}
            endDate={event.end_date}
            availabilities={allAvailabilities}
          />
        </div>
      ) : (
        <div className="guest-view">
          <h2>Selecciona tu disponibilidad</h2>
          {hasSubmitted ? (
            <>
              <p className="submitted-message">
                Ya has enviado tus disponibilidades. Puedes modificarlas a continuación:
              </p>
              <AvailabilitySelector
                eventId={id}
                startDate={event.start_date}
                endDate={event.end_date}
                existingAvailabilities={userAvailabilities}
                onSubmit={handleAvailabilitySubmit}
              />
            </>
          ) : (
            <AvailabilitySelector
              eventId={id}
              startDate={event.start_date}
              endDate={event.end_date}
              onSubmit={handleAvailabilitySubmit}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default EventDetails
