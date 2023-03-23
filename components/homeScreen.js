import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button } from 'react-native';
import { fetchChats, createChat } from '../services/chatRequests';

export default class HomeScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            chats: [],
            search: '',
            error: '',
            isModalVisible: false,
            newChatName: '',
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

    toggleModal = () => {
        this.setState((prevState) => ({ isModalVisible: !prevState.isModalVisible }));
    };

    handleNewChatNameChange = (text) => {
        this.setState({ newChatName: text });
    };

    handleCreateChat = async () => {
        const { newChatName } = this.state;
        if (!newChatName) {
            this.setState({ error: 'Please enter a chat name' });
            return;
        }

        try {
            const chatResponse = await createChat(newChatName);
            const newChat = { chat_id: chatResponse.chat_id, name: newChatName };
            this.setState((prevState) => ({
                chats: [newChat, ...prevState.chats],
                newChatName: '',
                isModalVisible: false,
            }));
        } catch (error) {
            this.setState({ error: error.message });
        }
    };

    render() {
        const { chats, error, isModalVisible, newChatName } = this.state;

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

                <>
                    {error && (
                        <View>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}
                </>

                <TouchableOpacity style={styles.addButton} onPress={this.toggleModal}>
                    {/* <Text style={styles.addButtonText}>Create Chat</Text> */}
                </TouchableOpacity>

                {/* Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={this.toggleModal}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>Create New Chat</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter chat name"
                                value={newChatName}
                                onChangeText={this.handleNewChatNameChange}
                            />
                            <View style={styles.modalButtonsContainer}>
                                <Button title="Cancel" onPress={this.toggleModal} />
                                <Button title="Create" onPress={this.handleCreateChat} />
                            </View>
                        </View>
                    </View>
                </Modal>


                {/* Floating Button */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.floatingButton}
                    onPress={this.toggleModal}
                >
                    <Text style={styles.floatingButtonText}>+</Text>
                </TouchableOpacity>


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
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold"
    },
    modalInput: {
        height: 40,
        width: '100%',
        marginBottom: 20,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    floatingButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#0084ff',
        position: 'absolute',
        bottom: 20,
        right: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    floatingButtonText: {
        fontSize: 30,
        color: '#FFF'
    }
});