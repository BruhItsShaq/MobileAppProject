/* eslint-disable no-use-before-define */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import * as EmailValidator from 'email-validator';

export default class SignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      error: '',
      submitted: false,
    };

    this._onButtonPress = this._onButtonPress.bind(this);
  }

  navigateToLogin = () => {
    const { navigation } = this.props;

    navigation.navigate('Login');
  };

  _onButtonPress = async () => {
    const { navigation } = this.props;
    const {
      firstName, lastName, password, email,
    } = this.state;

    this.setState({ submitted: true });
    this.setState({ error: '' });

    const FIRST_NAME_REGEX = /^[a-zA-Z]{2,20}$/;
    const LAST_NAME_REGEX = /^[a-zA-Z]{2,40}$/;

    if (!(firstName && lastName)) {
      this.setState({ error: 'Please enter a first and last name' });
      return;
    }

    if (!FIRST_NAME_REGEX.test(firstName)) {
      this.setState({ error: 'First name must not contain special characters or might be too short/long' });
      return;
    }

    if (!LAST_NAME_REGEX.test(lastName)) {
      this.setState({ error: 'Last name must not contain special characters or might be too short/long' });
      return;
    }

    if (!(email && password)) {
      this.setState({ error: 'Must enter email and password' });
      return;
    }

    if (!EmailValidator.validate(email)) {
      this.setState({ error: 'Must enter valid email' });
      return;
    }

    const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!PASSWORD_REGEX.test(password)) {
      this.setState({ error: "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)" });
      return;
    }

    const requestBody = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    };

    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      if (response.status === 201) {
        const data = await response.json();
        console.log('User created successfully', data);
        navigation.navigate('Login');
      } else {
        const errorData = await response.json();
        console.error('Error creating user', errorData);
        this.setState({ error: 'An error occurred while creating your account. Please try again.' });
      }
    } catch (error) {
      console.error('Error creating user', error);
      this.setState({ error: 'An error occurred while creating your account. Please try again.' });
    }
  };

  render() {
    const {
      firstName, lastName, password, email, submitted, error,
    } = this.state;
    return (
      <View style={styles.container}>

        <View style={styles.formContainer}>

          <View style={styles.email}>
            <Text>First Name:</Text>
            <TextInput
              style={{ height: 40, borderWidth: 1, width: '100%' }}
              placeholder="Enter first name"
              onChangeText={(newfirstName) => this.setState({ firstName: newfirstName })}
              defaultValue={firstName}
            />

            {
                                submitted && !firstName
                                && <Text style={styles.error}>*First name is required</Text>
                            }

          </View>

          <View style={styles.email}>
            <Text>Last Name:</Text>
            <TextInput
              style={{ height: 40, borderWidth: 1, width: '100%' }}
              placeholder="Enter last name"
              onChangeText={(newlastName) => this.setState({ lastName: newlastName })}
              defaultValue={lastName}
            />

            {
                                submitted && !lastName
                                && <Text style={styles.error}>*Last name is required</Text>
                            }

          </View>

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
            <TouchableOpacity onPress={this._onButtonPress}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </View>
            </TouchableOpacity>
          </View>

          {error
                            && <Text style={styles.error}>{error}</Text>}

          <View>
            <Text style={styles.signup} onPress={this.navigateToLogin}>
              Already have an account? Login
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

SignUp.propTypes = {
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
