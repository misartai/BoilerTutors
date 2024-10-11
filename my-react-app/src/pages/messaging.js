import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './messaging/messages.css';

const MessagePage = () => {
    return (
        <>
            <div class="msg-header">
              <div class="container1">
                <img src="logo.png"/>
                <div class="active">
                  <p>Navigation Bar</p>
                </div>
              </div>
            </div>

            <div class="container3">
              <div class="msg-header">
                <div class="container1">
                  <img src="user1.png" class="msgimg" />
                  <div class="active">
                    <p>Contacts</p>
                  </div>
                </div>
              </div>

              <div class="chat-page">
                <div class="msg-inbox">
                  <div class="chats">
                    <div class="msg-page">

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="container">
              <div class="msg-header">
                <div class="container1">
                  <img src="user1.png" class="msgimg" />
                  <div class="active">
                    <p>User name</p>
                  </div>
                </div>
              </div>

              <div class="chat-page">
                <div class="msg-inbox">
                  <div class="chats">
                    <div class="msg-page">
                      <div class="received-chats">
                        <div class="received-chats-img">
                          <img src="user2.png" />
                        </div>
                        <div class="received-msg">
                          <div class="received-msg-inbox">
                            <p>
                              Hi !! This is message from Riya . Lorem ipsum, dolor sit
                              amet consectetur adipisicing elit. Non quas nemo eum,
                              earum sunt, nobis similique quisquam eveniet pariatur
                              commodi modi voluptatibus iusto omnis harum illum iste
                              distinctio expedita illo!
                            </p>
                            <span class="time">18:06 PM | July 24</span>
                          </div>
                        </div>
                      </div>
                      <div class="outgoing-chats">
                        <div class="outgoing-chats-img">
                          <img src="user1.png" />
                        </div>
                        <div class="outgoing-msg">
                          <div class="outgoing-chats-msg">
                            <p class="multi-msg">
                              Hi riya , Lorem ipsum dolor sit amet consectetur
                              adipisicing elit. Illo nobis deleniti earum magni
                              recusandae assumenda.
                            </p>
                            <p class="multi-msg">
                              Lorem ipsum dolor sit amet consectetur.
                            </p>

                            <span class="time">18:30 PM | July 24</span>
                          </div>
                        </div>
                      </div>
                      <div class="received-chats">
                        <div class="received-chats-img">
                          <img src="user2.png" />
                        </div>
                        <div class="received-msg">
                          <div class="received-msg-inbox">
                            <p class="single-msg">
                              Hi !! This is message from John Lewis. Lorem ipsum, dolor
                              sit amet consectetur adipisicing elit. iste distinctio
                              expedita illo!
                            </p>
                            <span class="time">18:31 PM | July 24</span>
                          </div>
                        </div>
                      </div>
                      <div class="outgoing-chats">
                        <div class="outgoing-chats-img">
                          <img src="user1.png" />
                        </div>
                        <div class="outgoing-msg">
                          <div class="outgoing-chats-msg">
                            <p>
                              Lorem ipsum dolor sit amet consectetur adipisicing elit.
                              Velit, sequi.
                            </p>

                            <span class="time">18:34 PM | July 24</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="msg-bottom">
                    <div class="input-group">
                      <textarea id="messageInput" placeholder="Type your message here..."></textarea>
                      <button onclick="sendMessage()">Send</button>
                      <span class="input-group-text send-icon">
                        <i class="bi bi-send"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </>
    );

    let selectedContact = null;

    // Fetch contacts for the current user
    function fetchContacts() {
        fetch('/api/messages/contacts/{userId}')
            .then(response => response.json())
            .then(contacts => {
                const contactList = document.getElementById('contactList');
                contacts.forEach(contact => {
                    const div = document.createElement('div');
                    div.classList.add('contact');
                    div.textContent = contact.username;
                    div.onclick = () => selectContact(contact);
                    contactList.appendChild(div);
                });
            });
    }

    // Fetch messages for the selected contact
    function selectContact(contact) {
        selectedContact = contact;
        fetch(`/api/messages/${contact.userId}`)
            .then(response => response.json())
            .then(messages => {
                const messageList = document.getElementById('messageList');
                messageList.innerHTML = ''; // Clear previous messages
                messages.forEach(msg => {
                    const div = document.createElement('div');
                    div.classList.add('message');
                    div.textContent = msg.content;
                    messageList.appendChild(div);
                });
            });
    }

    // Send a new message
    function sendMessage() {
        const messageContent = document.getElementById('messageInput').value;
        const message = {
            sender: '{currentUserId}',
            receiver: selectedContact.userId,
            content: messageContent
        };

        fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        }).then(response => response.text())
          .then(result => {
              console.log(result);
              document.getElementById('messageInput').value = '';
              selectContact(selectedContact); // Refresh messages
          });
    }

    // On page load, fetch contacts
    window.onload = fetchContacts;
};

export default MessagePage;
