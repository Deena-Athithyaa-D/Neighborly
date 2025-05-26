import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialIcons";

import Home from "./Pages/Home";
import Communities from "./Pages/Communities";
import JoinCommunities from "./Pages/JoinCommunities";
import ExchangeHub from "./Pages/ExchangeHub";

import { View, Text } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Placeholder screen for Explore and Profile
function PlaceholderScreen({ route }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{route.name} - Coming Soon!</Text>
    </View>
  );
}

// Bottom tab content (excluding Communities)
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color }) => {
          let iconName = "home";
          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Explore":
              iconName = "search";
              break;
            case "Profile":
              iconName = "person";
              break;
            default:
              iconName = "home";
          }
          return <Icon name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Exchange" component={ExchangeHub} />
      <Tab.Screen name="Profile" component={PlaceholderScreen} />
      
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Communities">
        <Stack.Screen
          name="Communities"
          component={Communities}
          options={{ headerShown: false }} // First screen, no header needed
        />
        <Stack.Screen
          name="JoinCommunities"
          component={JoinCommunities}
          options={{ title: "Join Communities" }}
        />
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
