import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './discussionBoard.css';
import Post from './Post';

const DiscussionBoard = () => {
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showFavourites, setShowFavourites] = useState(false);
  const [showPostHistory, setShowPostHistory] = useState(false);
  const [deletedPosts, setDeletedPosts] = useState([]);

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
  }, []);


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

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:3000/posts/${postId}`);
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

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

  const fetchDeletedPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/posts/deleted');
      console.log('Deleted posts:', response.data); // Debugging line
      setDeletedPosts(response.data);
    } catch (error) {
      console.error('Error fetching deleted posts:', error);
    }
  };
  
  
  const handleShowPostHistory = () => {
    setShowPostHistory(!showPostHistory);
    if (!showPostHistory) {
      fetchDeletedPosts();
    }
  };

  const toggleFavourite = async (postId) => {
    console.log("Favourite button clicked for post:", postId); // Debugging line
    try {
      const response = await axios.put(`http://localhost:3000/posts/${postId}/favourite`);
      console.log("Updated post from server:", response.data); // Debugging line
      const updatedPosts = posts.map((post) =>
        post._id === postId ? response.data : post
      );
      console.log("Updated posts:", updatedPosts); // Debugging line
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error toggling favourite status:', error);
    }
  };
  
  const toggleBookmark = async (postId) => {
    console.log("Bookmark button clicked for post:", postId); // Debugging line
    try {
      const response = await axios.put(`http://localhost:3000/posts/${postId}/bookmark`);
      setPosts(posts.map((post) => (post._id === postId ? response.data : post)));
    } catch (error) {
      console.error('Error toggling bookmark status:', error);
    }
  };
  
  

  const sortedPosts = [...posts].sort((a, b) => {
  if (a.isBookmarked === b.isBookmarked) {
    return 0;
  }
  return a.isBookmarked ? -1 : 1;
});

const filteredPosts = sortedPosts
  .filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .filter((post) => (showFavourites ? post.isFavourite : true));


  return (
    <div>
      <h1 className="web-name">Discussion Board</h1>
  
      {/* Options */}
      <div className="options">
        <button onClick={() => setShowCreatePost(!showCreatePost)}>
          {showCreatePost ? 'Cancel' : 'Create Post'}
        </button>
        <button onClick={() => setShowFavourites(!showFavourites)}>
          {showFavourites ? 'Show All Posts' : 'Show Favourites'}
        </button>
        <button onClick={handleShowPostHistory}>
          {showPostHistory ? 'Hide Post History' : 'Show Post History'}
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
  
      {showPostHistory ? (
  <div>
    <h2>Deleted Posts</h2>
    {deletedPosts.length === 0 ? (
      <p>No deleted posts found.</p>
    ) : (
      deletedPosts.map((post) => (
        <div key={post._id} className="post deleted">
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <div className="post-meta">
            <span>Deleted by: {post.author}</span>
            <span>Deleted at: {new Date(post.createdAt).toLocaleString()}</span>
          </div>
        </div>
      ))
    )}
  </div>
) : (
  <>
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
          toggleFavourite={toggleFavourite}
          toggleBookmark={toggleBookmark}
        />
      ))
    )}
  </>
)}
    </div>
  );

};

export default DiscussionBoard;
