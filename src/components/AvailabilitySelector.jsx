"use client"

import { useState, useEffect } from "react"
import Calendar from "./Calendar"
import TimeSlotSelector from "./TimeSlotSelector"
import "../styles/AvailabilitySelector.css"

function AvailabilitySelector({ eventId, startDate, endDate, existingAvailabilities = [], onSubmit }) {
  const [selectedDates, setSelectedDates] = useState([])
  const [timeSlots, setTimeSlots] = useState({})
  const [currentDateView, setCurrentDateView] = useState(null)

  // Efecto para inicializar los datos de disponibilidades existentes
  useEffect(() => {
    if (existingAvailabilities && existingAvailabilities.length > 0) {
      // Procesar las disponibilidades existentes
      const dates = new Set()
      const slots = {}

      existingAvailabilities.forEach((avail) => {
        // Asegurarse de que la fecha esté en formato ISO sin componente de tiempo
        const dateObj = new Date(avail.date)
        dateObj.setHours(0, 0, 0, 0)
        const dateStr = dateObj.toISOString().split("T")[0]

        dates.add(dateStr)

        if (!slots[dateStr]) {
          slots[dateStr] = []
        }

        if (avail.start_time && avail.end_time) {
          slots[dateStr].push({
            id: avail.id || Date.now() + Math.random(),
            start: avail.start_time,
            end: avail.end_time,
          })
        }
      })

      const datesArray = Array.from(dates)
      setSelectedDates(datesArray)
      setTimeSlots(slots)

      // Establecer la primera fecha como la vista actual si hay fechas
      if (datesArray.length > 0) {
        setCurrentDateView(datesArray[0])
      }
    }
  }, [existingAvailabilities])

  const handleDateSelect = (dates) => {
    console.log("Fechas seleccionadas:", dates)
    setSelectedDates(dates)

    // Si se deselecciona una fecha, eliminar sus slots de tiempo
    Object.keys(timeSlots).forEach((dateStr) => {
      if (!dates.includes(dateStr)) {
        const newTimeSlots = { ...timeSlots }
        delete newTimeSlots[dateStr]
        setTimeSlots(newTimeSlots)
      }
    })

    // Si se selecciona una nueva fecha y no hay ninguna fecha seleccionada para ver,
    // establecer la primera fecha seleccionada como la fecha actual para ver
    if (dates.length > 0 && (!currentDateView || !dates.includes(currentDateView))) {
      setCurrentDateView(dates[0])
    } else if (dates.length === 0) {
      setCurrentDateView(null)
    }
  }

  const handleSlotsChange = (dateStr, slots) => {
    console.log(`Actualizando slots para ${dateStr}:`, slots)
    // Crear una copia profunda del estado actual
    const updatedTimeSlots = { ...timeSlots }
    // Actualizar los slots para la fecha específica
    updatedTimeSlots[dateStr] = slots
    // Actualizar el estado
    setTimeSlots(updatedTimeSlots)
  }

  const handleSubmit = () => {
    // Preparar los datos para enviar
    const availabilities = []

    selectedDates.forEach((dateStr) => {
      const slots = timeSlots[dateStr] || []

      if (slots.length === 0) {
        // Si no hay slots específicos, agregar disponibilidad para todo el día
        availabilities.push({
          date: dateStr,
          all_day: true,
        })
      } else {
        // Agregar cada slot de tiempo como una disponibilidad separada
        slots.forEach((slot) => {
          availabilities.push({
            date: dateStr,
            all_day: false,
            start_time: slot.start,
            end_time: slot.end,
          })
        })
      }
    })

    console.log("Enviando disponibilidades:", availabilities)
    onSubmit(availabilities)
  }

  const handleViewDate = (dateStr) => {
    console.log("Cambiando vista a fecha:", dateStr)
    setCurrentDateView(dateStr)
  }

  return (
    <div className="availability-selector">
      <p className="instructions">
        Selecciona las fechas en las que estás disponible haciendo clic en ellas. Luego, especifica tus horarios
        disponibles para cada fecha.
      </p>

      <div className="availability-layout">
        <div className="calendar-container">
          <Calendar
            startDate={startDate}
            endDate={endDate}
            selectedDates={selectedDates}
            onDateSelect={handleDateSelect}
          />

          <div className="selected-dates">
            <h3>Fechas seleccionadas ({selectedDates.length}):</h3>
            {selectedDates.length === 0 ? (
              <p>No has seleccionado ninguna fecha.</p>
            ) : (
              <ul className="date-list">
                {selectedDates.map((dateStr) => {
                  const date = new Date(dateStr)
                  const formattedDate = date.toLocaleDateString("es-ES", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })
                  const slots = timeSlots[dateStr] || []

                  return (
                    <li
                      key={dateStr}
                      className={`date-item ${currentDateView === dateStr ? "active" : ""}`}
                      onClick={() => handleViewDate(dateStr)}
                    >
                      <span>{formattedDate}</span>
                      <span className="slot-count">
                        {slots.length > 0 ? `${slots.length} horario(s)` : "Todo el día"}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="time-slots-container">
          {currentDateView ? (
            <TimeSlotSelector
              date={currentDateView}
              existingSlots={timeSlots[currentDateView] || []}
              onSlotsChange={(slots) => handleSlotsChange(currentDateView, slots)}
            />
          ) : (
            <div className="no-date-selected">
              <p>Selecciona una fecha para agregar tus horarios disponibles.</p>
            </div>
          )}
        </div>
      </div>

      <button onClick={handleSubmit} className="submit-btn" disabled={selectedDates.length === 0}>
        Enviar Disponibilidad
      </button>
    </div>
  )
}

export default AvailabilitySelector
