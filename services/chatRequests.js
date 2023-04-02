import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchChats = async () => {
    const session_token = await AsyncStorage.getItem('session_token');
    const u_id = await AsyncStorage.getItem('user_id');
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
            body: JSON.stringify({ name }),
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
export const updateChatName = async (chat_id, name) => {
    const session_token = await AsyncStorage.getItem('session_token');

    try {
        const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': session_token,
            },
            body: JSON.stringify({ name }),
        });

        if (response.status === 200) {
            const data = await response.text();
            return data;
        } else if (response.status === 400) {
            const errorData = await response.text();
            console.error('Bad request', errorData);
            throw new Error('Bad request. Please try again.');
        } else if (response.status === 401) {
            const errorData = await response.text();
            console.error('Unauthorised', errorData);
            throw new Error('Unauthorised. Please log in and try again.');
        } else if (response.status === 403) {
            const errorData = await response.text();
            console.error('Forbidden', errorData);
            throw new Error('Forbidden. You do not have permission to update this chat.');
        } else if (response.status === 404) {
            const errorData = await response.text();
            console.error('Not found', errorData);
            throw new Error('Chat not found.');
        } else {
            const errorData = await response.text();
            console.error('Server error', errorData);
            throw new Error('Server error. Please try again later.');
        }
    } catch (error) {
        console.error('Error updating chat name', error);
        throw new Error('An error occurred while updating the chat name. Please try again.');
    }
};

export const getChatDetails = async (chat_id, limit = 20, offset = 0) => {
    const session_token = await AsyncStorage.getItem('session_token');
    try {
        const response = await fetch(
            `http://localhost:3333/api/1.0.0/chat/${chat_id}?limit=${limit}&offset=${offset}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': session_token,
                },
            }
        );
        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else if (response.status === 401) {
            const errorData = await response.text();
            console.error('Unauthorised', errorData);
            throw new Error('Unauthorised. Please log in and try again.');
        } else if (response.status === 403) {
            const errorData = await response.text();
            console.error('Forbidden', errorData);
            throw new Error('Forbidden. You do not have permission to view this chat.');
        } else if (response.status === 404) {
            const errorData = await response.text();
            console.error('Not found', errorData);
            throw new Error('Chat not found.');
        } else {
            const errorData = await response.text();
            console.error('Server error', errorData);
            throw new Error('Server error. Please try again later.');
        }
    } catch (error) {
        console.error('Error getting chat details', error);
        throw new Error('An error occurred while getting chat details. Please try again.');
    }
};

export const sendMessage = async (chat_id, message) => {
    const session_token = await AsyncStorage.getItem('session_token');
  
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': session_token,
        },
        body: JSON.stringify({ message }),
      });
  
      if (response.status === 200) {
        const data = await response.text();
        await getChatDetails(chat_id);
        return data;
      } else if (response.status === 400) {
        const errorData = await response.text();
        console.error('Bad request', errorData);
        throw new Error('Bad request. Please try again.');
      } else if (response.status === 401) {
        const errorData = await response.text();
        console.error('Unauthorised', errorData);
        throw new Error('Unauthorised. Please log in and try again.');
      } else if (response.status === 403) {
        const errorData = await response.text();
        console.error('Forbidden', errorData);
        throw new Error('Forbidden. You do not have permission to send messages to this chat.');
      } else {
        const errorData = await response.text();
        console.error('Server error', errorData);
        throw new Error('Server error. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending message', error);
      throw new Error('An error occurred while sending the message. Please try again.');
    }
  };