import React, { Component } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './components/homeScreen';
import ProfileScreen from './components/profileScreen';
import ContactsScreen from './components/contactsScreen';
import LoginScreen from './components/login';
import SignUp from './components/signUp';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Contacts" component={ContactsScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default class App extends Component{
  render(){
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Login'>
           <Stack.Screen name="Login" component={LoginScreen}/>
           <Stack.Screen name="SignUp" component={SignUp} />
           <Stack.Screen name="Home" component={MainTabs} />
         </Stack.Navigator>
      </NavigationContainer>
    )
  }
}
