import React, { Component } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


import LoginScreen from './components/login';
import SignUp from './components/signUp';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
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
           <Stack.Screen name="Main" component={MainTabs} />
         </Stack.Navigator>
      </NavigationContainer>
    )
  }
}
