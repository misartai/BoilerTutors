import React, { useState, useEffect } from 'react';
import axios from 'axios';  // Make sure axios is imported
import './DiscussionBoard.css';
import Post from './Post'; // Import the Post component

const DiscussionBoard = () => {
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Fetch all posts once on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []); // Empty dependency array means this only runs once, preventing infinite loops

  // Handler for creating a new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/posts', {
        title: newPostTitle,
        content: newPostContent,
        author: 'currentUserId', // Replace with the actual user id
      });
      setPosts([...posts, response.data]);
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Handler for deleting a post
  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:3000/posts/${postId}`);
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Handler for editing a post
  const handleEditPost = async (postId, updatedTitle, updatedContent) => {
    try {
      const response = await axios.put(`http://localhost:3000/posts/${postId}`, {
        title: updatedTitle,
        content: updatedContent,
      });
      setPosts(posts.map((post) => (post._id === postId ? response.data : post)));
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  // Handler for adding a reply to a post
  const handleAddReply = async (postId, replyContent) => {
    try {
      const response = await axios.post(`http://localhost:3000/posts/${postId}/replies`, {
        content: replyContent,
        author: 'currentUserId', // Replace with the actual user id
      });
      setPosts(posts.map((post) => (post._id === postId ? response.data : post)));
    } catch (error) {
      console.error('Error adding reply:', error);
    }
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
            key={post._id}
            post={post}
            currentUserId={'currentUserId'}
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