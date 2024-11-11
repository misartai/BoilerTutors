import React, { useState } from 'react';

const Post = ({ post, currentUserId, handleDeletePost, handleEditPost, handleAddReply }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState(post.title);
  const [updatedContent, setUpdatedContent] = useState(post.content);
  const [replyContent, setReplyContent] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Save edited post
  const saveEdit = async () => {
    await handleEditPost(post._id, updatedTitle, updatedContent);
    setIsEditing(false);
  };

  // Add reply to post
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
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          {/* Actions */}
          <div className="post-actions">
            <button onClick={() => setShowReplyForm(!showReplyForm)}>
              {showReplyForm ? 'Cancel Reply' : 'Reply'}
            </button>
            {post.author === currentUserId && (
              <>
                <button onClick={() => setIsEditing(true)}>Edit</button>
                <button onClick={() => handleDeletePost(post._id)}>Delete</button>
              </>
            )}
          </div>
          {/* Reply Form */}
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
          {/* Replies */}
          {post.replies && post.replies.length > 0 && (
            <div className="replies">
              <h3>Replies:</h3>
              {post.replies.map((reply, index) => (
                <div key={index} className="reply">
                  <p><strong>{reply.author}:</strong> {reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Post;