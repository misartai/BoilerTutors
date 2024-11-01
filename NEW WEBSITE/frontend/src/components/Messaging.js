import React, { useState, useEffect } from 'react';

export default function Messages({ user }) {
  //pull components from User class
  const { email: userEmail } = user;
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);

  // Fetch messages when the component mounts or when a contact is selected
  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact);
    }
    fetchContacts(); // Fetch contacts list
  }, [selectedContact]);

  // Fetch messages between the user and a specific contact
  const fetchMessages = async (contactEmail) => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages?userEmail=${userEmail}&contactEmail=${contactEmail}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch contacts for the user
  const fetchContacts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contacts');
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  // Send a new message to the selected contact
  const sendMessage = async (e) => {
    e.preventDefault();

    const messageData = {
      senderEmail: userEmail,
      receiverEmail: selectedContact,
      content: newMessage,
    };

    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();
      setMessages([...messages, data]);
      setNewMessage(''); // Clear input after sending
    } catch (error) {
      console.error('Error sending message:', error);
      alert('There was an error sending the message. Please try again.');
    }
  };

  return (
    <div className="messages-container">
      <div className="contacts-list">
        <h3>Contacts</h3>
        <ul>
          {contacts.map((contact) => (
            <li
              key={contact.email}
              onClick={() => setSelectedContact(contact.email)}
              className={selectedContact === contact.email ? 'selected' : ''}
            >
              {contact.name} ({contact.email})
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-window">
        <h3>Chat with {selectedContact}</h3>
        <div className="messages-list">
          {messages.map((msg) => (
            <div key={msg._id} className={`message ${msg.senderEmail === userEmail ? 'sent' : 'received'}`}>
              <p>{msg.content}</p>
              <small>{new Date(msg.timestamp).toLocaleString()}</small>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="message-form">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            required
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}
