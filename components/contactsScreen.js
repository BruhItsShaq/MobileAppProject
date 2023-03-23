import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fetchContacts } from '../services/contactRequests';

export default class ContactsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contacts: [],
      error: '',
    };
  }

  componentDidMount() {
    this.loadContacts();
  }

  loadContacts = async () => {
    try {
      const contactData = await fetchContacts();
      this.setState({ contacts: contactData });
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  render() {
    const { contacts, error } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Contacts</Text>
        {Array.isArray(contacts) && contacts.length > 0 ? (
          contacts.map((contact) => (
            <Text key={contact.user_id} style={styles.text}>
              {contact.first_name} {contact.last_name} - {contact.email}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>No contacts found</Text>
        )}
        <>
          {error && (
            <View>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </>
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
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});