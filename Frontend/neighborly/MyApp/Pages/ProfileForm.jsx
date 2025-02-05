import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
const ProfileForm = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    profession: "",
    pno: "",
  });

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = () => {
    const { name, email, age, profession, pno } = formData;
    if (!name || !email || !age || !profession || !pno) {
      Alert.alert("Error", "All fields are required!");
      return;
    }
    Alert.alert(
      "Success",
      `Profile Submitted:\nName: ${name}\nEmail: ${email}\nAge: ${age}\nProfession: ${profession}\nPhone: ${pno}`
    );
    navigation.navigate("Communities");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Profile Form</Text>
        {Object.keys(formData).map((key) => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={formData[key]}
            onChangeText={(text) => handleChange(key, text)}
            keyboardType={
              key === "age" || key === "pno" ? "numeric" : "default"
            }
          />
        ))}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProfileForm;
