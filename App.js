import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import LoginScreen from './components/login';


export default class App extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return (
      <View style={styles.container}>
        <LoginScreen />
      </View>
      // <FlatListDemo />
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