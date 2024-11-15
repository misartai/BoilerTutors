import React, { useState, useEffect } from 'react';

export default function Messages({ user }) {
  const { email: userEmail } = user;
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [selectedContact, setSelectedContact] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [draft, setDrafts] = useState([]);
  const [view, setView] = useState('messages');
  const [announcementContent, setAnnouncementContent] = useState('');

  const initialMessageData = {
    recipientEmail: '',
    content: '',
    isAnnouncement: false,
  };

  const [messageData, setMessageData] = useState(initialMessageData);

  useEffect(() => {
    const handleBeforeExit = (event) => {
      event.preventDefault();
      event.returnValue = '';

      if (messageData.content && selectedContact) {
        handleSaveDraft();
      }
    };

    window.addEventListener('beforeunload', handleBeforeExit);
    return () => window.removeEventListener('beforeunload', handleBeforeExit);
  }, [messageData, selectedContact]);

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

  const handleSaveDraft = () => {
    if (!messageData.content || !messageData.recipientEmail) {
      return;
    }

    const draft = {
      senderEmail: userEmail,
      recipientEmail: messageData.recipientEmail,
      content: messageData.content,
      timestamp: new Date(),
    };

    setDrafts((prevDrafts) => [...prevDrafts, draft]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMessageData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageContent || !selectedContact) {
      alert("Please enter a message and select a recipient.");
      return;
    }

    const newMessage = {
      senderEmail: userEmail,
      recipientEmail: selectedContact,  // Use selectedContact for recipientEmail
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
        setMessageContent('');  // Reset message content field
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

      if (!response.ok) throw new Error('Failed to send announcement');
      const savedAnnouncement = await response.json();
      setAnnouncements([...announcements, savedAnnouncement]);
      setAnnouncementContent('');
    } catch (error) {
      console.error('Error sending announcement:', error);
      alert('There was an error sending the announcement.');
    }
  };

  const filteredMessages = messages.filter(
    (message) =>
      messageData.recipientEmail
        ? message.recipientEmail === messageData.recipientEmail ||
          message.senderEmail === messageData.recipientEmail
        : true
  );

  return (
    <div className="main">
      <div className="messages-container" style={{ display: 'flex', height: '100vh' }}>
        {user.accountType === 'professor' && (
          <form onSubmit={handleSendAnnouncement} style={{ display: 'flex', marginTop: '10px' }}>
            <input
              type="text"
              placeholder="Type an announcement here..."
              value={announcementContent}
              onChange={(e) => setAnnouncementContent(e.target.value)}
              style={{ flexGrow: 1, padding: '10px', borderRadius: '5px 0 0 5px', border: '1px solid #ddd' }}
            />
            <button
              type="submit"
              style={{
                padding: '10px',
                borderRadius: '0 5px 5px 0',
                border: '1px solid #ddd',
                background: '#4CAF50',
                color: '#fff',
              }}
            >
              Send Announcement
            </button>
          </form>
        )}

        <div className="recipients-pane" style={{ width: '25%', borderRight: '1px solid #ddd', padding: '10px' }}>
          <h3>Contacts</h3>
          {contacts.map((contact) => (
            <div
              key={contact.email}
              onClick={() => {
                setSelectedContact(contact.email);  // Set the selected contact email
                setMessageData({ ...messageData, recipientEmail: contact.email });  // Update recipientEmail in messageData
              }}
              style={{
                padding: '8px',
                cursor: 'pointer',
                background: selectedContact === contact.email ? '#f0f0f0' : 'transparent',
              }}
            >
              {contact.name} ({contact.email})
            </div>
          ))}
        </div>

        <div className="message-pane" style={{ width: '50%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '10px' }}>
            <label>View:</label>
            <select onChange={(e) => setView(e.target.value)} value={view}>
              <option value="messages">Messages</option>
              <option value="announcements">Announcements</option>
            </select>
          </div>

          <div
            style={{
              flexGrow: 1,
              overflowY: 'scroll',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
            }}
          >
            {view === 'messages' ? (
              filteredMessages.length > 0 ? (
                filteredMessages.map((message, index) => (
                  <div key={index} className="message-item">
                    <strong>{message.senderEmail === userEmail ? 'You' : message.senderEmail}:</strong> {message.content}
                    <div style={{ fontSize: '0.8em', color: '#999' }}>
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div>No Messages Found</div>
              )
            ) : announcements.length > 0 ? (
              announcements.map((announcement, index) => (
                <div key={index} className="announcement-item">
                  <strong>Announcement:</strong> {announcement.content}
                  <div style={{ fontSize: '0.8em', color: '#999' }}>
                    {new Date(announcement.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div>No Announcements Found</div>
            )}
          </div>

          {view === 'messages' && (
            <form onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          )}

          {view === 'announcements' && (
            <form onSubmit={handleSendAnnouncement}>
              <input
                type="text"
                placeholder="Type a message here..."
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          )}
      </div>
    </div>
  </div>
);
}
