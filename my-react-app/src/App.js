// src/App.js

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Outlet,
} from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import DiscussionBoard from './pages/discussionBoard';
import RateTutor from './pages/rateTutor.js';

function Layout() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to the App</h1>
        {/* Navigation Links */}
        <nav>
          <Link to="/">Home</Link> |{' '}
          <Link to="/discussion-board">Discussion Board</Link>|{' '}
          <Link to="/rate-tutor">Rate Tutor</Link>
        </nav>
      </header>
      {/* Outlet renders the matched child route component */}
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Parent route with a layout */}
        <Route path="/" element={<Layout />}>
          {/* Index route renders at the parent path */}
          <Route index element={<Home />} />
          {/* Child route */}
          <Route path="discussion-board" element={<DiscussionBoard />} />
          <Route path="rate-tutor" element={<RateTutor />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
