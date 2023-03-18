import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class ProfileScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.text}>Profile Picture Placeholder</Text>
        <Text style={styles.text}>Name: John Doe</Text>
        <Text style={styles.text}>Email: john.doe@example.com</Text>
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
  });