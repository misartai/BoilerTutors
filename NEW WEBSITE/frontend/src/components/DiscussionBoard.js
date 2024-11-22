import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DiscussionBoard.css';
import Post from './Post';

const DiscussionBoard = () => {
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  // DiscussionBoard.js
const [currentUserFavorites, setCurrentUserFavorites] = useState([]);


  // Fetch posts and user info on component mount
  useEffect(() => {
    const fetchPostsAndUser = async () => {
      try {
        // Fetch posts
        const postsResponse = await axios.get('http://localhost:5000/posts/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setPosts(postsResponse.data);
  
        // Fetch current user
        const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCurrentUser(userResponse.data);
        setCurrentUserFavorites(userResponse.data.favorites || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchPostsAndUser();
  }, []);

  // Create Post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/postRoutes/create',
        {
          title: newPostTitle,
          content: newPostContent,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPosts([...posts, response.data]);
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Delete Post
  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/postRoutes/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Edit Post
  const handleEditPost = async (postId, updatedTitle, updatedContent) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/postRoutes/${postId}`,
        {
          title: updatedTitle,
          content: updatedContent,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPosts(posts.map((post) => (post._id === postId ? response.data : post)));
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  // Add Reply
  const handleAddReply = async (postId, replyContent) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/postRoutes/${postId}/replies`,
        { content: replyContent },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPosts(posts.map((post) => (post._id === postId ? response.data : post)));
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  // Upvote
  const handleUpvote = async (postId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/postRoutes/${postId}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPosts(posts.map((post) => (post._id === postId ? response.data : post)));
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };

  // Downvote
  const handleDownvote = async (postId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/postRoutes/${postId}/downvote`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPosts(posts.map((post) => (post._id === postId ? response.data : post)));
    } catch (error) {
      console.error('Error downvoting post:', error);
    }
  };

  const handleToggleFavorite = async (postId) => {
    try {
      const isFavorited = currentUserFavorites.includes(postId);
      if (isFavorited) {
        // Remove from favorites
        await axios.delete(`http://localhost:5000/api/postRoutes/${postId}/favourite`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCurrentUserFavorites(currentUserFavorites.filter((id) => id !== postId));
      } else {
        // Add to favorites
        await axios.post(
          `http://localhost:5000/api/auth/favorites/${postId}`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setCurrentUserFavorites([...currentUserFavorites, postId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };



  // Search Filter
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.author?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 className="web-name">Discussion Board</h1>
      {currentUser && <h2>Welcome, {currentUser.name}!</h2>}
      <div className="options">
        <button onClick={() => setShowCreatePost(!showCreatePost)}>
          {showCreatePost ? 'Cancel' : 'Create Post'}
        </button>
        <button onClick={() => setShowFavorites(!showFavorites)}>
          {showFavorites ? 'View All Posts' : 'View Favorites'}
        </button>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {showCreatePost && (
        <form onSubmit={handleCreatePost}>
          <h2>Create a New Post</h2>
          <label>
            Title:
            <input
              type="text"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            Content:
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows="5"
              placeholder="Type your post content here..."
              required
            />
          </label>
          <br />
          <button type="submit">Submit</button>
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
            currentUserId={currentUser?._id}
            currentUserFavorites={currentUserFavorites || []}
            handleDeletePost={handleDeletePost}
            handleEditPost={handleEditPost}
            handleAddReply={handleAddReply}
            handleUpvote={handleUpvote}
            handleDownvote={handleDownvote}
            handleToggleFavorite={handleToggleFavorite}
          />
        ))
      )}
    </div>
  );
};

export default DiscussionBoard;

