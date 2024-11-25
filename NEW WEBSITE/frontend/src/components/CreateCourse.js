import React, { useState } from 'react';
import axios from 'axios';

function CreateCourse({ user }) {
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`http://localhost:5000/api/auth/courses`, {
        courseName,
        courseDescription,
        professorId: user._id,
      });
      setMessage('Course created successfully!');
      setCourseName('');
      setCourseDescription('');
    } catch (err) {
      console.error(err);
      console.error('Error creating course:', err.response?.data || err.message);
      setMessage('Failed to create course.');
    }
  };

  return (
    <div>
      <h2>Create a New Course</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Course Name:</label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Course Description:</label>
          <textarea
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateCourse;
