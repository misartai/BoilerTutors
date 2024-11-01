import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Messaging = () => {
    function MessagingComponent({ userId }) {
        const [messages, setMessages] = useState([]);
        const [newMessage, setNewMessage] = useState("");

        useEffect(() => {
            // Fetch messages when component mounts
            axios.get(`/api/messages/user/${userId}`)
                .then(response => setMessages(response.data))
                .catch(error => console.error(error));
        }, [userId]);

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