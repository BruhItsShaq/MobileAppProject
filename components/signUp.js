import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

import * as EmailValidator from 'email-validator';
import { render } from 'react-dom';

export default class SignUp extends Component {


    constructor(props) {
        super(props);

        this.state = {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            error: ""
        }

        this._onButtonPress = this._onButtonPress.bind(this)
    }

    _onButtonPress = () => {
        this.setState({ submitted: true })
        this.setState({ error: "" })

        const NAME_REGEX = new RegExp(/^[a-zA-Z]{2,20}( [a-zA-Z]{2,40})+$;/)
        if (!(this.state.firstName && this.state.lastName)) {
            this.setState({ error: "Please enter a first and last name" })
            return;
        }

        if (!NAME_REGEX.test(this.state.firstName)) {
            this.setState({ error: "First name must not contain special characters or might to short/long" })
            return;
        }

        if (!NAME_REGEX.test(this.state.lastName)) {
            this.setState({ error: "Last name must not contain special characters or might to short/long" })
            return;
        }

        if (!(this.state.email && this.state.password)) {
            this.setState({ error: "Must enter email and password" })
            return;
        }

        if (!EmailValidator.validate(this.state.email)) {
            this.setState({ error: "Must enter valid email" })
            return;
        }

        const PASSWORD_REGEX = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
        if (!PASSWORD_REGEX.test(this.state.password)) {
            this.setState({ error: "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)" })
            return;
        }

        console.log("Button clicked: " + this.state.firstName + " " + this.state.lastName + " " + this.state.password + " " + this.state.email)
        //Enter API code here

        
    }

    render() {
        return (
            <View style={styles.container}>

                <View style={styles.formContainer}>

                    <View style={styles.email}>
                        <Text>First Name:</Text>
                        <TextInput style={{ height: 40, borderWidth: 1, width: "100%" }}
                            placeholder="Enter first name"
                            onChangeText={firstName => this.setState({ firstName })}
                            defaultValue={this.state.firstName}
                        />
                        <>
                            {
                                this.state.submitted && !this.state.firstName &&
                                <Text style={styles.error}>*First name is required</Text>
                            }
                        </>
                    </View>

                    <View style={styles.email}>
                        <Text>Last Name:</Text>
                        <TextInput style={{ height: 40, borderWidth: 1, width: "100%" }}
                            placeholder="Enter last name"
                            onChangeText={lastName => this.setState({ lastName })}
                            defaultValue={this.state.lastName}
                        />
                        <>
                            {
                                this.state.submitted && !this.state.lastName &&
                                <Text style={styles.error}>*Last name is required</Text>
                            }
                        </>
                    </View>

                    <View style={styles.email}>
                        <Text>Email:</Text>
                        <TextInput
                            style={{ height: 40, borderWidth: 1, width: "100%" }}
                            placeholder="Enter email"
                            onChangeText={email => this.setState({ email })}
                            defaultValue={this.state.email}
                        />

                        <>
                            {this.state.submitted && !this.state.email &&
                                <Text style={styles.error}>*Email is required</Text>
                            }
                        </>
                    </View>

                    <View style={styles.password}>
                        <Text>Password:</Text>
                        <TextInput
                            style={{ height: 40, borderWidth: 1, width: "100%" }}
                            placeholder="Enter password"
                            onChangeText={password => this.setState({ password })}
                            defaultValue={this.state.password}
                            secureTextEntry
                        />

                        <>
                            {this.state.submitted && !this.state.password &&
                                <Text style={styles.error}>*Password is required</Text>
                            }
                        </>
                    </View>

                    <View style={styles.loginbtn}>
                        <TouchableOpacity onPress={this._onButtonPress}>
                            <View style={styles.button}>
                                <Text style={styles.buttonText}>Sign Up</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <>
                        {this.state.error &&
                            <Text style={styles.error}>{this.state.error}</Text>
                        }
                    </>

                    <View>
                        <Text style={styles.signup}>Already have an account? Login</Text>
                    </View>
                </View>
            </View>
        )
    }


}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "80%",
        alignItems: "stretch",
        justifyContent: "center"
    },
    formContainer: {

    },
    email: {
        marginBottom: 5
    },
    password: {
        marginBottom: 10
    },
    loginbtn: {

    },
    signup: {
        justifyContent: "center",
        textDecorationLine: "underline"
    },
    button: {
        marginBottom: 30,
        backgroundColor: '#2196F3'
    },
    buttonText: {
        textAlign: 'center',
        padding: 20,
        color: 'white'
    },
    error: {
        color: "red",
        fontWeight: '900'
    }
});