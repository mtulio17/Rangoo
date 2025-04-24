"use client"

import { useState, useEffect } from "react"
import "../styles/Calendar.css"

function Calendar({ startDate, endDate, selectedDates = [], onDateSelect, readOnly = false }) {
  const [calendar, setCalendar] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selected, setSelected] = useState(new Set(selectedDates.map((date) => date)))

  // Convertir fechas de string a objetos Date
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Asegurarse de que las fechas no tengan componente de tiempo
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  // Actualizar el estado selected cuando cambian las selectedDates
  useEffect(() => {
    setSelected(new Set(selectedDates))
  }, [selectedDates])

  useEffect(() => {
    generateCalendar(currentMonth)
  }, [currentMonth, selectedDates])

  const generateCalendar = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()

    // Primer día del mes
    const firstDay = new Date(year, month, 1)
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0)

    // Día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
    const firstDayOfWeek = firstDay.getDay()

    // Crear array para el calendario
    const daysArray = []

    // Añadir días del mes anterior para completar la primera semana
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      daysArray.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isSelectable: false,
      })
    }

    // Añadir días del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i)
      daysArray.push({
        date: currentDate,
        isCurrentMonth: true,
        isSelectable: currentDate >= start && currentDate <= end,
      })
    }

    // Añadir días del mes siguiente para completar la última semana
    const remainingDays = 7 - (daysArray.length % 7)
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        daysArray.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false,
          isSelectable: false,
        })
      }
    }

    setCalendar(daysArray)
  }

  const handleDateClick = (day) => {
    if (readOnly || !day.isSelectable) return

    // Asegurarse de que la fecha esté en formato ISO sin componente de tiempo
    const dateObj = new Date(day.date)
    dateObj.setHours(0, 0, 0, 0)
    const dateStr = dateObj.toISOString().split("T")[0]

    const newSelected = new Set(selected)

    if (newSelected.has(dateStr)) {
      newSelected.delete(dateStr)
    } else {
      newSelected.add(dateStr)
    }

    setSelected(newSelected)

    if (onDateSelect) {
      onDateSelect(Array.from(newSelected))
    }
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const formatMonth = (date) => {
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  const isDateSelected = (date) => {
    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0)
    const dateStr = dateObj.toISOString().split("T")[0]
    return selected.has(dateStr)
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={prevMonth} className="month-nav">
          &lt;
        </button>
        <h3>{formatMonth(currentMonth)}</h3>
        <button onClick={nextMonth} className="month-nav">
          &gt;
        </button>
      </div>

      <div className="calendar-grid">
        <div className="weekday">Lun</div>
        <div className="weekday">Mar</div>
        <div className="weekday">Mié</div>
        <div className="weekday">Jue</div>
        <div className="weekday">Vie</div>
        <div className="weekday">Sáb</div>
        <div className="weekday">Dom</div>

        {calendar.map((day, index) => (
          <div
            key={index}
            className={`calendar-day 
                        ${!day.isCurrentMonth ? "other-month" : ""} 
                        ${day.isSelectable ? "selectable" : "disabled"} 
                        ${isDateSelected(day.date) ? "selected" : ""}`}
            onClick={() => handleDateClick(day)}
          >
            {day.date.getDate()}
            {day.isSelectable && <div className="selectable-indicator"></div>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Calendar
