import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialIcons";

// Screens
import Home from "./Pages/Home";
import Communities from "./Pages/Communities";
import JoinCommunities from "./Pages/JoinCommunities";
import ExchangeHub from "./Pages/ExchangeHub";
import Activity from "./Pages/Activity";
import Auth from "./Pages/Auth"; // Make sure this is using our manual auth0-service
import ProfileForm from "./Pages/ProfileForm";
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color }) => {
          let iconName;
          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Exchange":
              iconName = "swap-horiz";
              break;
            case "Activity":
              iconName = "notifications";
              break;
            default:
              iconName = "help";
          }
          return <Icon name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Exchange" component={ExchangeHub} />
      <Tab.Screen name="Activity" component={Activity} />
    </Tab.Navigator>
  );
}

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
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileForm}
          options={{ headerShown: false }}
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
