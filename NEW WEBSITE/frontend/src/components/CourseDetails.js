import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './CourseDetails.css';

function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/courses/${courseId}`);
        const courseData = response.data;
        setCourse(courseData);
        console.log("Courses fetched");

        // Fetch tutors
        if (courseData.tutors.length > 0) {
          const tutorResponse = await axios.get('http://localhost:5000/api/users');
          const tutorsInCourse = tutorResponse.data.filter(user =>
            courseData.tutors.includes(user._id)
          );
          setTutors(tutorsInCourse);
        }
        console.log("Tutors fetched");
      } catch (err) {
        console.error('Error fetching course details:', err.message);
        setError('Failed to fetch course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {/* Course Name */}
      <h1>{course.courseName}</h1>

      {/* Course Description */}
      <p>{course.courseDescription}</p>
      <p>Additional course information will be uploaded below.</p>

      {/* Tutors List */}
      {tutors.length > 0 ? (
        <div>
          <h3>Tutors:</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {tutors.map(tutor => (
                <tr key={tutor._id}>
                  <td>{tutor.name}</td>
                  <td>{tutor.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No tutors assigned to this course.</p>
      )}
    </div>
  );
}

export default CourseDetails;
