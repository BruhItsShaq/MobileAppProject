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
} from 'react-native';
import { getContacts, addContact, blockContact, deleteContact } from '../services/contactRequests';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';


export default class ContactsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contacts: [],
      error: '',
      modalVisible: false,
      newContactId: '',
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
      this.setState({ contacts: contactData });
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  handleAddContact = async () => {
    const { newContactId } = this.state;
    try {
      await addContact(newContactId);
      Alert.alert('Success', 'Contact added successfully.');
      this.setState({ modalVisible: false, newContactId: '' }, this.loadContacts);
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  handleDeleteContact = async (user_id) => {
    try{
        await deleteContact(user_id);
        this.loadContacts();
    } catch (error) {
      this.setState({ error: error.message});
    }
  };

  handleBlockContact = async (user_id) => {
    try {
      await blockContact(user_id);
      Alert.alert('Success', 'Contact blocked successfully.');
      this.loadContacts();
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  renderItem = ({ item }) => {
    return (
      <View style={styles.contactItem}>
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
    const { contacts, error, modalVisible, newContactId } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Contacts</Text>
        <FlatList
          data={contacts}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.user_id.toString()}
          ListEmptyComponent={<Text style={styles.text}>No contacts found</Text>}
        />
        <>
          {error && (
            <View>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </>
        <TouchableOpacity
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
        </TouchableOpacity>
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
});