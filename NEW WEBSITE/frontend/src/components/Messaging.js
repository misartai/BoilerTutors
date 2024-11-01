import React, { useState, useEffect } from 'react';

export default function Messaging({ user }) {
    function MessagingComponent({ userId }) {
        const { email: userEmail } = user;
        const [messages, setMessages] = useState([]);
        const [newMessage, setNewMessage] = useState("");

        useEffect(() => {
            const fetchEvents = async () => {
                  try {
                    const response = await fetch(`http://localhost:5000/api/messages?userEmail=${userEmail}`);
                    if (!response.ok) {
                      throw new Error('Failed to fetch messages');
                    }
                    const data = await response.json();
                    setEvents(data);

                    // Extract unique student emails for staff view filtering
                    const emails = Array.from(new Set(data.map(event => event.email)));
                    setStudentEmails(emails);
                  } catch (error) {
                    console.error('Error fetching events:', error);
                  }
        };

        const sendMessage = () => {
            axios.post('/api/messages/send', {
                senderId: userId,
                receiverId: 'some-other-user-id',
                content: newMessage
            })
            .then(response => {
                setMessages([...messages, response.data]);
                setNewMessage("");
            })
            .catch(error => console.error(error));
        };

        return (
            <div>
                <h2>Messages</h2>
                <ul>
                    {messages.map(message => (
                        <li key={message.id}>{message.content}</li>
                    ))}
                </ul>
                <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        );
    }
};

export default Messaging;