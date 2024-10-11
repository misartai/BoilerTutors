import axios from 'axios';

const API_URL = '/api/messages';

export const fetchContacts = () => {
    return axios.get(`${API_URL}/contacts/{userId}`);
};

export const fetchMessages = (contactId) => {
    return axios.get(`${API_URL}/${contactId}`);
};

export const sendMessage = (message) => {
    return axios.post(`${API_URL}/send`, message);
};
