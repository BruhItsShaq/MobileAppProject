import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, FlatList, ActivityIndicator } from 'react-native';
import { getChatDetails, sendMessage } from '../services/chatRequests';
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
        };


    }

    async componentDidMount() {
        const { route } = this.props;
        const { chatId } = route.params;
        const userId = await AsyncStorage.getItem('user_id');
        this.setState({ chatId, userId }, () => {
            this.loadMessages();
        });
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
                const updatedMessages = [...messages, response.data];

                // Update the state
                this.setState({ messages: updatedMessages, newMessage: '' });
            }
        } catch (error) {
            console.log(error);
        }
    };


    renderMessage = ({ item }) => {
        const { userId } = this.state;
        var authorId = item.author.user_id;
        const isMyMessage = parseInt(authorId) === parseInt(userId);
        const messageStyle = isMyMessage ? styles.myMessage : styles.otherMessage;
        const textStyle = isMyMessage ? styles.myMessageText : styles.otherMessageText;
        const authorName = isMyMessage ? 'Me' : `${item.author.first_name} ${item.author.last_name}`;
        const messageTime = moment(item.timestamp).format('h:mm A');

        return (
            <View key={item.message_id} style={messageStyle}>
                {!isMyMessage && <Text style={styles.authorName}>{authorName}</Text>}
                <Text style={[styles.messageText, textStyle]}>{item.message}</Text>
                <Text style={styles.messageTime}>{messageTime}</Text>
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
        color: 'white',
    },
    otherMessageText: {
        fontSize: 16,
        color: 'black',
    }
});