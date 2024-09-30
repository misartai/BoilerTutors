// src/pages/discussionBoard.js
import React from 'react';
import { useState, useEffect } from 'react';
import './discussionBoard.css';

const DiscussionBoard = () => {
  // Initialize posts from localStorage
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem('posts');
    return savedPosts ? JSON.parse(savedPosts) : [];
  });
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  // Save posts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('posts', JSON.stringify(posts));
  }, [posts]);

  // Handler for creating a new post
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (newPostTitle && newPostContent) {
      const newPost = {
        title: newPostTitle,
        content: newPostContent,
      };
      setPosts([...posts, newPost]);
      setNewPostTitle('');
      setNewPostContent('');
    }
  };

  return (
    <div>
      <h1 className="web-name">Discussion Board</h1>

      <form onSubmit={handleCreatePost}>
        <h2>Create a New Post</h2>
        <p>
          <label>
            Title:<br />
            <input
              type="text"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              required
            />
          </label>
        </p>
        <p>
          <label>
            Content:<br />
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows="5"
              cols="50"
              required
            />
          </label>
        </p>
        <p>
          <button type="submit">Submit</button>
        </p>
      </form>

      <hr />

      <h2>Posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post, index) => (
          <div key={index} className="post">
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default DiscussionBoard;
