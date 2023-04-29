import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { getContacts, addContact, blockContact, deleteContact, searchUsers } from '../services/contactRequests';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';


export default class ContactsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contacts: [],
      contactPictures: {},
      error: '',
      modalVisible: false,
      newContactId: '',
      searchResults: [],
      searchTerm: ''
    };
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.loadContacts();
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }


  loadContacts = async () => {
    try {
      const contactData = await getContacts();
      this.setState({ contacts: contactData }, () => {
        this.loadContactsPictures();
      });
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  loadContactsPictures = async () => {
    const { contacts } = this.state;
    const contactPictures = {};
    for (const contact of contacts) {
      try {
        const profilePicture = await this.get_profile_image(contact.user_id);
        contactPictures[contact.user_id] = profilePicture;
      } catch (error) {
        console.error(`Error getting profile photo for user_id: ${contact.user_id}`, error);
      }
    }
    this.setState({ contactPictures });
  }

  async get_profile_image(u_id) {
    const session_token = await AsyncStorage.getItem('session_token');
    return fetch(`http://localhost:3333/api/1.0.0/user/${u_id}/photo`, {
      method: "GET",
      headers: {
        "X-Authorization": session_token
      }
    })
      .then((res) => {
        return res.blob()
      })
      .then((resBlob) => {
        return URL.createObjectURL(resBlob);
      })
      .catch((err) => {
        console.log(err)
      })
  }

  handleAddContact = async (user_id) => {
    //const { newContactId } = this.state;
    try {
      await addContact(user_id);
      Alert.alert('Success', 'Contact added successfully.');
      this.setState({ modalVisible: false, newContactId: '', error: '' }, this.loadContacts);
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  handleDeleteContact = async (user_id) => {
    try {
      await deleteContact(user_id);
      this.loadContacts();
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  handleBlockContact = async (user_id) => {
    try {
      await blockContact(user_id);
      //     Alert.alert('Success', 'Contact blocked successfully.');
      this.loadContacts();
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  handleSearch = async () => {
    try {
      const results = await searchUsers(this.state.searchTerm);
      this.setState({ searchResults: results }, () => {
        this.searchResultPitures();
      });
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  searchResultPitures = async () => {
    const { searchResults } = this.state;
    const contactPictures = { ...this.state.contactPictures }; // Copy existing contact pictures to preserve the data
    for (const contact of searchResults) {
      try {
        const profilePicture = await this.get_profile_image(contact.user_id);
        contactPictures[contact.user_id] = profilePicture;
      } catch (error) {
        console.error(`Error getting profile photo for user_id: ${contact.user_id}`, error);
      }
    }
    this.setState({ contactPictures });
  };


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
          {item.given_name} {item.family_name}
        </Text>
        <View style={styles.contactButtons}>
          <TouchableOpacity onPress={() => this.handleAddContact(item.user_id)}>
            <MaterialIcons name="add" size={24} colour="blue" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          {item.first_name} {item.last_name}
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
    const { contacts, error, modalVisible, newContactId, searchResults, searchTerm } = this.state;

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
          <TouchableOpacity style={styles.searchButton} onPress={() => this.handleSearch(searchTerm)}>
            <MaterialIcons name="search" size={24} color="black" />
          </TouchableOpacity>
        </View>
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
        <>
          {error && (
            <View>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </>
        {/* <TouchableOpacity
          style={styles.fab}
          onPress={() => this.setState({ modalVisible: true })}
        >
          <MaterialIcons name="add" size={30} color="white" />
        </TouchableOpacity>
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.input}
              placeholder="Enter user ID"
              value={newContactId}
              onChangeText={(text) => this.setState({ newContactId: text })}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={this.handleAddContact}>
                <Text style={styles.buttonText}>Add Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: 'gray' }]}
                onPress={() => this.setState({ modalVisible: false })}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <TouchableOpacity style={styles.blockedContactsButton} onPress={() => { this.props.navigation.navigate('Blocked') }}>
          <AntDesign name="lock" size={24} color="black" />
        </TouchableOpacity> */}
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
});