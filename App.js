import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import LoginScreen from './components/login';
import SignUp from './components/signUp';

export default class App extends Component {
  constructor(props){
    super(props);//comment
  }

  render(){
    return (
      <View style={styles.container}>
        {/* <LoginScreen /> */}
        <SignUp />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});