import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');  // Retrieve token from localStorage
        const response = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`  // Attach the token to the request
          }
        });
        setUser(response.data);
      } catch (err) {
        setError('Failed to load user data');
      }
    };

    fetchUserData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
      {/* Render other user-specific content here */}
    </div>
  );
}

export default Dashboard;
