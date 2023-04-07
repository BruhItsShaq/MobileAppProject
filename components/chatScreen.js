import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, FlatList, ActivityIndicator, Modal } from 'react-native';
import { getChatDetails, sendMessage, deleteMessage, updateMessage, addUserToChat, removeUserFromChat } from '../services/chatRequests';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';



export default class ChatScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: '',
            chatName: '',
            chatId: null,
            messages: [],
            newMessage: '',
            isLoading: true,
            userId: null,
            isButtonVisible: null,
            lastClickedMessageId: null,
            lastClickedMessageTimestamp: null,
            isEditing: false, // added state for tracking whether user is currently editing a message
            editingMessageId: null,
            editingMessage: '', // added state for tracking the edited message text
            isModalVisible: false,
        };

        this.sendMessage = this.sendMessage.bind(this);
        this.deleteMessage = this.deleteMessage.bind(this);
        this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
        this.handleMessageClick = this.handleMessageClick.bind(this);
        this.toggleChatModal = this.toggleChatModal.bind(this);
    }

    async componentDidMount() {
        const { route } = this.props;
        const { chatId } = route.params;
        const { chatName } = route.params;
        const userId = await AsyncStorage.getItem('user_id');

        
        this.setState({ chatId, userId, chatName }, () => {
            this.loadMessages();
        });

        // Add a listener for the focus event
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.loadMessages();
        });
    }

    componentWillUnmount() {
        // Unsubscribe from the focus event when the component unmounts
        this._unsubscribe();
    }

    toggleChatModal = () => {
        this.setState((prevState) => ({ isModalVisible: !prevState.isModalVisible }));
    };

    loadMessages = async () => {
        const { chatId } = this.state;
        try {
            const messages = await getChatDetails(chatId);
            this.setState({ messages, isLoading: false, error: null });
        } catch (error) {
            console.log(error);
            this.setState({ error: error.message });
        }
    };

    sendMessage = async () => {
        const { chatId, newMessage } = this.state;
        try {
            const response = await sendMessage(chatId, newMessage);
            if (response.status === 200) {
                // Add the new message to the messages array
                const updatedMessages = [...this.state.messages, response.data];

                // Update the state
                this.setState({ messages: updatedMessages, newMessage: '' }, () => this.loadMessages);
            }
        } catch (error) {
            console.log(error);
            this.setState({ error: error.message });
        }
    };

    deleteMessage = async (messageId) => {
        const { chatId } = this.state;
        try {
            await deleteMessage(chatId, messageId);
            // Remove the deleted message from the messages array
            const updatedMessages = this.state.messages.filter((msg) => msg.message_id !== messageId);

            // Update the state, then loads the updated messages
            this.setState({ messages: updatedMessages }, () => this.loadMessages);
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
                isButtonVisible: false
            });
        } else if ((currentTimestamp - lastClickedMessageTimestamp) < 1000) {
            // Double click detected
            this.setState({
                lastClickedMessageId: messageId,
                lastClickedMessageTimestamp: currentTimestamp,
                isButtonVisible: true
            });
        } else {
            // Single click detected after previous single click
            this.setState({
                lastClickedMessageId: messageId,
                lastClickedMessageTimestamp: currentTimestamp,
                isButtonVisible: false
            });
        }
    };

    handleSaveButtonClick = async () => {
        const chat_id = this.state.chatId;
        const { editingMessageId, editingMessage } = this.state;
        try {
            await updateMessage(chat_id, editingMessageId, editingMessage);
            // Update the UI to reflect the updated message
            await this.loadMessages();
            this.setState({ isEditing: false, editingMessageId: null, editingMessage: '' });
        } catch (error) {
            console.error('Error updating message', error);
            this.setState({ error: error.message });
        }
    };

    addUserToChat = async (userId) => {
        const { chatId } = this.state;
        try {
            const response = await addUserToChat(chatId, userId);
            if (response.status === 200) {
                // Add the new user to the chat in the state
                const updatedChat = { ...this.state.chat };
                updatedChat.users.push(response.data);

                // Update the state
                this.setState({ chat: updatedChat });
            }
        } catch (error) {
            console.log(error);
            this.setState({ error: error.message });
        }
    };

    removeUserFromChat = async (userId) => {
        const { chatId } = this.state;
        try {
            const response = await removeUserFromChat(chatId, userId);
            if (response.status === 200) {
                // Remove the user from the chat in the state
                const updatedChat = { ...this.state.chat };
                updatedChat.users = updatedChat.users.filter(user => user.user_id !== userId);

                // Update the state
                this.setState({ chat: updatedChat });
            }
        } catch (error) {
            console.log(error);
            this.setState({ error: error.message });
        }
    };


    renderMessage = ({ item }) => {
        const { userId, editingMessageId, editingMessage, error } = this.state;
        var authorId = item.author.user_id;
        const isMyMessage = parseInt(authorId) === parseInt(userId);
        const messageStyle = isMyMessage ? styles.myMessage : styles.otherMessage;
        const textStyle = isMyMessage ? styles.myMessageText : styles.otherMessageText;
        const authorName = isMyMessage ? 'Me' : `${item.author.first_name} ${item.author.last_name}`;
        const messageTime = moment(item.timestamp).format('h:mm A');
        const isButtonVisible = this.state.isButtonVisible;

        return (
            <View key={item.message_id} style={messageStyle}>
                {!isMyMessage && <Text style={styles.authorName}>{authorName}</Text>}
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
                                        this.handleSaveButtonClick(item.message_id, this.state.editingMessage);
                                    }}>
                                    <Text style={{ color: 'green' }}>Save</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            // If the message is not being edited, show the edit and delete buttons
                            <>
                                <TouchableOpacity
                                    style={{ paddingHorizontal: 5 }}
                                    onPress={() => {
                                        this.setState({ editingMessageId: item.message_id, editingMessage: item.message });
                                    }}>
                                    <Text style={{ color: 'blue' }}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ paddingHorizontal: 5 }}
                                    onPress={() => this.deleteMessage(item.message_id)}>
                                    <Text style={{ color: 'red' }}>Delete</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
                {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
        );
    };

    render() {
        const { messages, newMessage, isLoading, isModalVisible, newUserId, userId, error, chatName } = this.state;
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
                    <TouchableOpacity style={styles.backButton} onPress={() => this.props.navigation.goBack()}>
                        <Text>Back</Text>
                    </TouchableOpacity>
                    <Text>{chatName}</Text>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.plusButton}
                        onPress={this.toggleChatModal}
                    >
                        <Text style={styles.floatingButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
                    <FlatList
                        data={messages.messages}
                        keyExtractor={(item) => item.message_id.toString()}
                        renderItem={this.renderMessage}
                        ListEmptyComponent={() => <Text style={styles.noMessagesText}>No messages yet.</Text>}
                        contentContainerStyle={{ backgroundColor: '#F6F6F6', flexGrow: 1 }}
                        inverted
                    />
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder={'Type message here'}
                            value={newMessage}
                            onChangeText={(text) => this.setState({ newMessage: text })}
                        />
                        {error && <Text style={styles.errorText}>{error}</Text>}
                        <TouchableOpacity style={styles.sendButton} onPress={this.sendMessage}>
                            <Text style={styles.sendButtonText}>Send</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

                {isModalVisible && (
                    <Modal animationType="slide" transparent={true} visible={isModalVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Members</Text>
                                <FlatList
                                    data={messages.members}
                                    keyExtractor={(item) => item.user_id.toString()}
                                    renderItem={({ item }) => (
                                        <View style={styles.memberItem}>
                                            <Text style={styles.memberName}>
                                                {item.first_name} {item.last_name}
                                            </Text>
                                            {item.user_id !== userId && (
                                                <TouchableOpacity onPress={() => this.removeUserFromChat(item.user_id)}>
                                                    <Icon name="delete" size={24} color="red" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                    ListEmptyComponent={() => <Text style={styles.noMembersText}>No members found.</Text>}
                                />
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={'User ID'}
                                        value={newUserId}
                                        onChangeText={(text) => this.setState({ newUserId: text })}
                                    />
                                    <TouchableOpacity style={styles.addButton} onPress={() => this.addUserToChat(newUserId)}>
                                        <Text style={styles.addButtonText}>Add</Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity style={styles.closeButton} onPress={this.toggleChatModal}>
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
        color: 'black'
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