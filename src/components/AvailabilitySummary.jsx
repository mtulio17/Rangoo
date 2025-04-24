"use client"

import { useState, useEffect } from "react"
import "../styles/AvailabilitySummary.css"

function AvailabilitySummary({ eventId, startDate, endDate, availabilities }) {
  const [dateMap, setDateMap] = useState({})
  const [bestTimeSlots, setBestTimeSlots] = useState([])
  const [participants, setParticipants] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [finalSelection, setFinalSelection] = useState(null)

  useEffect(() => {
    if (!availabilities || availabilities.length === 0) {
      return
    }

    // Crear un mapa de fechas y slots de tiempo
    const map = {}
    const uniqueParticipants = new Set()
    const timeSlotMatches = []

    availabilities.forEach((avail) => {
      const dateStr = new Date(avail.date).toISOString().split("T")[0]
      uniqueParticipants.add(avail.user_id)

      if (!map[dateStr]) {
        map[dateStr] = {
          date: dateStr,
          users: new Set(),
          allDay: [],
          timeSlots: {},
        }
      }

      map[dateStr].users.add(avail.user_id)

      if (avail.all_day) {
        map[dateStr].allDay.push({
          id: avail.id,
          userId: avail.user_id,
          userName: avail.user_name,
        })
      } else if (avail.start_time && avail.end_time) {
        // Crear una clave única para el slot de tiempo
        const timeKey = `${avail.start_time}-${avail.end_time}`

        if (!map[dateStr].timeSlots[timeKey]) {
          map[dateStr].timeSlots[timeKey] = {
            start: avail.start_time,
            end: avail.end_time,
            users: [],
            count: 0,
          }
        }

        map[dateStr].timeSlots[timeKey].users.push({
          id: avail.user_id,
          name: avail.user_name,
        })

        map[dateStr].timeSlots[timeKey].count += 1

        // Agregar a la lista de posibles matches
        timeSlotMatches.push({
          date: dateStr,
          timeKey: timeKey,
          start: avail.start_time,
          end: avail.end_time,
          count: map[dateStr].timeSlots[timeKey].count,
        })
      }
    })

    setDateMap(map)
    setParticipants(Array.from(uniqueParticipants))

    // Encontrar los mejores slots de tiempo (con más coincidencias)
    timeSlotMatches.sort((a, b) => {
      // Primero ordenar por número de participantes (descendente)
      if (b.count !== a.count) {
        return b.count - a.count
      }
      // Luego por fecha (ascendente)
      return new Date(a.date) - new Date(b.date)
    })

    setBestTimeSlots(timeSlotMatches.slice(0, 5)) // Top 5 slots

    // Seleccionar la primera fecha por defecto si hay datos
    if (Object.keys(map).length > 0 && !selectedDate) {
      setSelectedDate(Object.keys(map)[0])
    }
  }, [availabilities, selectedDate])

  // Generar todas las fechas entre startDate y endDate
  const generateDateRange = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dates = []

    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    const current = new Date(start)
    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return dates
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr)
  }

  const handleSelectTimeSlot = (dateStr, timeKey) => {
    const [start, end] = timeKey.split("-")
    setFinalSelection({
      date: dateStr,
      start: start,
      end: end,
      formattedDate: formatDate(dateStr),
      formattedTime: `${formatTime(start)} - ${formatTime(end)}`,
    })
  }

  const clearSelection = () => {
    setFinalSelection(null)
  }

  if (!availabilities || availabilities.length === 0) {
    return (
      <div className="no-availabilities">
        <p>Aún no hay disponibilidades registradas.</p>
        <p>Comparte el enlace del evento para que los invitados puedan indicar su disponibilidad.</p>
      </div>
    )
  }

  return (
    <div className="availability-summary">
      {finalSelection && (
        <div className="final-selection">
          <h3>Selección Final</h3>
          <div className="selection-details">
            <p>
              <strong>Fecha:</strong> {finalSelection.formattedDate}
            </p>
            <p>
              <strong>Horario:</strong> {finalSelection.formattedTime}
            </p>
          </div>
          <div className="selection-actions">
            <button onClick={clearSelection} className="cancel-selection">
              Cambiar selección
            </button>
            <button className="confirm-selection">Confirmar y notificar</button>
          </div>
        </div>
      )}

      <div className="participants-info">
        <h3>Participantes ({participants.length})</h3>
        <p>Han respondido {participants.length} personas</p>
      </div>

      <div className="best-slots">
        <h3>Mejores horarios</h3>
        {bestTimeSlots.length === 0 ? (
          <p>No hay suficientes datos para determinar los mejores horarios.</p>
        ) : (
          <div className="best-slots-list">
            {bestTimeSlots.map((slot, index) => (
              <div key={index} className="best-slot-item">
                <div className="slot-info">
                  <div className="slot-date">{formatDate(slot.date)}</div>
                  <div className="slot-time">
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </div>
                  <div className="slot-count">
                    {slot.count} de {participants.length} disponibles
                  </div>
                </div>
                <button onClick={() => handleSelectTimeSlot(slot.date, slot.timeKey)} className="select-slot-btn">
                  Seleccionar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="calendar-view">
        <h3>Vista de Calendario</h3>
        <div className="calendar-grid">
          {generateDateRange().map((date) => {
            const dateStr = date.toISOString().split("T")[0]
            const dateData = dateMap[dateStr]
            const hasData = dateData && (dateData.allDay.length > 0 || Object.keys(dateData.timeSlots).length > 0)

            return (
              <div
                key={dateStr}
                className={`calendar-day ${hasData ? "has-availability" : ""} ${
                  selectedDate === dateStr ? "selected" : ""
                }`}
                onClick={() => hasData && handleDateClick(dateStr)}
              >
                <div className="day-number">{date.getDate()}</div>
                {hasData && (
                  <div
                    className="availability-indicator"
                    style={{
                      opacity: Math.max(0.3, dateData.users.size / participants.length),
                    }}
                  >
                    {dateData.users.size}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {selectedDate && dateMap[selectedDate] && (
        <div className="date-detail">
          <h3>Disponibilidad para {formatDate(selectedDate)}</h3>

          {dateMap[selectedDate].allDay.length > 0 && (
            <div className="all-day-section">
              <h4>Disponible todo el día:</h4>
              <div className="user-list">
                {dateMap[selectedDate].allDay.map((user) => (
                  <span key={user.id} className="user-pill">
                    {user.userName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {Object.keys(dateMap[selectedDate].timeSlots).length > 0 && (
            <div className="time-slots-section">
              <h4>Horarios específicos:</h4>
              <div className="time-slots-list">
                {Object.entries(dateMap[selectedDate].timeSlots)
                  .sort(([keyA, slotA], [keyB, slotB]) => {
                    // Ordenar por hora de inicio
                    return slotA.start.localeCompare(slotB.start)
                  })
                  .map(([timeKey, slot]) => (
                    <div key={timeKey} className="time-slot-detail">
                      <div className="time-slot-header">
                        <span className="time-range">
                          {formatTime(slot.start)} - {formatTime(slot.end)}
                        </span>
                        <span className="user-count">{slot.users.length} personas</span>
                      </div>
                      <div className="time-slot-users">
                        {slot.users.map((user) => (
                          <span key={user.id} className="user-pill">
                            {user.name}
                          </span>
                        ))}
                      </div>
                      <button onClick={() => handleSelectTimeSlot(selectedDate, timeKey)} className="select-time-btn">
                        Seleccionar este horario
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AvailabilitySummary
