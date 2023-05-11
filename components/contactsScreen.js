/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  getContacts, addContact, blockContact, deleteContact, searchUsers,
} from '../services/contactRequests';

export default class ContactsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contacts: [], // Contacts Array
      contactPictures: {}, // Object for mapping user ids to profile pic URLS
      error: '',
      searchResults: [], // Search results array
      searchTerm: '',
      searchLimit: '20',
      searchOffset: '0',
    };
  }

  // Navigation listener triggers functions everytime component comes into focus
  componentDidMount() {
    const { navigation } = this.props;
    this._unsubscribe = navigation.addListener('focus', () => {
      this.loadContacts();
    });
  }

  // Remove listener when component unmounts
  componentWillUnmount() {
    this._unsubscribe();
  }

  // Fetches profile picutre using user id
  // eslint-disable-next-line class-methods-use-this
  async get_profile_image(uId) {
    const sessionToken = await AsyncStorage.getItem('session_token');
    return fetch(`http://localhost:3333/api/1.0.0/user/${uId}/photo`, {
      method: 'GET',
      headers: {
        'X-Authorization': sessionToken,
      },
    })
      .then((res) => res.blob())
      .then((resBlob) => URL.createObjectURL(resBlob))
      .catch((err) => {
        console.log(err);
      });
  }

  // Functions fetches all contacts
  loadContacts = async () => {
    try {
      // Calls getContacts to fetch contacts
      const contactData = await getContacts();
      // After state is updated, loadContactsPictures function fetches profile picture for each contact
      this.setState({ contacts: contactData }, () => {
        this.loadContactsPictures();
      });
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  // Function fetches picture for each Contact
  loadContactsPictures = async () => {
    const { contacts } = this.state;
    try {
      // Maps over the contact to create an array of Promises. Each Promise is a call
      // to get the profile pictures for each contact using their user_id
      const contactPictures = await Promise.all(
        contacts.map(async (contact) => {
          const profilePicture = await this.get_profile_image(contact.user_id);
          // Returns an object. Key = user_id and Value = profile picture URL
          return { [contact.user_id]: profilePicture };
        }),
      );

      // Merges all objects in contactPictures array into one object
      const mergedContactPictures = Object.assign({}, ...contactPictures);
      // Update state with merged object, mapping user ids to profile picture URLs
      this.setState({ contactPictures: mergedContactPictures });
    } catch (error) {
      console.error('Error getting profile photos for contacts', error);
    }
  };

  // Function for handling adding contact
  handleAddContact = async (userId) => {
    try {
      const response = await addContact(userId);
      // Check the response text from the server and setStates appropriately
      if (response === 'OK') {
        this.setState({ error: '' }, this.loadContacts);
      } else if (response === 'Already a contact') {
        this.setState({ error: 'This user is already in your contacts.' });
      }
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  // Function for handling deletion of contact
  handleDeleteContact = async (userId) => {
    try {
      await deleteContact(userId);
      // Load new contacts for updated list
      this.loadContacts();
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  // Function for handling blocked contacts
  handleBlockContact = async (userId) => {
    try {
      // Will send current contact to block list
      await blockContact(userId);
      this.loadContacts();
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  // Will handle search functionality
  handleSearch = async () => {
    const { searchTerm, searchLimit, searchOffset } = this.state;

    // Validation for search
    const SEARCH_REGEX = /^[a-zA-Z\s-]+$/;

    if (searchTerm.trim() === '') {
      this.setState({ error: 'Please enter something before searching.' });
      return;
    } if (!SEARCH_REGEX.test(searchTerm)) {
      this.setState({ error: 'Please use only letters, spaces, and hyphens in the search term.' });
      return;
    }

    try {
      const results = await searchUsers(
        searchTerm,
        parseInt(searchLimit, 10),
        parseInt(searchOffset, 10),
      );
      this.setState({ searchResults: results, error: '' }, () => {
        // Once state is updated, it fetches their profile picture
        this.searchResultPictures();
      });
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  searchResultPictures = async () => {
    const { searchResults, contactPictures } = this.state;

    // Create an array of promises to fetch all profile pictures at the same time
    const profilePicturePromises = searchResults.map((contact) => this.get_profile_image(contact.user_id).catch((error) => {
      console.error(`Error getting profile photo for user_id: ${contact.user_id}`, error);
      return null; // Return null if there's an error, so that Promise.all doesn't reject
    }));

    // Use Promise.all to wait for all promises to resolve at the same time
    const profilePictures = await Promise.all(profilePicturePromises);

    // Combine the fetched profile pictures with the existing contactPictures object
    const updatedContactPictures = { ...contactPictures };
    searchResults.forEach((contact, index) => {
      if (profilePictures[index] !== null) {
        updatedContactPictures[contact.user_id] = profilePictures[index];
      }
    });

    // Update the state with the updated contactPictures
    this.setState({ contactPictures: updatedContactPictures });
  };

  // Handle how to render single search items respectively
  renderSearchItem = ({ item }) => {
    const { contactPictures } = this.state;
    const profilePicture = contactPictures[item.user_id];

    return (
      <View style={styles.contactItem}>
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
        ) : (
          <Icon name="user" size={24} color="black" />
        )}
        <Text>
          {item.given_name}
          {' '}
          {item.family_name}
        </Text>
        <View style={styles.contactButtons}>
          <TouchableOpacity onPress={() => this.handleAddContact(item.user_id)}>
            <MaterialIcons name="add" size={24} colour="blue" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Handles rendering a single contact respectively
  renderItem = ({ item }) => {
    const { contactPictures } = this.state;
    const profilePicture = contactPictures[item.user_id];

    return (
      <View style={styles.contactItem}>
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
        ) : (
          <Icon name="user" size={24} color="black" />
        )}
        <Text>
          {item.first_name}
          {' '}
          {item.last_name}
        </Text>
        <View style={styles.contactButtons}>
          <TouchableOpacity onPress={() => this.handleBlockContact(item.user_id)}>
            <MaterialIcons name="block" size={24} color="red" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.handleDeleteContact(item.user_id)}>
            <MaterialIcons name="delete" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  render() {
    const {
      contacts, error, searchResults, searchTerm,
    } = this.state;
    const { navigation } = this.props;

    console.log('Search results:', searchResults);
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Contacts</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts"
            value={searchTerm}
            onChangeText={(text) => this.setState({ searchTerm: text })}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => this.handleSearch(searchTerm)}
          >
            <MaterialIcons name="search" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.limitOffsetContainer}>
          <TextInput
            style={styles.limitOffsetInput}
            placeholder="Limit"
            //   value={this.state.searchLimit}
            keyboardType="number-pad"
            onChangeText={(text) => this.setState({ searchLimit: text })}
          />
          <TextInput
            style={styles.limitOffsetInput}
            placeholder="Offset"
            //   value={this.state.searchOffset}
            keyboardType="number-pad"
            onChangeText={(text) => this.setState({ searchOffset: text })}
          />
        </View>

        {/* If the user is currently searching and results is greater > 0, then
        render search items in flatlist, else render contacts */}
        {searchTerm && searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={this.renderSearchItem}
            keyExtractor={(item, index) => (item.user_id || index).toString()}
            ListEmptyComponent={<Text style={styles.text}>No contacts found</Text>}
          />
        ) : (
          <FlatList
            data={contacts}
            renderItem={this.renderItem}
            keyExtractor={(item) => item.user_id.toString()}
            ListEmptyComponent={<Text style={styles.text}>No contacts found</Text>}
          />
        )}

        {error && (
        <View>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        )}

        <TouchableOpacity style={styles.blockedContactsButton} onPress={() => { navigation.navigate('Blocked'); }}>
          <AntDesign name="lock" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  }
}

// PropTypes validation to ensure that the required props are being passed to the component
ContactsScreen.propTypes = {
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
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'blue',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 'auto',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    width: '100%',
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
  },
  blockedContactsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 5,
    marginLeft: 5,
  },
  searchButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: 'white',
    marginLeft: 5,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  limitOffsetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  limitOffsetInput: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    width: 50,
    padding: 3,
    fontSize: 12,
    textAlign: 'center',
  },
});
