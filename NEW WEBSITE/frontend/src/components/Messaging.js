import React, { useState, useEffect } from 'react';
import './Messages.css';

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
         <div className="view-select">
           <select onChange={(e) => setView(e.target.value)} value={view}>
             <option value="messages">Messages</option>
             <option value="announcements">Announcements</option>
           </select>
         </div>
         <div className="message-list">
           {view === 'messages' ? (
             messages.length > 0 ? (
               messages.map((msg, idx) => (
                 <div key={idx} className="message-item">
                   <strong>{msg.senderEmail === userEmail ? 'You' : msg.senderEmail}:</strong> {msg.content}
                       <div className="timestamp">
                          {msg.timestamp}
                       </div>
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
