import React, { useState } from "react";
import AppointmentModal from "./AppointmentModal";

const CalendarComponent = () => {
  const [appointments, setAppointments] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = [
    { day: "Monday", time: "11:30am", label: "Appointment" },
    { day: "Tuesday", time: "1pm-5pm", label: "Office Hours CS 100" },
    { day: "Wednesday", time: "1pm-5pm", label: "Office Hours CS 100" },
    { day: "Thursday", time: "1pm-5pm", label: "Office Hours CS 100" },
    { day: "Friday", time: "1pm-5pm", label: "Office Hours CS 100" },
    { day: "Wednesday", time: "ECON 100", label: "Study Session" },
    { day: "Thursday", time: "ECON 100", label: "Study Session" }
  ];

  const handleSlotClick = (day, time) => {
    setSelectedSlot({ day, time });
  };

  const addAppointment = (name) => {
    setAppointments((prev) => ({
      ...prev,
      [selectedSlot.day + selectedSlot.time]: name
    }));
    setSelectedSlot(null);
  };

  return (
    <div className="calendar">
      <table>
        <thead>
          <tr>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {days.map((day) => (
              <td key={day}>
                {slots
                  .filter((slot) => slot.day === day)
                  .map((slot) => (
                    <div key={slot.time} className="slot" onClick={() => handleSlotClick(day, slot.time)}>
                      {appointments[day + slot.time] ? (
                        <div>{appointments[day + slot.time]}</div>
                      ) : (
                        <div>{slot.label}</div>
                      )}
                    </div>
                  ))}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {selectedSlot && (
        <AppointmentModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSave={addAppointment}
        />
      )}
    </div>
  );
};

export default CalendarComponent;
