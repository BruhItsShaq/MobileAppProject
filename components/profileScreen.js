/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import React, { Component } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Image,
} from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  getProfile, updateProfile, Logout,
} from '../services/profileRequests';

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
      photo: '',
    };

    this.handleDelete = this.handleDelete.bind(this);
  }

  // Navigation listener triggers functions everytime component comes into focus
  componentDidMount() {
    const { navigation } = this.props;
    this._unsubscribe = navigation.addListener('focus', () => {
      this.getUserData();
      this.get_profile_image();
    });
  }

  // Remove listener when component unmounts
  componentWillUnmount() {
    this._unsubscribe();
  }

  async getUserData() {
    try {
      const uId = await AsyncStorage.getItem('user_id');
      const userData = await getProfile(uId);
      this.setState({
        user: userData,
        isLoading: false,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        password: userData.password,
      });
    } catch (error) {
      this.setState({ error: error.message, isLoading: false });
    }
  }

  async get_profile_image() {
    const uId = await AsyncStorage.getItem('user_id');
    const sessionToken = await AsyncStorage.getItem('session_token');

    fetch(`http://localhost:3333/api/1.0.0/user/${uId}/photo`, {
      method: 'GET',
      headers: {
        'X-Authorization': sessionToken,
      },
    })
      .then((res) => res.blob())
      .then((resBlob) => {
        const data = URL.createObjectURL(resBlob);

        this.setState({
          photo: data,
          isLoading: false,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Toggles isEditing to enable editing mode for profile
  handleEdit = () => {
    this.setState({ isEditing: true });
  };

  // Responsible for validating and submitting updated user data
  handleSubmit = async () => {
    const {
      user, first_name, last_name, email, password,
    } = this.state;
    const changed = {};

    // Edited field validation
    if (first_name.trim() === '' || last_name.trim() === '' || email.trim() === '' || password.trim() === '') {
      this.setState({ error: 'All fields must be filled in.' });
      return;
    }

    if (first_name !== user.first_name) changed.first_name = first_name;
    if (last_name !== user.last_name) changed.last_name = last_name;
    if (email !== user.email) changed.email = email;
    if (password) changed.password = password;

    const profileData = {
      first_name,
      last_name,
      email,
      password,
    };

    console.log(profileData);

    try {
      const response = await updateProfile(user.user_id, changed);
      console.log(response);
      this.setState({ isEditing: false });
      await this.getUserData();
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  // Handles logging user out, removes session token and navigate to login screen
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
  };

  // Handles cancelling editing process
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

  backToLogin() {
    const { navigation } = this.props;
    navigation.navigate('Login');
  }

  render() {
    const {
      user, error, isLoading, isEditing, first_name, last_name, email, password, photo,
    } = this.state;
    const { navigation } = this.props;
    console.log('profile picture:', photo);
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            {/* Will check if isEditing is true or false */}
            {!isEditing ? (
              <>
                {photo ? (
                  <Image
                    source={{ uri: photo }}
                    style={styles.profilePicture}
                  />
                ) : (
                  <Icon name="user" size={24} color="black" style={styles.profilePicture} />
                )}
                <TouchableOpacity style={styles.text} onPress={() => { navigation.navigate('Camera'); }}>
                  <Text style={styles.text}>Upload picture</Text>
                </TouchableOpacity>
                <Text style={styles.text}>
                  Name:
                  {' '}
                  {user.first_name}
                  {' '}
                  {user.last_name}
                </Text>
                <Text style={styles.text}>
                  Email:
                  {' '}
                  {user.email}
                </Text>
                <TouchableOpacity style={styles.button} onPress={this.handleEdit}>
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logOutButton} onPress={this.handleDelete}>
                  <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Will show input fields if isEditing = true */}
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
                  secureTextEntry
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

// PropTypes validation to ensure that the required props are being passed to the component
ProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
  }).isRequired,
};

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
    bottom: 10,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignSelf: 'center',
  },
});
