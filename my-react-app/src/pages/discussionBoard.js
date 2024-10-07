// src/pages/discussionBoard.js

import React, { useState, useEffect } from 'react';
import './discussionBoard.css';
import Post from './Post'; // Import the Post component

const DiscussionBoard = () => {
  // Simulate current user ID
  const currentUserId = 1;

  // Initialize posts from localStorage
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem('posts');
    const loadedPosts = savedPosts ? JSON.parse(savedPosts) : [];
    // Ensure all posts have a 'replies' array
    return loadedPosts.map((post) => ({
      ...post,
      replies: post.replies || [],
    }));
  });

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('posts', JSON.stringify(posts));
  }, [posts]);

  // Handler for creating a new post
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (newPostTitle && newPostContent) {
      const newPost = {
        id: Date.now(),
        userId: currentUserId,
        title: newPostTitle,
        content: newPostContent,
        replies: [], // Ensure replies is initialized as an empty array
      };
      setPosts([...posts, newPost]);
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreatePost(false);
    }
  };

  // Handler for deleting a post
  const handleDeletePost = (postId) => {
    const updatedPosts = posts.filter((post) => post.id !== postId);
    setPosts(updatedPosts);
  };

  // Handler for editing a post
  const handleEditPost = (postId, updatedTitle, updatedContent) => {
    const updatedPosts = posts.map((post) =>
      post.id === postId ? { ...post, title: updatedTitle, content: updatedContent } : post
    );
    setPosts(updatedPosts);
  };

  // Handler for adding a reply to a post
  const handleAddReply = (postId, replyContent) => {
    const updatedPosts = posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            replies: [...(post.replies || []), { content: replyContent, userId: currentUserId }],
          }
        : post
    );
    setPosts(updatedPosts);
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 className="web-name">Discussion Board</h1>

      {/* Options */}
      <div className="options">
        <button onClick={() => setShowCreatePost(!showCreatePost)}>
          {showCreatePost ? 'Cancel' : 'Create Post'}
        </button>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Create Post Form */}
      {showCreatePost && (
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
      )}

      <hr />

      <h2>Posts</h2>
      {filteredPosts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        filteredPosts.map((post) => (
          <Post
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            handleDeletePost={handleDeletePost}
            handleEditPost={handleEditPost}
            handleAddReply={handleAddReply}
          />
        ))
      )}
    </div>
  );
};

export default DiscussionBoard;
