import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, AlertCircle, Check } from 'lucide-react';
import './DeliveryDateTimePicker.css';

export default function DeliveryDateTimePicker({ selectedDeliveryTime, onChangeDeliveryTime }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAsap, setIsAsap] = useState(!selectedDeliveryTime || selectedDeliveryTime === 'ASAP');
  
  // Date state
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const containerRef = useRef(null);

  // Helper to check if current time is past 21:45 today
  const isPastCutoffToday = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const totalMinutes = currentHour * 60 + currentMin;
    // 21:45 = 21 * 60 + 45 = 1305 minutes
    return totalMinutes >= 1305;
  };

  // Helper to check if store is currently open (11:00 to 21:45)
  const isCurrentlyOpenForAsap = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const totalMinutes = currentHour * 60 + currentMin;
    // Open 11:00 (660 mins) to 21:45 (1305 mins)
    return totalMinutes >= 660 && totalMinutes < 1305;
  };

  // Generate available time slots for a given date
  const getAvailableTimeSlots = (targetDate) => {
    const slots = [];
    const isTargetToday = targetDate.toDateString() === today.toDateString();
    
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    // Prep/delivery buffer: 30 mins from now if today
    const earliestAllowedMinuteToday = Math.max(11 * 60, currentTotalMinutes + 30);

    // Opening 11:00 (660) to 21:30 (1290) in 30-minute intervals
    // Cut-off is strictly 21:45, so 21:30 is the last order slot before 21:45
    for (let hour = 11; hour <= 21; hour++) {
      for (let min of [0, 30]) {
        const slotTotalMinutes = hour * 60 + min;
        // Strict rule: Ab 21:45 Uhr kann man nichts mehr auswählen. (No slot >= 21:45)
        if (slotTotalMinutes >= 1305) continue; 
        
        if (isTargetToday) {
          // If today and slot is before earliest allowed buffer, skip
          if (slotTotalMinutes < earliestAllowedMinuteToday) continue;
        }

        const formattedHour = String(hour).padStart(2, '0');
        const formattedMin = String(min).padStart(2, '0');
        slots.push(`${formattedHour}:${formattedMin}`);
      }
    }

    return slots;
  };

  // Month navigation
  const prevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Days in month calculation
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    // Convert Sunday=0 to Monday=0 indexing (0=Mon, 6=Sun)
    return day === 0 ? 6 : day - 1;
  };

  // Handle clicking outside to close popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update parent state when ASAP or date/time slot changes
  const handleSelectAsap = () => {
    if (!isCurrentlyOpenForAsap()) {
      alert("Schnellstmöglich ist aktuell leider nicht verfügbar (Öffnungszeiten: 11:00 - 22:00 Uhr, Bestellschluss 21:45 Uhr). Bitte wählen Sie einen verfügbaren Wunschtermin.");
      return;
    }
    setIsAsap(true);
    setSelectedTimeSlot('');
    onChangeDeliveryTime({ type: 'ASAP', label: 'Schnellstmöglich (ca. 30–45 Min.)' });
    setIsOpen(false);
  };

  const handleSelectTimeSlot = (slot) => {
    setSelectedTimeSlot(slot);
    setIsAsap(false);

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDateStr = `${year}-${month}-${day}`;
    
    const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const dayName = dayNames[selectedDate.getDay()];
    const dateFormatted = `${dayName}, ${day}.${month}.${year}`;

    const fullLabel = `${dateFormatted} um ${slot} Uhr`;

    onChangeDeliveryTime({
      type: 'SCHEDULED',
      date: formattedDateStr,
      time: slot,
      label: fullLabel
    });

    setIsOpen(false);
  };

  // Calendar rendering data
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);

  const availableSlots = getAvailableTimeSlots(selectedDate);
  const isTodayPastCutoff = isPastCutoffToday();

  return (
    <div className="delivery-datetime-container" ref={containerRef}>
      <label className="datetime-label">
        <Clock size={16} className="label-icon" /> Lieferzeit / Abholzeit wählen *
      </label>

      {/* Selector Box / Mode Tabs */}
      <div className="datetime-options-toggle">
        <button
          type="button"
          className={`datetime-tab ${isAsap ? 'active' : ''} ${!isCurrentlyOpenForAsap() ? 'disabled' : ''}`}
          onClick={handleSelectAsap}
        >
          🚀 Schnellstmöglich
          <span className="tab-subtext">ca. 30–45 Min.</span>
        </button>

        <button
          type="button"
          className={`datetime-tab ${!isAsap ? 'active' : ''}`}
          onClick={() => setIsOpen(true)}
        >
          📅 Wunschtermin
          <span className="tab-subtext">
            {!isAsap && selectedDeliveryTime?.label ? selectedDeliveryTime.label : 'Datum & Zeit wählen'}
          </span>
        </button>
      </div>

      {/* Input Display Bar */}
      <div className="datetime-display-bar" onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={18} color="#cfa670" />
        <span className="display-text">
          {isAsap 
            ? 'Schnellstmöglich (ca. 30–45 Min.)' 
            : (selectedDeliveryTime?.label || 'Wunschtermin auswählen...')}
        </span>
        <span className="picker-trigger-btn">Ändern</span>
      </div>

      {/* Notice if after 21:45 today */}
      {isTodayPastCutoff && isAsap && (
        <div className="cutoff-warning animate-fade-in">
          <AlertCircle size={16} /> 
          <span>Ab 21:45 Uhr sind heute keine Sofortbestellungen mehr möglich (Schließzeit 22:00 Uhr). Bitte wählen Sie einen Wunschtermin für morgen.</span>
        </div>
      )}

      {/* Calendar & Time Slots Popover Dialog */}
      {isOpen && (
        <div className="datetime-popover animate-fade-in">
          <div className="popover-header">
            <h4>Lieferdatum & Uhrzeit auswählen</h4>
            <span className="cutoff-note">Öffnungszeiten: 11:00 - 22:00 Uhr (Bestellannahme bis 21:45 Uhr)</span>
          </div>

          <div className="popover-content">
            {/* Left side: Calendar */}
            <div className="calendar-section">
              <div className="calendar-header">
                <button type="button" onClick={prevMonth} className="cal-nav-btn"><ChevronLeft size={18} /></button>
                <span className="cal-title">{monthNames[currentMonth]} {currentYear}</span>
                <button type="button" onClick={nextMonth} className="cal-nav-btn"><ChevronRight size={18} /></button>
              </div>

              <div className="weekdays-grid">
                <span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span>
              </div>

              <div className="days-grid">
                {/* Empty slots before day 1 */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="day-cell empty" />
                ))}

                {/* Day numbers */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const thisDate = new Date(currentYear, currentMonth, dayNum);
                  
                  // Check if day is before today
                  const isPastDay = thisDate.setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
                  // Check if today past cutoff (21:45)
                  const isToday = thisDate.toDateString() === today.toDateString();
                  const isDisabledToday = isToday && isPastCutoffToday();
                  
                  const isDisabled = isPastDay || isDisabledToday;

                  const isSelected = selectedDate.toDateString() === thisDate.toDateString();

                  return (
                    <button
                      key={`day-${dayNum}`}
                      type="button"
                      disabled={isDisabled}
                      className={`day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => {
                        setSelectedDate(new Date(currentYear, currentMonth, dayNum));
                      }}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side: Time Slots */}
            <div className="timeslots-section">
              <h5 className="timeslots-title">
                Verfügbare Zeiten ({selectedDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}):
              </h5>
              
              <div className="timeslots-list">
                {availableSlots.length > 0 ? (
                  availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      className={`timeslot-btn ${selectedTimeSlot === slot && !isAsap ? 'selected' : ''}`}
                      onClick={() => handleSelectTimeSlot(slot)}
                    >
                      {slot} Uhr
                    </button>
                  ))
                ) : (
                  <div className="no-slots-msg">
                    Keine weiteren Lieferzeiten für dieses Datum verfügbar (Ab 21:45 Uhr geschlossen).
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="popover-footer">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsOpen(false)}>
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
