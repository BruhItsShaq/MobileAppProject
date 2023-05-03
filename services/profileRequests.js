import AsyncStorage from '@react-native-async-storage/async-storage';

export const getProfile = async (userId) => {
  const sessionToken = await AsyncStorage.getItem('session_token');
  console.log('Session token retrieved:', sessionToken);

  const response = await fetch(`http://localhost:3333/api/1.0.0/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': sessionToken,
    },
  });

  if (response.status === 200) {
    const data = await response.json();
    return data;
  } if (response.status === 401) {
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
};

export const Logout = async () => {
  const sessionToken = await AsyncStorage.getItem('session_token');

  const response = await fetch('http://localhost:3333/api/1.0.0/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': sessionToken,
    },
  });

  if (response.status === 200) {
    return response.status;
  } if (response.status === 401) {
    const errorData = await response.text();
    console.error('Unauthorised', errorData);
    throw new Error('Unauthorised. Please log in and try again.');
  } else {
    const errorData = await response.text();
    console.error('Server error', errorData);
    throw new Error('Server error. Please try again later.');
  }
};

export const updateProfile = async (userId, profileData) => {
  console.log('before update');
  const sessionToken = await AsyncStorage.getItem('session_token');
  console.log('Session token retrieved:', sessionToken);

  const response = await fetch(`http://localhost:3333/api/1.0.0/user/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': sessionToken,
    },
    body: JSON.stringify(profileData),
  });
  console.log('after update');
  console.log('Response:', response);

  // console.log('Response data for updating profile:', data);

  if (response.status === 200) {
    return response;
  } if (response.status === 400) {
    const errorData = await response.json();
    console.error('Bad request', errorData);
    throw new Error('Bad request. Please try again with valid profile data.');
  } else if (response.status === 401) {
    const errorData = await response.text();
    console.error('Unauthorised', errorData);
    throw new Error('Unauthorised. Please log in and try again.');
  } else if (response.status === 403) {
    const errorData = await response.text();
    console.error('Forbidden', errorData);
    throw new Error('Forbidden. You do not have permission to update this user.');
  } else if (response.status === 404) {
    const errorData = await response.text();
    console.error('User not found', errorData);
    throw new Error('User not found. Please try again with a valid user ID.');
  } else {
    const errorData = await response.text();
    console.error('Server error', errorData);
    throw new Error('Server error. Please try again later.');
  }
};
