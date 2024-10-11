import React, {
                useEffect,
                useState
                } from 'react';

const MessageList = ({ contact }) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (contact) {
            // Fetch messages for the selected contact
            fetch(`/api/messages/${contact.userId}`)
                .then(response => response.json())
                .then(data => setMessages(data))
                .catch(error => console.error('Error fetching messages:', error));
        }
    }, [contact]);

    return (
        <div id="messageList">
            {messages.map((msg, index) => (
                <div className={msg.sender === '{currentUserId}' ? 'outgoing-message' : 'incoming-message'} key={index}>
                    {msg.content}
                </div>
            ))}
        </div>
    );
};

export default MessageList;
