import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class ContactsScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Contacts</Text>
        <Text style={styles.text}>Contact 1</Text>
        <Text style={styles.text}>Contact 2</Text>
        <Text style={styles.text}>Contact 3</Text>
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