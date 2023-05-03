/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
import React, { Component } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import { getBlockedContacts, unblockContact } from '../services/contactRequests';

export default class BlockedScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blockedContacts: [],
      isLoading: false,
      error: null,
    };
  }

  componentDidMount() {
    const { navigation } = this.state;
    this._unsubscribe = navigation.addListener('focus', () => {
      this.getBlockedContacts();
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  getBlockedContacts = async () => {
    try {
      const data = await getBlockedContacts();
      this.setState({ blockedContacts: data });
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  handleUnblock = async (userId) => {
    try {
      await unblockContact(userId);
      Alert.alert('Success', 'Contact unblocked successfully');
      this.getBlockedContacts();
    } catch (error) {
      console.error('Error unblocking contact', error);
      Alert.alert('Error', 'An error occurred while unblocking the contact. Please try again later.');
    }
  };

  renderItem = ({ item }) => (
    <View style={styles.blockedContactItem}>
      <Text style={styles.contactName}>{`${item.first_name} ${item.last_name}`}</Text>
      <TouchableOpacity onPress={() => this.handleUnblock(item.user_id)} style={styles.unblockButton}>
        <Text style={styles.buttonText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  render() {
    const {
      blockedContacts, isLoading, error, navigation,
    } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text>Back</Text>
          </TouchableOpacity>
          <Text>Blocked Contacts</Text>
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={blockedContacts}
            keyExtractor={(item) => item.user_id.toString()}
            renderItem={this.renderItem()}
          />
        )}
        {error && <Text>{error}</Text>}
      </View>
    );
  }
}

BlockedScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  backButton: {
    position: 'absolute',
    left: 15,
  },
  blockedContactItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  unblockButton: {
    backgroundColor: '#f44336',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
