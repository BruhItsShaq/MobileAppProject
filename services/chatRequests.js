import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchChats = async () => {
  const sessionToken = await AsyncStorage.getItem('session_token');
  console.log('Session token retrieved:', sessionToken);

  const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': sessionToken,
    },
  });
  if (response.status === 200) {
    const data = await response.json();
    return data;
  }
  const errorData = await response.text();
  console.error('Error fetching chats', errorData);
  throw new Error('An error occurred while fetching chats. Please try again.');
};

export const createChat = async (name) => {
  const sessionToken = await AsyncStorage.getItem('session_token');
  console.log('Session token retrieved:', sessionToken);

  const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': sessionToken,
    },
    body: JSON.stringify({ name }),
  });

  if (response.status === 201) {
    const data = await response.json();
    return data;
  } if (response.status === 400) {
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
};
export const updateChatName = async (chatId, name) => {
  const sessionToken = await AsyncStorage.getItem('session_token');

  const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': sessionToken,
    },
    body: JSON.stringify({ name }),
  });

  if (response.status === 200) {
    const data = await response.text();
    return data;
  } if (response.status === 400) {
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
};

export const getChatDetails = async (chatId, limit = 20, offset = 0) => {
  const sessionToken = await AsyncStorage.getItem('session_token');
  const response = await fetch(
    `http://localhost:3333/api/1.0.0/chat/${chatId}?limit=${limit}&offset=${offset}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': sessionToken,
      },
    },
  );
  if (response.status === 200) {
    const data = await response.json();
    return data;
  } if (response.status === 401) {
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
};

export const sendMessage = async (chatId, message) => {
  const sessionToken = await AsyncStorage.getItem('session_token');

  const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': sessionToken,
    },
    body: JSON.stringify({ message }),
  });

  if (response.status === 200) {
    return response;
  } if (response.status === 400) {
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
};

export const deleteMessage = async (chatId, messageId) => {
  const sessionToken = await AsyncStorage.getItem('session_token');

  const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}/message/${messageId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': sessionToken,
    },
  });

  if (response.status === 200) {
    return response;
  } if (response.status === 401) {
    const errorData = await response.text();
    console.error('Unauthorised', errorData);
    throw new Error('Unauthorised. Please log in and try again.');
  } else if (response.status === 403) {
    const errorData = await response.text();
    console.error('Forbidden', errorData);
    throw new Error('Forbidden. You do not have permission to delete messages in this chat.');
  } else if (response.status === 404) {
    const errorData = await response.text();
    console.error('Not Found', errorData);
    throw new Error('Message not found. Please try again.');
  } else {
    const errorData = await response.text();
    console.error('Server error', errorData);
    throw new Error('Server error. Please try again later.');
  }
};

export const updateMessage = async (chatId, messageId, message) => {
  const sessionToken = await AsyncStorage.getItem('session_token');

  const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}/message/${messageId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': sessionToken,
    },
    body: JSON.stringify({ message }),
  });

  if (response.status === 200) {
    const data = await response.text();
    return data;
  } if (response.status === 400) {
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
    throw new Error('Forbidden. You do not have permission to update messages in this chat.');
  } else if (response.status === 404) {
    const errorData = await response.text();
    console.error('Not Found', errorData);
    throw new Error('Message not found. Please try again.');
  } else {
    const errorData = await response.text();
    console.error('Server error', errorData);
    throw new Error('Server error. Please try again later.');
  }
};

export const addUserToChat = async (chatId, userId) => {
  const sessionToken = await AsyncStorage.getItem('session_token');

  const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}/user/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': sessionToken,
    },
  });

  if (response.status === 200) {
    const data = await response.text();
    return data;
  } if (response.status === 400) {
    const errorData = await response.text();
    console.error('Bad request', errorData);
    throw new Error('User already in chat');
  } else if (response.status === 401) {
    const errorData = await response.text();
    console.error('Unauthorised', errorData);
    throw new Error('Unauthorised. Please log in and try again.');
  } else if (response.status === 404) {
    const errorData = await response.text();
    console.error('Not found', errorData);
    throw new Error('User not found.');
  } else {
    const errorData = await response.text();
    console.error('Server error', errorData);
    throw new Error('Server error. Please try again later.');
  }
};

export const removeUserFromChat = async (chatId, userId) => {
  const sessionToken = await AsyncStorage.getItem('session_token');

  const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}/user/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': sessionToken,
    },
  });

  if (response.status === 200) {
    const data = await response.text();
    await getChatDetails(chatId);
    return data;
  } if (response.status === 400) {
    const errorData = await response.text();
    console.error('Bad request', errorData);
    throw new Error('User has already been deleted from chat.');
  } else if (response.status === 401) {
    const errorData = await response.text();
    console.error('Unauthorised', errorData);
    throw new Error('Unauthorised. Please log in and try again.');
  } else if (response.status === 404) {
    const errorData = await response.text();
    console.error('Not found', errorData);
    throw new Error('Not found. Please try again with valid chat and user IDs.');
  } else {
    const errorData = await response.text();
    console.error('Server error', errorData);
    throw new Error('Server error. Please try again later.');
  }
};
