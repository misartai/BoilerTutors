import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddCourse({ user, onReturn }) {
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState(new Set(user.enroledCourses)); // Pre-check existing courses

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses');
        setAllCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err.message);
      }
    };
    fetchCourses();
  }, []);

  const handleCheckboxChange = (courseId) => {
    const updatedCourses = new Set(selectedCourses);
    if (updatedCourses.has(courseId)) {
      updatedCourses.delete(courseId);
    } else {
      updatedCourses.add(courseId);
    }
    setSelectedCourses(updatedCourses);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`http://localhost:5000/api/students/${user._id}/enrol`, {
        enroledCourses: Array.from(selectedCourses), // Convert Set to Array
      });
      alert('Courses updated successfully!');
      onReturn(); // Go back to the dashboard
    } catch (err) {
      console.error('Error updating courses:', err.message);
      alert('Failed to update courses.');
    }
  };

  return (
    <div>
      <h1>Add Courses</h1>
      <ul>
        {allCourses.map((course) => (
          <li key={course._id}>
            <label>
              <input
                type="checkbox"
                checked={selectedCourses.has(course._id)}
                onChange={() => handleCheckboxChange(course._id)}
              />
              {course.courseName}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleSubmit}>Save Courses</button>
    </div>
  );
}

export default AddCourse;
