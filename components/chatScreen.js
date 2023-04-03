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
            isButtonVisible: null,
            lastClickedMessageId: null,
            lastClickedMessageTimestamp: null,
            isEditing: false, // added state for tracking whether user is currently editing a message
            editingMessageId: null,
            editingMessage: '', // added state for tracking the edited message text
        };

        this.sendMessage = this.sendMessage.bind(this);
        this.deleteMessage = this.deleteMessage.bind(this);
        this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
        this.handleMessageClick = this.handleMessageClick.bind(this);
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

    // updateMessage = async (messageId, message) => {
    //     // Set the state to indicate that the user is editing a message
    //     this.setState({ isEditing: true, editedMessageId: messageId, editedMessageText: message });
    // };

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
            // Display an error message to the user
            // e.g. using a Toast component or by updating the state to display an error message
            this.setState({ errorMessage: error.message });
        }
    };

    renderMessage = ({ item }) => {
        const { userId, lastClickedMessageId, lastClickedMessageTimestamp, editingMessageId, editingMessage } = this.state;
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
    }
});