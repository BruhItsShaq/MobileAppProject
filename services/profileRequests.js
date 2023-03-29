import AsyncStorage from '@react-native-async-storage/async-storage';

export const getProfile = async (user_id) => {
    const session_token = await AsyncStorage.getItem('session_token');
    console.log('Session token retrieved:', session_token);

    try {
        const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': session_token,
            },
        });

        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else if (response.status === 401) {
            const errorData = await response.json();
            console.error('Unauthorised', errorData);
            throw new Error('Unauthorised. Please log in and try again.');
        } else if (response.status === 404) {
            const errorData = await response.json();
            console.error('User not found', errorData);
            throw new Error('User not found. Please try again with a valid user ID.');
        } else {
            const errorData = await response.json();
            console.error('Server error', errorData);
            throw new Error('Server error. Please try again later.');
        }
    } catch (error) {
        console.error('Error getting profile', error);
        throw new Error('An error occurred while getting the profile. Please try again.');
    }
};


export const updateProfile = async (user_id, profileData) => {
    console.log('before update');
    const session_token = await AsyncStorage.getItem('session_token');
    console.log('Session token retrieved:', session_token);

    try {
        const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': session_token,
            },
            body: JSON.stringify(profileData),
        });
        console.log('after update');
        console.log('Response:', response);

        const data = await response.json();
       // console.log('Response data for updating profile:', data);

        if (response.status === 200) {
            return response;
        } else if (response.status === 400) {
            const errorData = await response.json();
            console.error('Bad request', errorData);
            throw new Error('Bad request. Please try again with valid profile data.');
        } else if (response.status === 401) {
            const errorData = await response.json();
            console.error('Unauthorised', errorData);
            throw new Error('Unauthorised. Please log in and try again.');
        } else if (response.status === 403) {
            const errorData = await response.json();
            console.error('Forbidden', errorData);
            throw new Error('Forbidden. You do not have permission to update this user.');
        } else if (response.status === 404) {
            const errorData = await response.json();
            console.error('User not found', errorData);
            throw new Error('User not found. Please try again with a valid user ID.');
        } else {
            const errorData = await response.json();
            console.error('Server error', errorData);
            throw new Error('Server error. Please try again later.');
        }
    } catch (error) {
        // Log the actual error that occurred during the fetch request
        console.error('Error updating profile', error);
        throw new Error('An error occurred while updating the profile. Please try again.');
    }
};