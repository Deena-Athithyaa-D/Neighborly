import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView, Text, StatusBar, StyleSheet, View, Button } from 'react-native';
import Communities from './Pages/Communities'; // Correct import without curly braces
import Home from './Pages/Home'; // Correct import without curly braces
import Availability from './Pages/Availability'; // Correct import without curly braces


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Communities" component={Communities} />
        <Stack.Screen name="Homes" component={Home}/>
        <Stack.Screen name="Availability" component={Availability}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Home screen component (initial screen shown on app load)
function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.innerContainer}>
        <Text style={styles.text}>Welcome to React Native with Expo and Tailwind!</Text>
        <Button
          title="Go to Communities" // Button text
          onPress={() => navigation.navigate('Communities')} // Navigate to Communities screen
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6', // equivalent to bg-blue-500 in Tailwind
  },
  innerContainer: {
    padding: 16, // equivalent to p-4 in Tailwind
  },
  text: {
    color: 'white',
    fontSize: 24, // equivalent to text-2xl in Tailwind
    fontWeight: 'bold', // equivalent to font-bold in Tailwind
  },
});
