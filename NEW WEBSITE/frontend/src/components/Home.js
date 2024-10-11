import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Welcome to BoilerTutors</h1>
      <p>Login or Signup to get learning!</p>
      <Link to="/signup">Sign Up</Link> | <Link to="/login">Login</Link>
    </div>
  );
}

export default Home;
