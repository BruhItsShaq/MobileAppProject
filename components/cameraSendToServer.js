/* eslint-disable no-use-before-define */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-unused-vars */
import {
  Camera, CameraType, onCameraReady, CameraPictureOptions,
} from 'expo-camera';
import { useState } from 'react';
import {
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CameraSendToServer() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [camera, setCamera] = useState(null);

  function toggleCameraType() {
    setType((current) => (current === CameraType.back ? CameraType.front : CameraType.back));
    console.log('Camera: ', type);
  }

  async function takePhoto() {
    if (camera) {
      const options = { quality: 0.5, base64: true, onPictureSaved: (data) => sendToServer(data) };
      const data = await camera.takePictureAsync(options);
    }
  }

  async function sendToServer(data) {
    console.log('HERE', data.uri);
    const sessionToken = await AsyncStorage.getItem('session_token');
    const uId = await AsyncStorage.getItem('user_id');

    const id = uId;
    const token = sessionToken;

    const res = await fetch(data.uri);
    const blob = await res.blob();

    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${id}/photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png',
          'X-Authorization': token,
        },
        body: blob,
      });

      if (response.status === 200) {
        const responseData = await response.text();
        return responseData;
      } if (response.status === 400) {
        const errorData = await response.text();
        console.error('Bad request', errorData);
        throw new Error('Bad request.');
      } else if (response.status === 401) {
        const errorData = await response.text();
        console.error('Unauthorised', errorData);
        throw new Error('Unauthorised. Please log in and try again.');
      } else if (response.status === 403) {
        const errorData = await response.text();
        console.error('Forbidden', errorData);
        throw new Error('Forbidden. You do not have permission to perform this action.');
      } else if (response.status === 404) {
        const errorData = await response.text();
        console.error('Not found', errorData);
        throw new Error('User not found. Please try again with a valid user ID.');
      } else {
        const errorData = await response.text();
        console.error('Server error', errorData);
        throw new Error('Server error. Please try again later.');
      }
    } catch (error) {
      console.error('Error uploading user photo', error);
      throw new Error('An error occurred while uploading the user photo. Please try again.');
    }
  }

  if (!permission || !permission.granted) {
    return (<Text>No access to camera</Text>);
  }
  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={(ref) => setCamera(ref)}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.text}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    alignSelf: 'flex-end',
    padding: 5,
    margin: 5,
    backgroundColor: 'steelblue',
  },
  button: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ddd',
  },
});
