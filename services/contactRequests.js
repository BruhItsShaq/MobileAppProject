import AsyncStorage from '@react-native-async-storage/async-storage';

export const getContacts = async () => {
    const sessionToken = await AsyncStorage.getItem('session_token');
    console.log('Session token retrieved:', sessionToken);

    try {
        const response = await fetch('http://localhost:3333/api/1.0.0/contacts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': sessionToken,
            },
        });

        const data = await response.json();
        console.log('Response data:', data);

        if (response.status === 200) {
            return data;
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
        console.error('Error fetching contacts', error);
        throw new Error('An error occurred while fetching contacts. Please try again.');
    }
};