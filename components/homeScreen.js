import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button } from 'react-native';
import { fetchChats, createChat, updateChatName } from '../services/chatRequests';
import { MaterialIcons } from '@expo/vector-icons';

export default class HomeScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            chats: [],
            search: '',
            error: '',
            isCreateModalVisible: false,
            isUpdateModalVisible: false,
            newChatName: '',
            chatIdToUpdate: null,
            updatedChatName: '',
            updateError: '',
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
        this.props.navigation.navigate('Chat', { chatId: chat_id });
    };

    toggleCreateModal = () => {
        this.setState((prevState) => ({ isCreateModalVisible: !prevState.isCreateModalVisible }));
    };

    toggleUpdateModal = () => {
        this.setState((prevState) => ({ isUpdateModalVisible: !prevState.isUpdateModalVisible }));
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
                isCreateModalVisible: false,
            }));
        } catch (error) {
            this.setState({ error: error.message });
        }
    };

    handleUpdateChatName = async () => {
        const { chatIdToUpdate, updatedChatName } = this.state;

        if (!chatIdToUpdate) {
            this.setState({ updateError: 'Please select a chat to update' });
            return;
        }

        if (!updatedChatName) {
            this.setState({ updateError: 'Please enter a new chat name' });
            return;
        }

        try {
            const response = await updateChatName(chatIdToUpdate, updatedChatName);
            const updatedChats = [...this.state.chats];
            const index = updatedChats.findIndex((chat) => chat.chat_id === chatIdToUpdate);
            updatedChats[index].name = updatedChatName;
            this.setState({
                chats: updatedChats,
                isUpdateModalVisible: false,
                updatedChatName: '',
                updateError: '',
            });
        } catch (error) {
            this.setState({ updateError: error.message });
        }
    };

    render() {
        const { chats, error, isCreateModalVisible, isUpdateModalVisible, newChatName, updatedChatName } = this.state;

        return (
            <View style={styles.container}>
                <FlatList
                    data={chats}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => this.handleChatPress(item.chat_id)}>
                            <View style={styles.chatItem}>
                                <View style={styles.chatTitleContainer}>
                                    <Text style={styles.chatTitle}>{item.name}</Text>
                                    <TouchableOpacity
                                        style={styles.updateIconContainer}
                                        onPress={() => {
                                            this.setState({
                                                isUpdateModalVisible: true,
                                                chatIdToUpdate: item.chat_id,
                                                updatedChatName: item.name,
                                            });
                                        }}
                                    >
                                        <MaterialIcons name="edit" size={20} color="#0bff03" />
                                    </TouchableOpacity>
                                </View>
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
                {/* Create New Chat Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isCreateModalVisible}
                    onRequestClose={this.toggleCreateModal}
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
                                <Button title="Cancel" onPress={this.toggleCreateModal} />
                                <Button title="Create" onPress={this.handleCreateChat} />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Update Chat Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isUpdateModalVisible}
                    onRequestClose={this.toggleUpdateModal}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>Update Chat</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter new chat name"
                                value={updatedChatName}
                                onChangeText={(text) => this.setState({ updatedChatName: text })}
                            />
                            {this.state.updateError && (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{this.state.updateError}</Text>
                                </View>
                            )}
                            <View style={styles.modalButtonsContainer}>
                                <Button title="Cancel" onPress={this.toggleUpdateModal} />
                                <Button title="Update" onPress={this.handleUpdateChatName} />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Floating Button */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.floatingButton}
                    onPress={this.toggleCreateModal}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    },
    updateButton: {
        backgroundColor: '#0084ff',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: '#0084ff',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginBottom: 10,
        alignSelf: 'flex-end'
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        color: '#444',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    errorContainer: {
        backgroundColor: '#F8D7DA',
        padding: 10,
        marginTop: 10,
        borderRadius: 5,
    }
});