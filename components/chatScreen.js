import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, FlatList, ActivityIndicator } from 'react-native';
import { getChatDetails, sendMessage, deleteMessage, updateMessage } from '../services/chatRequests';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';


export default class ChatScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            chatId: null,
            messages: [],
            newMessage: '',
            isLoading: true,
            userId: null,
            lastClickedMessageId: null,
            lastClickedMessageTimestamp: null,
            isEditing: false, // added state for tracking whether user is currently editing a message
            editedMessageId: null, // added state for tracking which message the user is editing
            editedMessageText: '', // added state for tracking the edited message text
            isButtonVisible: false,
        };

        this.sendMessage = this.sendMessage.bind(this);
        this.deleteMessage = this.deleteMessage.bind(this);
        this.updateMessage = this.updateMessage.bind(this);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);
    }

    async componentDidMount() {
        const { route } = this.props;
        const { chatId } = route.params;
        const userId = await AsyncStorage.getItem('user_id');
        this.setState({ chatId, userId }, () => {
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


    loadMessages = async () => {
        const { chatId } = this.state;
        try {
            const messages = await getChatDetails(chatId);
            this.setState({ messages, isLoading: false });
        } catch (error) {
            console.log(error);
        }
    }

    sendMessage = async () => {
        const { chatId, newMessage } = this.state;
        try {
            const response = await sendMessage(chatId, newMessage);
            if (response.status === 200) {
                // Add the new message to the messages array
                const updatedMessages = [...this.state.messages, response.data];

                // Update the state
                this.setState({ messages: updatedMessages, newMessage: '' });
            }
        } catch (error) {
            console.log(error);
        }
    };

    deleteMessage = async (messageId) => {
        const { chatId } = this.state;
        try {
            await deleteMessage(chatId, messageId);
            // Remove the deleted message from the messages array
            const updatedMessages = this.state.messages.filter((msg) => msg.message_id !== messageId);

            // Update the state
            this.setState({ messages: updatedMessages });
        } catch (error) {
            console.log(error);
        }
    };

    updateMessage = async (messageId, message) => {
        // Set the state to indicate that the user is editing a message
        this.setState({ isEditing: true, editedMessageId: messageId, editedMessageText: message });
    };

    handleEditSubmit = async () => {
        const { chatId, editedMessageId, editedMessageText } = this.state;
        try {
            // Call the updateMessage API to update the message in the database
            await updateMessage(chatId, editedMessageId, editedMessageText);

            // Update the message in the messages array
            const updatedMessages = this.state.messages.map((msg) =>
                msg.message_id === editedMessageId ? { ...msg, message: editedMessageText } : msg
            );

            // Update the state to indicate that the user is no longer editing a message
            this.setState({
                messages: updatedMessages,
                isEditing: false,
                editedMessageId: null,
                editedMessageText: "",
            });
        } catch (err) {
            console.error("Error updating message:", err);
        }
    };

    handleMessageClick = (messageId) => {
        const { lastClickedMessageId, lastClickedMessageTimestamp } = this.state;
        const currentTimestamp = Date.now();
        if (messageId === lastClickedMessageId && (currentTimestamp - lastClickedMessageTimestamp) < 500) {
            // double-click detected
            this.setState({
                lastClickedMessageId: messageId,
                lastClickedMessageTimestamp: currentTimestamp,
                isButtonVisible: true,
            });
        } else {
            // single-click detected
            this.setState({
                lastClickedMessageId: messageId,
                lastClickedMessageTimestamp: currentTimestamp,
                isButtonVisible: false,
            });
        }
    };



    renderMessage = ({ item }) => {
        const { userId, lastClickedMessageId, lastClickedMessageTimestamp, isEditing, editedMessageId, editedMessageText } = this.state;
        const authorId = item.author.user_id;
        const isMyMessage = parseInt(authorId) === parseInt(userId);
        const messageStyle = isMyMessage ? styles.myMessage : styles.otherMessage;
        const textStyle = isMyMessage ? styles.myMessageText : styles.otherMessageText;
        const authorName = isMyMessage ? 'Me' : `${item.author.first_name} ${item.author.last_name}`;
        const messageTime = moment(item.timestamp).format('h:mm A');
        const isButtonVisible = item.message_id === lastClickedMessageId && (Date.now() - lastClickedMessageTimestamp) < 1000;
        const showEditDeleteButtons = item.message_id === lastClickedMessageId;

        return (
            <View style={[styles.messageContainer, messageStyle]}>
                <Text style={styles.author}>{authorName}</Text>
                {!isEditing && (
                    <TouchableOpacity style={styles.message} onDoubleTap={() => this.handleMessageClick(item.message_id)}>
                        <Text style={textStyle}>{item.message}</Text>
                    </TouchableOpacity>
                )}
                {isEditing && item.message_id === editedMessageId && (
                    <View style={styles.editContainer}>
                        <TextInput
                            style={styles.editInput}
                            onChangeText={(text) => this.setState({ editedMessageText: text })}
                            value={editedMessageText}
                        />
                        <TouchableOpacity style={styles.editButton} onPress={this.handleEditSubmit}>
                            <Text style={styles.editButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {isMyMessage && !isEditing && isButtonVisible && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.editButton} onPress={() => this.updateMessage(item.message_id, item.message)}>
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => this.deleteMessage(item.message_id)}>
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {!isMyMessage && !isEditing && showEditDeleteButtons && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.reportButton} onPress={() => this.reportMessage(item.message_id)}>
                            <Text style={styles.reportButtonText}>Report</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <Text style={styles.time}>{messageTime}</Text>
            </View>
        );
    };

    render() {
        const { messages, newMessage, isLoading } = this.state;

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
                        <TouchableOpacity style={styles.sendButton} onPress={this.sendMessage}>
                            <Text style={styles.sendButtonText}>Send</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        );
    }
}


const styles = StyleSheet.create({
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
    }
});