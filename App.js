import React, { Component } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ChatScreen from './components/chatScreen';
import HomeScreen from './components/homeScreen';
import ProfileScreen from './components/profileScreen';
import ContactsScreen from './components/contactsScreen';
import BlockedScreen from './components/blockedScreen';
import LoginScreen from './components/login';
import SignUp from './components/signUp';
import Camera from './components/cameraSendToServer';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ProfileStack() {
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Camera" component={Camera} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false, headerLeft: null }} />
    </Stack.Navigator>

  )
}

function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function ContactsStack() {
  return (
    <Stack.Navigator initialRouteName="Contacts">
      <Stack.Screen name="Contacts" component={ContactsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Blocked" component={BlockedScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeStack}  />
      <Tab.Screen name="Profile" component={ProfileStack} />
      <Tab.Screen name="Contacts" component={ContactsStack} />
    </Tab.Navigator>
  );
}

export default class App extends Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Login'>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false, headerLeft: null }} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
}
