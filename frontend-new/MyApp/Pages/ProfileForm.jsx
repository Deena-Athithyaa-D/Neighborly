import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

const ProfileForm = () => {
  const navigation = useNavigation();
  const [uuid, setUuid] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    pno: "",
    profession: "",
    user_code: uuidv4(), // generates a unique code
  });

  // Load UUID from SecureStore
  useEffect(() => {
    const fetchUUID = async () => {
      const storedUUID = await SecureStore.getItemAsync("uuid");
      if (storedUUID) setUuid(storedUUID);
      else Alert.alert("Error", "UUID not found in SecureStore.");
    };
    fetchUUID();
  }, []);

  const handleChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = async () => {
    const { name, email, age, pno, profession, user_code } = formData;

    if (!name || !email || !age || !pno || !profession) {
      Alert.alert("Validation Error", "All fields are required!");
      return;
    }

    const payload = {
      uuid,
      email,
      name,
      age: parseInt(age),
      pno,
      profession,
      user_code,
    };

    try {
      const response = await fetch(
        "https://neighborly-jek2.onrender.com/api/create_profile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Profile created successfully.");
        navigation.navigate("Communities");
      } else {
        console.log(data);
        Alert.alert("Error", data.detail || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Network Error", "Failed to connect to server.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Create Profile</Text>

        {["name", "email", "age", "pno", "profession"].map((key) => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={formData[key]}
            onChangeText={(text) => handleChange(key, text)}
            keyboardType={["age", "pno"].includes(key) ? "numeric" : "default"}
            autoCapitalize="none"
            autoCorrect={false}
          />
        ))}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProfileForm;
