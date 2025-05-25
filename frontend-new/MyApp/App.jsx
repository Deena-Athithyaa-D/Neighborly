import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";

// Import your actual Home page
import Home from "./Pages/Home";

import { View, Text } from "react-native";

const Tab = createBottomTabNavigator();

// Placeholder screen for other tabs
function PlaceholderScreen({ route }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{route.name} - Coming Soon!</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
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
        <Tab.Screen name="Explore" component={PlaceholderScreen} />
        <Tab.Screen name="Profile" component={PlaceholderScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
