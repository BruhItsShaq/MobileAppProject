/* eslint-disable no-use-before-define */
import React, { Component } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, FlatList,
  ActivityIndicator, Modal,
} from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getContacts } from '../services/contactRequests';
import {
  getChatDetails, sendMessage, deleteMessage, updateMessage, addUserToChat, removeUserFromChat,
} from '../services/chatRequests';

const renderEmptyList = () => <Text style={styles.noMessagesText}>No messages yet.</Text>;
const renderNoContacts = () => { <Text style={styles.text}>No contacts found</Text>; };
const renderNoMembers = () => <Text style={styles.noMessagesText}>No members found</Text>;

export default class ChatScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
      chatName: '',
      chatId: null,
      contacts: [],
      messages: [],
      members: [],
      drafts: [],
      refresh: false,
      newMessage: '',
      isLoading: true,
      userId: null,
      isButtonVisible: null,
      isDraftButtonVisible: false,
      lastClickedMessageId: null,
      lastClickedMessageTimestamp: null,
      editingMessageId: null,
      editingMessage: '',
      isModalVisible: false,
      isDraftModalVisible: false,
    };

    this.sendMessage = this.sendMessage.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
    this.handleMessageClick = this.handleMessageClick.bind(this);
    this.toggleChatModal = this.toggleChatModal.bind(this);
    this.toggleDraftModal = this.toggleDraftModal.bind(this);
    this.saveToDrafts = this.saveToDrafts.bind(this);
    this.loadDrafts = this.loadDrafts.bind(this);
    this.deleteDraft = this.deleteDraft.bind(this);
    this.loadDraftToInput = this.loadDraftToInput.bind(this);
  }

  async componentDidMount() {
    // Extract chatId and chatName from route params
    const { route } = this.props;
    const { chatId } = route.params;
    const { chatName } = route.params;
    const { navigation } = this.props;
    const userId = await AsyncStorage.getItem('user_id');

    // Load messages, contacts and drafts for current chat
    this.setState({ chatId, userId, chatName }, () => {
      this.loadMessages();
      this.loadContacts();
      this.loadDrafts();
    });

    // Navigation listener triggers functions everytime component comes into focus
    this._unsubscribe = navigation.addListener('focus', () => {
      this.loadMessages();
      this.loadContacts();
      this.loadDrafts();
    });
  }

  componentWillUnmount() {
    // Unsubscribe from the focus event when the component unmounts
    this._unsubscribe();
  }

  toggleChatModal = () => {
    this.setState((prevState) => ({ isModalVisible: !prevState.isModalVisible }));
  };

  loadContacts = async () => {
    try {
      const contactData = await getContacts();
      this.setState({ contacts: contactData });
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  // Fetches chat details of specific chat
  loadMessages = async () => {
    const { chatId, refresh } = this.state;
    try {
      const messages = await getChatDetails(chatId);

      this.setState({
        messages,
        members: messages.members,
        isLoading: false,
        error: null,
        refresh,
      });
      console.log('Updated messages state:', messages);
    } catch (error) {
      console.log(error);
      this.setState({ error: error.message });
    }
  };

  // Function responsible for sending a message
  sendMessage = async () => {
    const { chatId, newMessage } = this.state;
    // Error displayed if input box is empty
    if (newMessage.trim() === '') {
      this.setState({ error: 'Message cannot be empty.' });
      return;
    }
    try {
      const response = await sendMessage(chatId, newMessage);
      if (response.status === 200) {
        // Will call load messages again to show new messages
        this.setState({ newMessage: ' ' });
        this.loadMessages();
      }
    } catch (error) {
      console.log(error);
      this.setState({ error: error.message });
    }
  };

  // Handle deletion of message
  deleteMessage = async (messageId) => {
    const { chatId } = this.state;
    try {
      const response = await deleteMessage(chatId, messageId);
      if (response.status === 200) {
        // If successful, messages loaded again
        this.loadMessages();
      }
    } catch (error) {
      console.log(error);
      this.setState({ error: error.message });
    }
  };

  handleMessageClick = (messageId) => {
    const { lastClickedMessageId, lastClickedMessageTimestamp } = this.state;
    const currentTimestamp = Date.now();

    if (messageId !== lastClickedMessageId) {
      // Single click detected
      this.setState({
        lastClickedMessageId: messageId,
        lastClickedMessageTimestamp: currentTimestamp,
        isButtonVisible: false,
      });
    } else if ((currentTimestamp - lastClickedMessageTimestamp) < 1000) {
      // Double click detected
      this.setState({
        lastClickedMessageId: messageId,
        lastClickedMessageTimestamp: currentTimestamp,
        isButtonVisible: true,
      });
    } else {
      // Single click detected after previous single click
      this.setState({
        lastClickedMessageId: messageId,
        lastClickedMessageTimestamp: currentTimestamp,
        isButtonVisible: false,
      });
    }
  };

  // Handles the updating of a message
  handleSaveButtonClick = async () => {
    const { chatId } = this.state;
    const { editingMessageId, editingMessage } = this.state;
    if (editingMessage.trim() === '') {
      this.setState({ error: 'Edited message cannot be empty.' });
      return;
    }
    // Updates message using chatid, message id and message
    // On success, messages are loaded again
    try {
      await updateMessage(chatId, editingMessageId, editingMessage);
      await this.loadMessages();
      this.setState({ editingMessageId: null, editingMessage: '' });
    } catch (error) {
      console.error('Error updating message', error);
      this.setState({ error: error.message });
    }
  };

  // Drafts loaded from AsyncStorage
  loadDrafts = async () => {
    const { chatId } = this.state;
    const draftKey = `draft_${chatId}`;
    const existingDrafts = await AsyncStorage.getItem(draftKey);
    const drafts = existingDrafts ? JSON.parse(existingDrafts) : [];
    this.setState({ drafts });
  };

  // Saved newMessages to drafts
  saveToDrafts = async () => {
    const { newMessage, chatId } = this.state;
    const draftKey = `draft_${chatId}`;

    try {
      const existingDrafts = await AsyncStorage.getItem(draftKey);
      const drafts = existingDrafts ? JSON.parse(existingDrafts) : [];
      drafts.push(newMessage);
      await AsyncStorage.setItem(draftKey, JSON.stringify(drafts));
      this.setState({ newMessage: '', isDraftButtonVisible: false });
      this.loadDrafts();
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  // Handle deleting of draft
  deleteDraft = async (index) => {
    const { chatId, drafts } = this.state;
    const draftKey = `draft_${chatId}`;

    try {
      drafts.splice(index, 1);
      await AsyncStorage.setItem(draftKey, JSON.stringify(drafts));
      this.setState({ drafts });
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  // Handle adding a user to the chat with their user id
  addUserToChat = async (userId) => {
    const { chatId, refresh } = this.state;
    try {
      await addUserToChat(chatId, userId);
      this.loadMessages();
      this.setState({ refresh: !refresh });
    } catch (error) {
      console.log(error);
      this.setState({ error: error.message });
    }
  };

  // Removes user from the chat
  removeUserFromChat = async (userId) => {
    const { chatId, refresh } = this.state;
    try {
      await removeUserFromChat(chatId, userId);
      // On success, will load messages and refresh flatlist
      this.loadMessages();
      this.setState({ refresh: !refresh });
    } catch (error) {
      console.log(error);
      this.setState({ error: error.message });
    }
  };

  // loads draft into input box
  loadDraftToInput(draft) {
    this.setState({ newMessage: draft, isDraftModalVisible: false });
  }

  // Toggles draft modal
  toggleDraftModal() {
    this.setState((prevState) => ({ isDraftModalVisible: !prevState.isDraftModalVisible }));
  }

  renderMessage = ({ item }) => {
    // Determines whether message is sent by current user or not. Based on this
    // it sets the style and username for the message
    const { userId, editingMessageId, editingMessage } = this.state;
    const authorId = item.author.user_id;
    const isMyMessage = parseInt(authorId, 10) === parseInt(userId, 10);
    const messageStyle = isMyMessage ? styles.myMessage : styles.otherMessage;
    const textStyle = isMyMessage ? styles.myMessageText : styles.otherMessageText;
    const userName = isMyMessage ? 'Me' : `${item.author.first_name} ${item.author.last_name}`;
    const messageTime = moment(item.timestamp).format('h:mm A');
    const { isButtonVisible } = this.state;

    return (
      <View key={item.message_id} style={messageStyle}>
        {!isMyMessage && <Text style={styles.authorName}>{userName}</Text>}
        <TouchableOpacity onPress={() => this.handleMessageClick(item.message_id)}>
          <Text style={[styles.messageText, textStyle]}>{item.message}</Text>
        </TouchableOpacity>
        <Text style={styles.messageTime}>{messageTime}</Text>
        {isMyMessage && isButtonVisible && (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 }}>
          {editingMessageId === item.message_id ? (
          // If the message is being edited, show a text input and save button
            <>
              <TextInput
                style={{ flex: 1, padding: 5, borderWidth: 1 }}
                value={editingMessage}
                onChangeText={(text) => this.setState({ editingMessage: text })}
              />
              <TouchableOpacity
                style={{ paddingHorizontal: 5 }}
                onPress={() => {
                  this.handleSaveButtonClick(item.message_id, editingMessage);
                }}
              >
                <Text style={{ color: 'green' }}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
          // If the message is not being edited, show the edit and delete buttons
            <>
              <TouchableOpacity
                style={{ paddingHorizontal: 5 }}
                onPress={() => {
                  this.setState({
                    editingMessageId: item.message_id,
                    editingMessage: item.message,
                  });
                }}
              >
                <Text style={{ color: 'blue' }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ paddingHorizontal: 5 }}
                onPress={() => this.deleteMessage(item.message_id)}
              >
                <Text style={{ color: 'red' }}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        )}
      </View>
    );
  };

  renderContacts = ({ item }) => (
    <View style={styles.contactItem}>
      <Text>
        {item.first_name}
        {' '}
        {item.last_name}
      </Text>
      <View style={styles.contactButtons}>
        <TouchableOpacity onPress={() => this.addUserToChat(item.user_id)}>
          <Icon name="plus" size={24} color="green" />
        </TouchableOpacity>
      </View>
    </View>
  );

  render() {
    const { navigation } = this.props;
    const {
      messages, newMessage, isLoading, isModalVisible, userId, error, chatName, contacts,
      members, refresh, isDraftButtonVisible, isDraftModalVisible, drafts,
    } = this.state;
    console.log('messages:', messages);
    console.log('newMessage:', newMessage);

    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text>Back</Text>
          </TouchableOpacity>
          <Text>{chatName}</Text>
          {/* Buttons to toggle member and draft modals */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.draftButton}
            onPress={this.toggleDraftModal}
          >
            <Icon name="bookmark" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.plusButton}
            onPress={this.toggleChatModal}
          >
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <FlatList
          // render messages in functions, extra data to refresh flatlist
            extraData={refresh}
            data={messages.messages}
            keyExtractor={(item) => item.message_id.toString()}
            renderItem={this.renderMessage}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={{ backgroundColor: '#F6F6F6', flexGrow: 1 }}
            inverted
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.inputContainer}>
            {/* Will check to see if isDraftButtonVisible is true or false
              and display bookmark button to save drafts */}
            {isDraftButtonVisible && (
            <TouchableOpacity style={styles.sendButton} onPress={this.saveToDrafts}>
              <Icon name="bookmark" size={24} />
            </TouchableOpacity>
            )}
            <TextInput
              style={styles.input}
              placeholder="Type message here"
              value={newMessage}
              onChangeText={(text) => this.setState({
                newMessage: text,
                isDraftButtonVisible: text.length > 0,
              })}
            />
            <TouchableOpacity style={styles.sendButton} onPress={this.sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Modal for rendering members */}
        {isModalVisible && (
        <Modal animationType="slide" transparent visible={isModalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {error && <Text style={styles.errorText}>{error}</Text>}
              <Text style={styles.modalTitle}>Contacts</Text>
              <FlatList
                data={contacts}
                renderItem={this.renderContacts}
                keyExtractor={(item) => item.user_id.toString()}
                ListEmptyComponent={renderNoContacts}
              />
              <Text style={styles.modalTitle}>Members</Text>
              <FlatList
                extraData={refresh}
                data={members}
                keyExtractor={(item) => item.user_id.toString()}
                renderItem={({ item }) => {
                  console.log('Rendering member:', item);
                  return (
                    <View style={styles.memberItem}>
                      <Text style={styles.memberName}>
                        {item.first_name}
                        {' '}
                        {item.last_name}
                      </Text>
                      {item.user_id !== userId && (
                      <TouchableOpacity onPress={() => this.removeUserFromChat(item.user_id)}>
                        <Icon name="minus" size={24} color="red" />
                      </TouchableOpacity>
                      )}
                    </View>
                  );
                }}
                ListEmptyComponent={renderNoMembers}
                inverted
              />
              <TouchableOpacity style={styles.closeButton} onPress={this.toggleChatModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        )}
        {/* Modal for rendering drafts */}
        {isDraftModalVisible && (
        <Modal animationType="slide" transparent visible={isDraftModalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Drafts</Text>
              <FlatList
                data={drafts}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.memberItem}>
                    <Text style={styles.memberName}>{item}</Text>
                    <View style={styles.draftControls}>
                      <TouchableOpacity onPress={() => this.loadDraftToInput(item)}>
                        <Icon name="share-square-o" size={24} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => this.deleteDraft(index)}>
                        <Icon name="trash" size={24} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
              <TouchableOpacity style={styles.closeButton} onPress={this.toggleDraftModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        )}
      </View>
    );
  }
}

// PropTypes validation to ensure that the required props are being passed to the component
ChatScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      chatId: PropTypes.string.isRequired,
      chatName: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

const styles = StyleSheet.create({
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
  plusButton: {
    position: 'absolute',
    right: 15,
  },
  draftButton: {
    position: 'absolute',
    right: 50,
  },
  draftControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C5',
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
    marginRight: 10,
    marginLeft: 50,
    maxWidth: '80%',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
    marginRight: 50,
    marginLeft: 10,
    maxWidth: '80%',
  },
  noMessagesText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#9B9B9B',
  },
  messageText: {
    fontSize: 16,
    color: 'black',
  },
  authorName: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 16,
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    marginRight: 10,
    padding: 10,
  },
  sendButton: {
    backgroundColor: '#FFA500',
    borderRadius: 20,
    padding: 10,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageTime: {
    fontSize: 10,
    color: '#9B9B9B',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  myMessageText: {
    fontSize: 16,
    color: 'black',
  },
  otherMessageText: {
    fontSize: 16,
    color: 'black',
  },
  floatingButtonText: {
    fontSize: 30,
    color: 'black',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noMembersText: {
    fontSize: 16,
    color: '#9B9B9B',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#FFA500',
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#0084ff',
    borderRadius: 20,
    padding: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
