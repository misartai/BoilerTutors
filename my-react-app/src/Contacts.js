import React, {
                useEffect,
                useState
                } from 'react';

const Contacts = ({ selectContact }) => {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        // Fetch contacts for the current user
        fetch('/api/messages/contacts/{userId}')
            .then(response => response.json())
            .then(data => setContacts(data))
            .catch(error => console.error('Error fetching contacts:', error));
    }, []);

    return (
        <div id="contactList">
            {contacts.map(contact => (
                <div className="contact" key={contact.userId} onClick={() => selectContact(contact)}>
                    {contact.username}
                </div>
            ))}
        </div>
    );
};

export default Contacts;
