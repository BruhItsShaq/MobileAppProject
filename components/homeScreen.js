import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { fetchChats } from '../services/chatRequests';

export default class HomeScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            chats: [],
            search: '',
            error: '',
        };
    }

    componentDidMount() {
        this.loadChats();
    }

    loadChats = async () => {
        try {
            const chatData = await fetchChats();
            this.setState({ chats: chatData });
        } catch (error) {
            this.setState({ error: error.message });
        }
    };

    handleChatPress = (chat_id) => {
        // Add your navigation logic here, e.g., navigate to the chat screen
        console.log('Chat pressed:', chat_id);
    };

    render() {
        const { chats, error } = this.state;

        return (
            <View style={styles.container}>
                <FlatList
                    data={chats}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => this.handleChatPress(item.chat_id)}>
                            <View style={styles.chatItem}>
                                <Text style={styles.chatTitle}>{item.name}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.chat_id.toString()}
                    ListEmptyComponent={
                        <View>
                            <Text style={styles.emptyText}>No chats available</Text>
                        </View>
                    }
                />
                {error && (
                    <View>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0',
    },
    chatItem: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    chatTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    noChatsMessage: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        color: '#444',
    },
    error: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});