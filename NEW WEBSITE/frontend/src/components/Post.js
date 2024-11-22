import React, { useState } from 'react';
import { FaHeart } from 'react-icons/fa';

const Post = ({
  post,
  isExpanded,
  handleExpand,
  currentUserId,
  currentUserFavorites = [], // Default to empty array
  handleDeletePost,
  handleEditPost,
  handleAddReply,
  handleUpvote,
  handleDownvote,
  handleToggleFavorite,
}) => {
  // Log to help debug
  console.log('Post component:', { post, currentUserFavorites });

  const isFavorited = currentUserFavorites
    .map(String)
    .includes(post._id.toString());

  const [isEditing, setIsEditing] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState(post.title);
  const [updatedContent, setUpdatedContent] = useState(post.content);
  const [replyContent, setReplyContent] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Save Edited Post
  const saveEdit = async () => {
    await handleEditPost(post._id, updatedTitle, updatedContent);
    setIsEditing(false);
  };

  // Submit Reply
  const submitReply = async (e) => {
    e.preventDefault();
    if (replyContent.trim() !== '') {
      await handleAddReply(post._id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  return (
    <div className="post">
      <h2 onClick={handleExpand} style={{ cursor: 'pointer' }}>
        {post.title}
      </h2>
      {isExpanded && (
        <>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={updatedTitle}
                onChange={(e) => setUpdatedTitle(e.target.value)}
              />
              <textarea
                value={updatedContent}
                onChange={(e) => setUpdatedContent(e.target.value)}
                rows="4"
              />
              <button onClick={saveEdit}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          ) : (
            <div>
              <p>{post.content}</p>
              <p>
                <strong>Author:</strong> {post.author?.name || 'Unknown'} (
                {post.author?.accountType || 'Unknown Role'})
              </p>
              <div className="post-actions">
                <button onClick={() => handleUpvote(post._id)}>Upvote</button>
                <span>{post.upvotes} Upvotes</span>
                <button onClick={() => handleDownvote(post._id)}>Downvote</button>
                <span>{post.downvotes} Downvotes</span>
                <button onClick={() => handleToggleFavorite(post._id)}>
                  <FaHeart color={isFavorited ? 'red' : 'grey'} />
                </button>
                <button onClick={() => setShowReplyForm(!showReplyForm)}>
                  {showReplyForm ? 'Cancel Reply' : 'Reply'}
                </button>
                {post.author?._id === currentUserId && (
                  <>
                    <button onClick={() => setIsEditing(true)}>Edit</button>
                    <button onClick={() => handleDeletePost(post._id)}>Delete</button>
                  </>
                )}
              </div>
              {showReplyForm && (
                <div className="reply-form">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows="3"
                    placeholder="Write your reply..."
                  />
                  <button onClick={submitReply}>Submit Reply</button>
                </div>
              )}
              {Array.isArray(post.replies) && post.replies.length > 0 && (
                <div className="replies">
                  <h3>Replies:</h3>
                  {post.replies.map((reply, index) => (
                    <div key={index} className="reply">
                      <p>
                        <strong>{reply.author?.name || 'Anonymous'}:</strong>
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Post;
