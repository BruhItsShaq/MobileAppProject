/* eslint-disable no-use-before-define */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as EmailValidator from 'email-validator';

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      error: '',
      submitted: false,
    };

    this._onPressButton = this._onPressButton.bind(this);
  }

  // If user is logged in already and reloads the page they will be redirected to the home page
  // async componentDidMount() {
  //   const { navigation } = this.props;

  //   try {
  //     const uId = await AsyncStorage.getItem('user_id');
  //     if (uId !== null) {
  //       navigation.navigate('MainHome');
  //     }
  //   } catch (error) {
  //     console.error('Error retrieving userId from AsyncStorage:', error);
  //   }
  // }

  navigateToSignUp = () => {
    const { navigation } = this.props;
    navigation.navigate('SignUp');
  };

  async _onPressButton() {
    const { navigation } = this.props;
    const { email, password } = this.state;

    this.setState({ submitted: true });
    this.setState({ error: '' });

    if (!(email && password)) {
      this.setState({ error: 'Must enter email and password' });
      return;
    }

    if (!EmailValidator.validate(email)) {
      this.setState({ error: 'Must enter valid email' });
      return;
    }

    const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,40}$/;
    if (!PASSWORD_REGEX.test(password)) {
      this.setState({ error: "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)" });
      return;
    }

    const requestBody = {
      email,
      password,
    };

    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log('Login response data:', data);
        const sessionToken = data.token;
        const uId = data.id;

        if (!sessionToken) {
          console.error('Session token not found in response data');
          this.setState({ error: 'An error occurred while logging in. Please try again.' });
          return;
        }

        try {
          await AsyncStorage.setItem('session_token', sessionToken);
          await AsyncStorage.setItem('user_id', uId.toString());
          console.log('Session token saved:', sessionToken);
          console.log('User ID saved: ', uId);
        } catch (error) {
          console.error('Error saving session token', error);
          this.setState({ error: 'An error occurred while logging in. Please try again.' });
          return;
        }

        navigation.navigate('MainHome');
      } else if (response.status === 400) {
        console.error('Error logging in: Invalid email or password');
        this.setState({ error: 'Invalid email or password.' });
      } else {
        const errorData = await response.json();
        console.error('Error logging in', errorData);
        this.setState({ error: 'An error occurred while logging in. Please try again.' });
      }
    } catch (error) {
      console.error('Error logging in', error);
      this.setState({ error: 'An error occurred while logging in. Please try again.' });
    }
  }

  render() {
    const {
      email, password, submitted, error,
    } = this.state;
    return (
      <View style={styles.container}>

        <View style={styles.formContainer}>
          <View style={styles.email}>
            <Text>Email:</Text>
            <TextInput
              style={{ height: 40, borderWidth: 1, width: '100%' }}
              placeholder="Enter email"
              onChangeText={(newEmail) => this.setState({ email: newEmail })}
              defaultValue={email}
            />

            {submitted && !email
                            && <Text style={styles.error}>*Email is required</Text>}

          </View>

          <View style={styles.password}>
            <Text>Password:</Text>
            <TextInput
              style={{ height: 40, borderWidth: 1, width: '100%' }}
              placeholder="Enter password"
              onChangeText={(newPassword) => this.setState({ password: newPassword })}
              defaultValue={password}
              secureTextEntry
            />

            {submitted && !password
                            && <Text style={styles.error}>*Password is required</Text>}

          </View>

          <View style={styles.loginbtn}>
            <TouchableOpacity onPress={this._onPressButton}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Login</Text>
              </View>
            </TouchableOpacity>
          </View>

          {error
                        && <Text style={styles.error}>{error}</Text>}

          <View>
            <Text style={styles.signup} onPress={this.navigateToSignUp}>
              Need an account?
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

LoginScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '80%',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  formContainer: {

  },
  email: {
    marginBottom: 5,
  },
  password: {
    marginBottom: 10,
  },
  loginbtn: {

  },
  signup: {
    justifyContent: 'center',
    textDecorationLine: 'underline',
  },
  button: {
    marginBottom: 30,
    backgroundColor: '#2196F3',
  },
  buttonText: {
    textAlign: 'center',
    padding: 20,
    color: 'white',
  },
  error: {
    color: 'red',
    fontWeight: '900',
  },
});
