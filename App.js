import React, { Component } from 'react';
import { View, Text } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import LoginScreen from './components/login';
// import SignUp from './components/signUp';

const Stack = createNativeStackNavigator();

export default class App extends Component{
  render(){
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Login'>
           <Stack.Screen name="Login" component={LoginScreen}/>
           {/* <Stack.Screen name="SignUp" component={SignUp} /> */}
         </Stack.Navigator>
      </NavigationContainer>
    )
  }
}
