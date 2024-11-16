import React, { useState, useEffect } from 'react';
import './Messages.css';

export default function Messages({ user }) {
  const { email: userEmail } = user;
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [selectedContact, setSelectedContact] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [view, setView] = useState('messages');
  const [announcementContent, setAnnouncementContent] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/messages?userEmail=${userEmail}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        const sixteenWeeksInMillis = 16 * 7 * 24 * 60 * 60 * 1000;
        const validMessages = data.filter((message) => (new Date() - new Date(message.createdAt)) <= sixteenWeeksInMillis);
        setMessages(validMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    const fetchContacts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users');
        if (!response.ok) throw new Error('Failed to fetch contacts');
        const data = await response.json();
        setContacts(data.filter((contact) => contact.email !== userEmail));
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchMessages();
    fetchContacts();
  }, [userEmail]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/announcements');
        if (!response.ok) throw new Error('Failed to fetch announcements');
        setAnnouncements(await response.json());
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageContent || !selectedContact) {
      alert("Please enter a message and select a recipient.");
      return;
    }

    const newMessage = {
      senderEmail: userEmail,
      recipientEmail: selectedContact,
      content: messageContent,
      timestamp: new Date(),
    };

    try {
      const response = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      });

      if (response.ok) {
        setMessageContent('');
      } else {
        alert("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();

    if (!announcementContent) {
      alert('Please enter an announcement.');
      return;
    }

    const newAnnouncement = {
      senderEmail: userEmail,
      content: announcementContent,
      isAnnouncement: true,
      timestamp: new Date(),
    };

    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnnouncement),
      });

      if (response.ok) {
        const savedAnnouncement = await response.json();
        setAnnouncements([...announcements, savedAnnouncement]);
        setAnnouncementContent('');
      } else {
        alert('Failed to send announcement');
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
    }
  };

  return (
    <div className="messages-main">
      {user.accountType === 'professor' && (
        <form className="announcement-form" onSubmit={handleSendAnnouncement}>
          <input
            type="text"
            placeholder="Type an announcement here..."
            value={announcementContent}
            onChange={(e) => setAnnouncementContent(e.target.value)}
          />
          <button type="submit">Send Announcement</button>
        </form>
      )}
      <div className="recipients-pane">
        <h3>Contacts</h3>
        {contacts.map((contact) => (
          <div
            key={contact.email}
            className={`contact-item ${selectedContact === contact.email ? 'active' : ''}`}
            onClick={() => setSelectedContact(contact.email)}
          >
            {contact.name} ({contact.email})
          </div>
        ))}
      </div>
      <div className="message-pane">
        <h3>Change View:</h3>
        <select onChange={(e) => setView(e.target.value)} value={view}>
          <option value="messages">Messages</option>
          <option value="announcements">Announcements</option>
        </select>
        <div className="message-list">
          {view === 'messages' ? (
            messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div key={idx} className="message-item">
                  <strong>{msg.senderEmail === userEmail ? 'You' : msg.senderEmail}:</strong> {msg.content}
                  <div className="timestamp">{new Date(msg.timestamp).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <p>No Messages Found</p>
            )
          ) : (
            announcements.length > 0 ? (
              announcements.map((ann, idx) => (
                <div key={idx} className="announcement-item">
                  <strong>Announcement:</strong> {ann.content}
                </div>
              ))
            ) : (
              <p>No Announcements Found</p>
            )
          )}
        </div>
        {view === 'messages' && (
          <form className="send-message-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type a message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        )}
      </div>
    </div>
  );
}
