import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Ensure this package is installed

const users = [
  { id: 1, name: "Arjun", profession: "Doctor", icon: "stethoscope" },
  { id: 2, name: "Sachive", profession: "Engineer", icon: "engine" },
  { id: 3, name: "Deena", profession: "Teacher", icon: "school" },
  { id: 4, name: "Aravind", profession: "Artist", icon: "palette" },
  { id: 5, name: "Rohan", profession: "Chef", icon: "chef-hat" },
  { id: 6, name: "Meera", profession: "Lawyer", icon: "scale-balance" },
  { id: 7, name: "Sanjay", profession: "Police Officer", icon: "police-badge" },
];

const Occupation = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [submittedData, setSubmittedData] = useState(null);

  const handleRequestPress = () => {
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (requestName.trim() === "" || requestDescription.trim() === "") {
      alert("Please fill out all fields.");
      return;
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString(); // Date & Time

    setSubmittedData({
      name: requestName,
      description: requestDescription,
      date: formattedDate,
    });

    // Clear form fields
    setRequestName("");
    setRequestDescription("");

    // Hide modal after submission
    setTimeout(() => {
      setModalVisible(false);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>PUBLIC USERS</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Icon
              name={item.icon}
              size={50}
              color="#545e75"
              style={styles.icon}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.profession}>{item.profession}</Text>
            </View>
            <TouchableOpacity
              style={styles.requestButton}
              onPress={handleRequestPress}
            >
              <Text style={styles.buttonText}>Request</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal for request form */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send a Request</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Request Name"
              value={requestName}
              onChangeText={setRequestName}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Request Description"
              value={requestDescription}
              onChangeText={setRequestDescription}
              multiline
            />
            <Button title="Submit" onPress={handleSubmit} />
            <Button
              title="Cancel"
              onPress={() => setModalVisible(false)}
              color="red"
            />
          </View>
        </View>
      </Modal>

      {/* Display submitted request (optional) */}
      {submittedData && (
        <View style={styles.submittedContainer}>
          <Text style={styles.submittedTitle}>Last Request Submitted:</Text>
          <Text style={styles.submittedText}>
            📌 Name: {submittedData.name}
          </Text>
          <Text style={styles.submittedText}>
            📝 Description: {submittedData.description}
          </Text>
          <Text style={styles.submittedText}>
            📅 Date & Time: {submittedData.date}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7ff", padding: 16 },
  header: { marginBottom: 20 },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#545e75",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    alignItems: "center",
  },
  icon: { marginRight: 16 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold", color: "#545e75" },
  profession: { fontSize: 14, color: "#666" },
  requestButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: { color: "white", fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: "100%",
  },
  submittedContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 3,
  },
  submittedTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  submittedText: { fontSize: 14, color: "#555" },
});

export default Occupation;
