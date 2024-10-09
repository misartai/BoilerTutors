import React, { Component } from 'react';
import CalendarDays from './CalendarDays';
import './Calendar.css';

export default class Calendar extends Component {
  constructor() {
    super();

    this.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    this.months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const currentDate = new Date();

    this.state = {
      currentDay: currentDate,
      selectedYear: currentDate.getFullYear(),
      selectedMonth: currentDate.getMonth(),
      selectedDate: currentDate.getDate(),
      appointments: {}
    };
  }

  changeCurrentDay = (day) => {
    this.setState({ currentDay: new Date(day.year, day.month, day.number) });
  };

  handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    const { selectedYear, selectedDate } = this.state;
    this.setState({ selectedMonth: newMonth });
    this.updateCurrentDay(selectedYear, newMonth, selectedDate);
  };

  handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    const { selectedMonth, selectedDate } = this.state;
    this.setState({ selectedYear: newYear });
    this.updateCurrentDay(newYear, selectedMonth, selectedDate);
  };

  handleDayChange = (e) => {
    const newDate = parseInt(e.target.value);
    const { selectedYear, selectedMonth } = this.state;
    this.setState({ selectedDate: newDate });
    this.updateCurrentDay(selectedYear, selectedMonth, newDate);
  };

  updateCurrentDay = (year, month, day) => {
    this.setState({ currentDay: new Date(year, month, day) });
  };

  handleAppointmentBooking = () => {
    const { currentDay, appointments } = this.state;
    const appointmentText = prompt('Enter appointment details:');

    if (appointmentText) {
      const dateKey = currentDay.toDateString(); 
      const updatedAppointments = { appointments, [dateKey]: appointmentText };

      this.setState({ appointments: updatedAppointments });
      alert('Appointment booked for ' + dateKey);
    }
  };

  getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  render() {
    const { selectedYear, selectedMonth, selectedDate, currentDay, appointments } = this.state;
    const availableYears = Array.from({ length: 3 }, (_, i) => selectedYear + i); 
    const daysInMonth = this.getDaysInMonth(selectedMonth, selectedYear); 

    const dateKey = currentDay.toDateString();
    const appointmentForDay = appointments[dateKey];

    return (
      <div className="calendar-container">
        <div className="calendar">
          <div className="calendar-header">
            <div className="title">
              <h2>{this.months[currentDay.getMonth()]} {currentDay.getFullYear()}</h2>
            </div>
          </div>

          <div className="filters">
            <select value={selectedMonth} onChange={this.handleMonthChange}>
              {this.months.map((month, index) => (
                <option value={index} key={month}>{month}</option>
              ))}
            </select>

            <select value={selectedYear} onChange={this.handleYearChange}>
              {availableYears.map(year => (
                <option value={year} key={year}>{year}</option>
              ))}
            </select>

            <select value={selectedDate} onChange={this.handleDayChange}>
              {Array.from({ length: daysInMonth }, (_, index) => (
                <option value={index + 1} key={index + 1}>{index + 1}</option>
              ))}
            </select>
          </div>

          <div className="calendar-body">
            <div className="table-header">
              {this.weekdays.map((weekday) => (
                <div className="weekday" key={weekday}><p>{weekday}</p></div>
              ))}
            </div>
            <CalendarDays day={currentDay} changeCurrentDay={this.changeCurrentDay} />
          </div>
        </div>

        <div className="appointment-section">
          <h3>Appointments for {currentDay.toDateString()}</h3>
          {appointmentForDay ? (
            <p>{appointmentForDay}</p>
          ) : (
            <p>No appointments</p>
          )}
          <button onClick={this.handleAppointmentBooking}>Book Appointment</button>
        </div>
      </div>
    );
  }
}
