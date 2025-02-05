import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoIKRndVoR7-SgtfO2KJrxpTGytFs2n00",
  authDomain: "neighborly-71fa4.firebaseapp.com",
  projectId: "neighborly-71fa4",
  storageBucket: "neighborly-71fa4.firebasestorage.app",
  messagingSenderId: "903702994484",
  appId: "1:903702994484:web:f1a24f0798f4774b783461",
  measurementId: "G-56945MYLW9",
};

// Initialize Firebase
initializeApp(firebaseConfig);

const auth = getAuth(); // Firebase Auth instance

export default function Auth({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true); // Toggle between SignUp and SignIn
  const [loading, setLoading] = useState(false);

  // Listen to the authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace("Profile"); // Navigate to Profile if user is authenticated
      }
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, [navigation]);

  // Sign-up function
  const handleSignUp = async () => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "User signed up successfully!");
      navigation.replace("Profile");
    } catch (error) {
      const errorMessage = error.message;
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sign-in function
  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "User signed in successfully!");
      navigation.replace("Profile");
    } catch (error) {
      const errorMessage = error.message;
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? "Sign Up" : "Sign In"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      <TouchableOpacity
        onPress={isSignUp ? handleSignUp : handleSignIn}
        style={styles.button}
        disabled={loading} // Disable button when loading
      >
        <Text style={styles.buttonText}>{loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsSignUp(!isSignUp)}
        style={styles.toggleButton}
      >
        <Text style={styles.toggleButtonText}>
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  toggleButton: {
    marginTop: 10,
  },
  toggleButtonText: {
    color: "#007BFF",
    fontSize: 14,
  },
};
