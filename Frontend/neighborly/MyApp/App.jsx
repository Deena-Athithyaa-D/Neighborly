import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { TouchableOpacity, View, Text, Button } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";

import Auth from "./Pages/Auth";
import Communities from "./Pages/Communities";
import Home from "./Pages/Home";
import Availability from "./Pages/Availability";
import AvailabilityUpload from "./Pages/AvailabilityUpload";
import RequestForUser from "./Pages/RequestForUser";
import PublicRequests from "./Pages/PublicRequests";
import Ocupation from "./Pages/Ocupation";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Communities")}
            style={{ marginLeft: 15 }}
          >
            <Icon name="arrow-back" size={24} color="#6C63FF" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Availability"
        component={Availability}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="event-available" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AvailabilityUpload"
        component={AvailabilityUpload}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="upload" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="RequestForUser"
        component={RequestForUser}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="star" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PublicRequests"
        component={PublicRequests}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="settings" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Ocupation"
        component={Ocupation}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="person" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Stack Navigator (Before entering main app)
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen
          name="Auth"
          component={Auth}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Communities"
          component={Communities}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="HomeTabs"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Placeholder Screen for future pages
function PlaceholderScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Coming Soon!</Text>
    </View>
  );
}
