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
            const errorData = await response.text();
            console.error('Unauthorised', errorData);
            throw new Error('Unauthorised. Please log in and try again.');
        } else {
            const errorData = await response.text();
            console.error('Server error', errorData);
            throw new Error('Server error. Please try again later.');
        }
    } catch (error) {
        console.error('Error fetching contacts', error);
        throw new Error('An error occurred while fetching contacts. Please try again.');
    }
};

export const addContact = async (user_id) => {
    const session_token = await AsyncStorage.getItem('session_token');

    try {
        const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': session_token,
            },
            body: JSON.stringify({ user_id }),
        });

        if (response.status === 200) {
            return true;
        } else {
            const errorData = await response.text();
            console.error(`Error (${response.status}):`, errorData.message);
            throw new Error(errorData.message);
        }
    } catch (error) {
        console.error('Error adding contact:', error);
        throw new Error('An error occurred while adding the contact. Please try again.');
    }
};

export const deleteContact = async (user_id) => {
    const session_token = await AsyncStorage.getItem('session_token');

    try {
        const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}/contact`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': session_token,
            },
        });

        if (response.status === 200) {
            return true;
        } else if (response.status === 400) {
            const errorData = await response.text();
            console.error('Bad request', errorData);
            throw new Error('Bad request. You cannot remove yourself as a contact.');
        } else if (response.status === 401) {
            const errorData = await response.text();
            console.error('Unauthorised', errorData);
            throw new Error('Unauthorised. Please log in and try again.');
        } else if (response.status === 404) {
            const errorData = await response.text();
            console.error('User not found', errorData);
            throw new Error('User not found. Please try again with a valid user ID.');
        } else {
            const errorData = await response.text();
            console.error('Server error', errorData);
            throw new Error('Server error. Please try again later.');
        }
    } catch (error) {
        console.error('Error removing contact', error);
        throw new Error('An error occurred while removing the contact. Please try again.');
    }
};
export const blockContact = async (user_id) => {
    const session_token = await AsyncStorage.getItem('session_token');

    try {
        const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}/block`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': session_token,
            },
            body: JSON.stringify({ user_id }),
        });

        if (response.status === 200) {
            return true;
        } else {
            const errorData = await response.text();
            console.error(`Error (${response.status}):`, errorData.message);
            throw new Error(errorData.message);
        }
    } catch (error) {
        console.error('Error blocking contact:', error);
        throw new Error('An error occurred while blocking the contact. Please try again.');
    }
};

export const getBlockedContacts = async () => {
    const session_token = await AsyncStorage.getItem('session_token');

    try {
        const response = await fetch('http://localhost:3333/api/1.0.0/blocked', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': session_token,
            },
        });

        const data = await response.json();

        if (response.status === 200) {
            return data;
        } else if (response.status === 401) {
            const errorData = await response.text();
            console.error('Unauthorised', errorData);
            throw new Error('Unauthorised. Please log in and try again.');
        } else {
            const errorData = await response.text();
            console.error('Server error', errorData);
            throw new Error('Server error. Please try again later.');
        }
    } catch (error) {
        console.error('Error getting blocked contacts', error);
        throw new Error('An error occurred while getting blocked contacts. Please try again.');
    }
};

export const unblockContact = async (user_id) => {
    const session_token = await AsyncStorage.getItem('session_token');

    try {
        const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}/block`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': session_token,
            },
        });

        if (response.status === 200) {
            return true;
        } else if (response.status === 400) {
            const errorData = await response.text();
            console.error('Bad request', errorData);
            throw new Error('Bad request. You cannot unblock yourself.');
        } else if (response.status === 401) {
            const errorData = await response.text();
            console.error('Unauthorised', errorData);
            throw new Error('Unauthorised. Please log in and try again.');
        } else if (response.status === 404) {
            const errorData = await response.text();
            console.error('User not found', errorData);
            throw new Error('User not found. Please try again with a valid user ID.');
        } else {
            const errorData = await response.text();
            console.error('Server error', errorData);
            throw new Error('Server error. Please try again later.');
        }
    } catch (error) {
        console.error('Error unblocking contact', error);
        throw new Error('An error occurred while unblocking the contact. Please try again.');
    }
};

export const searchUsers = async (query, searchIn, limit = 20, offset = 0) => {
    const sessionToken = await AsyncStorage.getItem('session_token');


    const response = await fetch(`http://localhost:3333/api/1.0.0/search?q=${query}&search_in=all&limit=${limit}&offset=${offset}`
        , {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': sessionToken,
            },
        });

    const responseBody = await response.json();

    if (response.status === 200) {
        return responseBody;
    } else if (response.status === 400) {
        throw new Error('Bad Request');
    } else if (response.status === 401) {
        throw new Error('Unauthorized');
    } else {
        throw new Error('Server Error');
    }
}