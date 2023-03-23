import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchChats = async () => {
    const session_token = await AsyncStorage.getItem('session_token');
    console.log('Session token retrieved:', session_token);
    try {
        const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': session_token,
            },
        });
        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else {
            const errorData = await response.json();
            console.error('Error fetching chats', errorData);
            throw new Error('An error occurred while fetching chats. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching chats', error);
        throw new Error('An error occurred while fetching chats. Please try again.');
    }
};

export const createChat = async (name) => {
    const session_token = await AsyncStorage.getItem('session_token');
    console.log('Session token retrieved:', session_token);

    try {
        const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': session_token,
            },
            body: JSON.stringify({name}),
        });

        if (response.status === 201) {
            const data = await response.json();
            return data;
        } else if (response.status === 400) {
            const errorData = await response.json();
            console.error('Bad request', errorData);
            throw new Error('Bad request. Please try again.');
        } else if (response.status === 401) {
            const errorData = await response.json();
            console.error('Unauthorised', errorData);
            throw new Error('Unauthorised. Please log in and try again.');
        } else {
            const errorData = await response.json();
            console.error('Server error', errorData);
            throw new Error('Server error. Please try again later.');
        }
    } catch (error) {
        console.error('Error creating chat', error);
        throw new Error('An error occurred while creating the chat. Please try again.');
    }
};