// import { StatusBar } from 'expo-status-bar';
// import React from 'react';
// import { StyleSheet, Text, View } from 'react-native';
//
// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.tsx to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Button, TouchableOpacity, View, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Audio } from 'expo-av';
import * as mm from 'music-metadata-browser';
import util from 'util';
import ipfs from 'ipfs';
//import './shim.js';
//import crypto from 'crypto';

var url = 'https://ipfs.io/ipfs/Qme64zZbcvuXMHnF5nqLmqCN3BBmaPeSu1XBZNbrLbywz3?filename=Amatory_-_Dyshi_so_mnojj_47956889.mp3'
//import Stream from 'stream-browserify'
//import crypto from "react-native-crypto";
//import safeCrypto from "react-native-fast-crypto";
//import { asyncRandomBytes } from "react-native-secure-randombytes";

//window.randomBytes = asyncRandomBytes;
//window.scryptsy = safeCrypto.scrypt;

const soundObject = new Audio.Sound(); //Объект музыки и его функции mp(MusicPlayer)

async function mpPlay(url) {
  await soundObject.loadAsync(url);
  await soundObject.setIsLoopingAsync(true)
  await soundObject.playAsync();
}

async function mpStop() {
  try {
    await soundObject.stopAsync()
    await soundObject.unloadAsync()
  }
  catch(err){
    //result = err.Message;
  }


}

async function mpPause() {
  await soundObject.pauseAsync()
}



function HomeScreen() { //Главный экран
  async function next(){
      mpStop()
      //setMD(util.inspect(await mm.fetchFromUrl(url))))
      mm.fetchFromUrl(url).then(metadata => {
          var md = metadata.common.title + ' \n' + metadata.common.artist + ' \n' + metadata.common.album + ' \n' + metadata.common.year //title, artist, album, year
          setMD(md)
      })
      mpPlay(url)

  }
  const [metadata, setMD] = useState(0);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#0C0C0D",}}>
      <Text style={{color: "#D0D0D0",}}>{metadata}</Text>
      <Button title="Add Song"></Button>
      <Button title="Next" onPress={async () => next()}></Button>
    </View>
  );
}

function IPFSScreen() { //Экран IPFS
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#0C0C0D",}}>
      <Text style={{color: "#D0D0D0",}}>Settings!</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() { //App
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === 'Songs') {
              return (
                <Ionicons
                  name={
                    focused
                      ? 'ios-information-circle'
                      : 'ios-information-circle-outline'
                  }
                  size={size}
                  color={color}
                />
              );
            } else if (route.name === 'IPFS') {
              return (
                <Ionicons
                  name={focused ? 'ios-list-box' : 'ios-list'}
                  size={size}
                  color={color}
                />
              );
            }
          },
        })}
        tabBarOptions={{
          activeTintColor: '#4080FB',
          inactiveTintColor: '#D0D0D0',
          activeBackgroundColor: '#0C0C0D',
          inactiveBackgroundColor: '#0C0C0D',
        }}
      >
        <Tab.Screen name="Songs" component={HomeScreen} options={{  }} />
        {/* tabBarBadge: 3 */}
        <Tab.Screen name="IPFS" component={IPFSScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
