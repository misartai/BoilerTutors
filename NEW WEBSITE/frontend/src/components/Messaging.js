import React, { useState, useEffect } from 'react';

export default function Messages({ user }) {
  const { email: userEmail, accountType } = user;
  const [messages, setMessages] = useState([
    {senderEmail: 'misartai@purdue.edu', recipientEmail: "ashahu@purdue.edu", content: 'Hello!', timestamp: new Date() },
    {senderEmail: 'ashahu@purdue.edu', recipientEmail: 'misartai@purdue.edu', content: 'How are you?', timestamp: new Date() },
    {senderEmail: 'ashahu@purdue.edu', recipientEmail: 'misartai@purdue.edu', content: 'How are classes?', timestamp: new Date() },
  ]);
  const [contacts, setContacts] = useState([
    {name: 'ashahu', email: 'ashahu@purdue.edu'},
    {name: 'Sahithi Gokavarapu', email: 'sgokavar@purdue.edu'},
    {name: 'dananth', email: 'dananth@purdue.edu'},
  ]);
  const [selectedContact, setSelectedContact] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [view, setView] = useState('messages');
  const [announcementContent, setAnnouncementContent] = useState('');

  useEffect(() => {
    const handleBeforeExit = (event) => {
      if (messageContent && selectedContact) {
        handleSaveDraft();
      }
    };
    window.addEventListener('beforeunload', handleBeforeExit);
    return () => window.removeEventListener('beforeunload', handleBeforeExit);
  }, [messageContent, selectedContact]);

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
        const response = await fetch(`http://localhost:5000/api/users`);
        if (!response.ok) throw new Error('Failed to fetch contacts');
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    // Call both functions
    fetchMessages();
    fetchContacts();
  }, [userEmail]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/announcements');
        if (!response.ok) throw new Error('Failed to fetch announcements');
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleSaveDraft = () => {
      if (!messageContent || !selectedContact) {
        return; // No draft saved if there's no message content or selected contact
      }

      const draft = {
        senderEmail: userEmail,
        recipientEmail: selectedContact,
        content: messageContent,
        timestamp: new Date(),
      };

      setDrafts((prevDrafts) => [...prevDrafts, draft]); // Save to drafts
      setMessageContent(''); // Clear message input after saving
    };

  const filteredMessages = messages.filter((message) =>
    selectedContact ? message.recipientEmail === selectedContact || message.senderEmail === selectedContact : true
  );

  const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString(); // Formats to local date and time
  };

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      if (!response.ok) throw new Error('Failed to send message');
      const savedMessage = await response.json();
      setMessages([...messages, savedMessage]);
      setMessageContent('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('There was an error sending the message. Please try again.');
    }
  };

  const loadDraft = (draft) => {
    setMessageContent(draft.content);
    setSelectedContact(draft.recipientEmail);
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
      isAnnouncement: true, // Set this flag to identify as an announcement
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
      alert('There was an error sending the announcement. Please try again.');
    }
  };

  const handleToggleReadStatus = async (messageId, isRead) => {
      try {
        const response = await fetch(`http://localhost:5000/api/messages/${messageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: !isRead }), // Toggle read status
        });

        if (!response.ok) throw new Error('Failed to update message read status');
        const updatedMessage = await response.json();
        setMessages(messages.map(msg => (msg._id === updatedMessage._id ? updatedMessage : msg)));
      } catch (error) {
        console.error('Error updating read status:', error);
      }
    };

 return (
     <div className="main">
       <div className="messages-container" style={{ display: 'flex', height: '100vh' }}>

         {/* Sidebar with Contact List */}
         <div className="recipients-pane" style={{ width: '25%', borderRight: '1px solid #ddd', padding: '10px' }}>
           <h3>Contacts</h3>
           {contacts.map((contact) => (
             <div
               key={contact.email}
               onClick={() => setSelectedContact(contact.email)}
               style={{ padding: '8px', cursor: 'pointer', background: selectedContact === contact.email ? '#f0f0f0' : 'transparent' }}
             >
               {contact.name} ({contact.email})
             </div>
           ))}
         </div>

         {/* Middle Pane for Messages */}
         <div className="message-pane" style={{ width: '50%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
           <div style={{ marginBottom: '10px' }}>
             <label>View:</label>
             <select onChange={(e) => setView(e.target.value)} value={view}>
               <option value="messages">Messages</option>
               <option value="announcements">Announcements</option>
             </select>
           </div>

           <div style={{ flexGrow: 1, overflowY: 'scroll', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
             {view === 'messages' ? (
               filteredMessages.length > 0 ? (
                 filteredMessages.map((message, index) => (
                   <div key={index} className="message-item">
                     <strong>{message.senderEmail === userEmail ? 'You' : message.senderEmail}:</strong> {message.content}
                     <div style={{ fontSize: '0.8em', color: '#999' }}>{new Date(message.timestamp).toLocaleString()}</div>
                   </div>
                 ))
               ) : (
                 <div>No Messages Found</div>
               )
             ) : (
               announcements.length > 0 ? (
                 announcements.map((announcement, index) => (
                   <div key={index} className="announcement-item">
                     <strong>Announcement:</strong> {announcement.content}
                     <div style={{ fontSize: '0.8em', color: '#999' }}>{new Date(announcement.timestamp).toLocaleString()}</div>
                   </div>
                 ))
               ) : (
                 <div>No Announcements Found</div>
               )
             )}
           </div>

           {/* Message Form */}
           {view === 'messages' && (
             <form onSubmit={(e) => {
               e.preventDefault();
               // Handle sending a message (add to messages array)
               if (!messageContent) {
                 alert('Please enter a message.');
                 return;
               }

               const newMessage = {
                 senderEmail: userEmail,
                 recipientEmail: selectedContact,
                 content: messageContent,
                 timestamp: new Date(), // Set current time for sent message
               };

               setMessages([...messages, newMessage]);
               setMessageContent('');
             }} style={{ display: 'flex', marginTop: '10px' }}>
               <input
                 type="text"
                 placeholder="Type a message"
                 value={messageContent}
                 onChange={(e) => setMessageContent(e.target.value)}
                 style={{ flexGrow: 1, padding: '10px', borderRadius: '5px 0 0 5px', border: '1px solid #ddd' }}
               />
               <button type="submit" style={{ padding: '10px', borderRadius: '0 5px 5px 0', border: '1px solid #ddd', background: '#4CAF50', color: '#fff' }}>
                 Send
               </button>
             </form>
           )}
         </div>
       </div>
     </div>
   );
 }