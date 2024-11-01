import React, { useState, useEffect } from 'react';

export default function Messages({ user }) {
  const { email: userEmail } = user;
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [view, setView] = useState('messages');

  useEffect(() => {
      const fetchMessages = async () => {
          try {
              const response = await fetch(`http://localhost:5000/api/messages?userEmail=${userEmail}`);
              if (!response.ok) {
                  throw new Error('Failed to fetch messages');
              }
              const data = await response.json();
              const currentDate = new Date();
              const sixteenWeeksInMillis = 16 * 7 * 24 * 60 * 60 * 1000; // 16 weeks in milliseconds

              // Filter messages that are not older than 16 weeks
              const validMessages = data.filter(message => {
                  const messageDate = new Date(message.createdAt);
                  return (currentDate - messageDate) <= sixteenWeeksInMillis;
              });

              setMessages(validMessages);
          } catch (error) {
              console.error('Error fetching messages:', error);
          }
      };

      const fetchContacts = async () => {
          try {
              const response = await fetch(`http://localhost:5000/api/contacts?userEmail=${userEmail}`);
              if (!response.ok) {
                  throw new Error('Failed to fetch contacts');
              }
              const data = await response.json();
              setContacts(data);
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
              if (!response.ok) {
                  throw new Error('Failed to fetch announcements');
              }
              const data = await response.json();
              setAnnouncements(data);
          } catch (error) {
              console.error('Error fetching announcements:', error);
          }
      };

      fetchAnnouncements();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageContent) {
      alert('Please enter a message.');
      return;
    }

    const newMessage = {
      senderEmail: userEmail,
      recipientEmail: selectedContact,
      content: messageContent,
    };

    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const savedMessage = await response.json();
      setMessages([...messages, savedMessage]);
      setMessageContent('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('There was an error sending the message. Please try again.');
    }
  };

  const filteredMessages = messages.filter(message => {
    return selectedContact ? message.recipientEmail === selectedContact || message.senderEmail === selectedContact : true;
  });

  return (
    <div className="main">
      <div className="messages-container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ marginBottom: '10px', width: '100%' }}>
            <label style={{ marginRight: '5px' }}>View:</label>
            <select onChange={(e) => setView(e.target.value)} value={view}>
              <option value="messages">Messages</option>
              <option value="announcements">Announcements</option>
            </select>
          </div>

          {view === 'messages' && (
            <>
              <div style={{ marginBottom: '10px', width: '100%' }}>
                <label style={{ marginRight: '5px' }}>Filter by Contact:</label>
                <select onChange={(e) => setSelectedContact(e.target.value)} value={selectedContact}>
                  <option value="">All Contacts</option>
                  {contacts.map(contact => (
                    <option key={contact.email} value={contact.email}>
                      {contact.name} ({contact.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="messages-list" style={{ width: '100%', maxHeight: '400px', overflowY: 'scroll' }}>
                {filteredMessages.map((message, index) => (
                  <div key={index} className="message-item">
                    <strong>{message.senderEmail === userEmail ? 'You' : message.senderEmail}:</strong> {message.content}
                  </div>
                ))}
              </div>
            </>
          )}

          {view === 'announcements' && (
            <div className="announcements-list" style={{ width: '100%', maxHeight: '400px', overflowY: 'scroll' }}>
              {announcements.map((announcement, index) => (
                <div key={index} className="announcement-item">
                  <strong>Announcement:</strong> {announcement.content}
                </div>
              ))}
            </div>
          )}

          {view === 'messages' && (
            <div className="message-form" style={{ width: '100%', marginTop: '10px' }}>
              <form onSubmit={handleSendMessage}>
                <div>
                  <label>Message:</label>
                  <input
                    type="text"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Recipient:</label>
                  <select
                    value={selectedContact}
                    onChange={(e) => setSelectedContact(e.target.value)}
                    required
                  >
                    <option value="">Select Contact</option>
                    {contacts.map(contact => (
                      <option key={contact.email} value={contact.email}>
                        {contact.name} ({contact.email})
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit">Send Message</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
