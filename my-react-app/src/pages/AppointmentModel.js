import React, { useState } from "react";

const AppointmentModal = ({ slot, onClose, onSave }) => {
  const [name, setName] = useState("");

  const handleSave = () => {
    onSave(name);
  };

  return (
    <div className="modal">
      <h3>Book an appointment for {slot.day} at {slot.time}</h3>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default AppointmentModal;