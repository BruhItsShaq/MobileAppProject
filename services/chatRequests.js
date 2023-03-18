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