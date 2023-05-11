/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
import React, { Component } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
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

  // Navigation listener triggers functions everytime component comes into focus
  componentDidMount() {
    const { navigation } = this.props;
    this._unsubscribe = navigation.addListener('focus', () => {
      this.getBlockedContacts();
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  // Function to grab the blocked contacts
  getBlockedContacts = async () => {
    try {
      const data = await getBlockedContacts();
      this.setState({ blockedContacts: data });
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  // Function to handle unblocking contacts
  handleUnblock = async (userId) => {
    try {
      await unblockContact(userId);
      this.getBlockedContacts();
    } catch (error) {
      console.error('Error unblocking contact', error);
    }
  };

  // Function rendering a single blocked contact. Each item has a unblock button
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
      blockedContacts, isLoading, error,
    } = this.state;

    const { navigation } = this.props;
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
            renderItem={this.renderItem}
          />
        )}
        {error && <Text>{error}</Text>}
      </View>
    );
  }
}

// PropTypes validation to ensure that the required props are being passed to the component
BlockedScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
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
