import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile, updateProfile, Logout, getProfilePicture } from '../services/profileRequests';

export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      error: '',
      isLoading: true,
      isEditing: false,
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      profilePicture: null,
    };

    this.handleDelete = this.handleDelete.bind(this);
  }

  async componentDidMount() {
    await this.getUserData();
    await this.getUserProfilePhoto();
  }

  async getUserData() {
    try {
      const u_id = await AsyncStorage.getItem('user_id');
      const userData = await getProfile(u_id);
      this.setState({
        user: userData,
        isLoading: false,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
      });
    } catch (error) {
      this.setState({ error: error.message, isLoading: false });
    }
  }

  gotoCamera() {
    this.props.navigation.navigate('Camera');
  }

  backToLogin() {
    this.props.navigation.navigate('Login');
  };

  async getUserProfilePhoto() {
    try {
      const photoData = await getProfilePicture();
      this.setState({
        profilePhoto: photoData,
      });
    } catch (error) {
      console.error('Error getting profile photo', error);
      throw new Error('An error occurred while getting the profile photo. Please try again.');
    }
  }

  handleEdit = () => {
    this.setState({ isEditing: true });
  };

  handleSubmit = async () => {
    const { user, first_name, last_name, email, password } = this.state;
    const profileData = {
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: password,
    };

    console.log(profileData);

    try {
      const response = await updateProfile(user.user_id, profileData);
      console.log(response);
      this.setState({ isEditing: false });
      await this.getUserData();
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  handleDelete = async () => {
    try {
      const response = await Logout();
      if (response === 200) {
        // Remove token from async storage
        await AsyncStorage.removeItem('session_token');
        // Navigate to SignUp page
        this.backToLogin();
      }
    } catch (error) {
      this.setState({ error: error.message });
    }
  }

  handleCancel = () => {
    const { user } = this.state;
    this.setState({
      isEditing: false,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: '',
    });
  };

  render() {
    const { user, error, isLoading, isEditing, first_name, last_name, email, password } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            {!isEditing ? (
              <>
                {user.photo && (
                  <Image source={{ uri: this.getUserProfilePhoto(), headers: {"X-Authorization": token} }} style={styles.profilePhoto} />
                )}
                <TouchableOpacity style={styles.text} onPress={() => { this.props.navigation.navigate('Camera') }}>
                  <Text style={styles.text}>Upload picture</Text>
                </TouchableOpacity>
                <Text style={styles.text}>Name: {user.first_name} {user.last_name}</Text>
                <Text style={styles.text}>Email: {user.email}</Text>
                <TouchableOpacity style={styles.button} onPress={this.handleEdit}>
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logOutButton} onPress={this.handleDelete}>
                  <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={first_name}
                  onChangeText={(text) => this.setState({ first_name: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={last_name}
                  onChangeText={(text) => this.setState({ last_name: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={(text) => this.setState({ email: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Please enter password"
                  value={password}
                  onChangeText={(text) => this.setState({ password: text })}
                  secureTextEntry={true}
                />
                <TouchableOpacity style={styles.button} onPress={this.handleSubmit}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={this.handleCancel}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  text: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    width: 200,
    marginBottom: 10,
    padding: 10,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
  },
  logOutButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    margin: 5,
    position: 'absolute',
    bottom: 10
  }
});