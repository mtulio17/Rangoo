"use client"

import { useState, useEffect } from "react"
import "../styles/TimeSlotSelector.css"

function TimeSlotSelector({ date, existingSlots = [], onSlotsChange }) {
  const [slots, setSlots] = useState([])
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [error, setError] = useState("")

  // Actualizar los slots cuando cambian las props
  useEffect(() => {
    console.log("TimeSlotSelector recibió existingSlots:", existingSlots)
    setSlots(existingSlots || [])
  }, [existingSlots, date])

  const formatDate = (dateStr) => {
    const dateObj = new Date(dateStr)
    return dateObj.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const validateTimeRange = (start, end) => {
    const startMinutes = convertTimeToMinutes(start)
    const endMinutes = convertTimeToMinutes(end)

    if (startMinutes >= endMinutes) {
      setError("La hora de fin debe ser posterior a la hora de inicio")
      return false
    }

    // Verificar superposición con slots existentes
    for (const slot of slots) {
      const slotStartMinutes = convertTimeToMinutes(slot.start)
      const slotEndMinutes = convertTimeToMinutes(slot.end)

      // Verificar si hay superposición
      if (
        (startMinutes >= slotStartMinutes && startMinutes < slotEndMinutes) ||
        (endMinutes > slotStartMinutes && endMinutes <= slotEndMinutes) ||
        (startMinutes <= slotStartMinutes && endMinutes >= slotEndMinutes)
      ) {
        setError("Este horario se superpone con otro que ya has agregado")
        return false
      }
    }

    setError("")
    return true
  }

  const convertTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
  }

  const formatTimeForDisplay = (timeStr) => {
    const [hours, minutes] = timeStr.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const addSlot = () => {
    if (validateTimeRange(startTime, endTime)) {
      const newSlot = {
        start: startTime,
        end: endTime,
        id: Date.now(), // ID único para facilitar la eliminación
      }

      // Crear una copia del array actual de slots
      const newSlots = [...slots, newSlot].sort((a, b) => {
        return convertTimeToMinutes(a.start) - convertTimeToMinutes(b.start)
      })

      // Actualizar el estado local
      setSlots(newSlots)

      // Notificar al componente padre
      onSlotsChange(newSlots)
    }
  }

  const removeSlot = (slotId) => {
    // Crear una copia del array actual de slots
    const newSlots = slots.filter((slot) => slot.id !== slotId)

    // Actualizar el estado local
    setSlots(newSlots)

    // Notificar al componente padre
    onSlotsChange(newSlots)
  }

  return (
    <div className="time-slot-selector">
      <h3>Disponibilidad para {formatDate(date)}</h3>

      <div className="time-slot-form">
        <div className="time-inputs">
          <div className="time-input-group">
            <label htmlFor="startTime">Desde:</label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              min="00:00"
              max="23:59"
            />
          </div>
          <div className="time-input-group">
            <label htmlFor="endTime">Hasta:</label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              min="00:00"
              max="23:59"
            />
          </div>
        </div>

        <button onClick={addSlot} className="add-slot-btn">
          Agregar Horario
        </button>
      </div>

      {error && <p className="time-slot-error">{error}</p>}

      <div className="time-slots-list">
        <h4>Horarios agregados:</h4>
        {slots.length === 0 ? (
          <p className="no-slots">No has agregado ningún horario para este día.</p>
        ) : (
          <ul>
            {slots.map((slot) => (
              <li key={slot.id} className="time-slot-item">
                <span>
                  {formatTimeForDisplay(slot.start)} - {formatTimeForDisplay(slot.end)}
                </span>
                <button onClick={() => removeSlot(slot.id)} className="remove-slot-btn">
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default TimeSlotSelector
