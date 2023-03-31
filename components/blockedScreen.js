import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { getBlockedContacts, unblockContact } from '../services/contactRequests';


export default class BlockedScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            blockedContacts: [],
            session_token: '',
            isLoading: false,
            error: null,
        };
    }

    componentDidMount() {
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.getBlockedContacts();
        });
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    getBlockedContacts = async () => {
        try {
            const data = await getBlockedContacts();
            this.setState({ blockedContacts: data });
        } catch (error) {
            this.setState({ error: error.message });
        }
    };

    handleUnblock = async (user_id) => {
        try {
            await unblockContact(user_id);
            Alert.alert('Success', 'Contact unblocked successfully');
            this.getBlockedContacts();
        } catch (error) {
            console.error('Error unblocking contact', error);
            Alert.alert('Error', 'An error occurred while unblocking the contact. Please try again later.');
        }
    };

    renderItem = ({ item }) => {
        return (
            <View style={styles.blockedContactItem}>
                <Text style={styles.contactName}>{`${item.first_name} ${item.last_name}`}</Text>
                <TouchableOpacity onPress={() => this.handleUnblock(item.user_id)} style={styles.unblockButton}>
                    <Text style={styles.buttonText}>Unblock</Text>
                </TouchableOpacity>
            </View>
        );
    };

    render() {
        const { blockedContacts, isLoading, error } = this.state;

        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => this.props.navigation.goBack()}>
                        <Text>Back</Text>
                    </TouchableOpacity>
                    <Text>Blocked Contacts</Text>
                </View>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <FlatList
                        data={blockedContacts}
                        keyExtractor={(item) => item.user_id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.blockedContactItem}>
                                <Text style={styles.contactName}>{`${item.first_name} ${item.last_name}`}</Text>
                                <TouchableOpacity onPress={() => this.handleUnblock(item.user_id)} style={styles.unblockButton}>
                                    <Text style={styles.buttonText}>Unblock</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )}
                {error && <Text>{error}</Text>}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
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
    blockedContactItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    contactName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    unblockButton: {
        backgroundColor: '#f44336',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});