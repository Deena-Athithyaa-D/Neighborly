import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import RequestBtn from "./RequestBtn";
const RequestForUser = () => {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];

  const [requests, setRequests] = useState([
    {
      id: 1,
      prodName: "Car",
      userName: "Arjun",
      caption: "The car is one of the best in the town",
      date: formattedDate,
      status: null,
      comment: "",
    },
    {
      id: 2,
      prodName: "Bike",
      userName: "Sachive",
      caption: "It is a very good bike",
      date: formattedDate,
      status: null,
      comment: "",
    },
    {
      id: 3,
      prodName: "Monitor",
      userName: "Deena",
      caption: "It is a very high speed working monitor",
      date: formattedDate,
      status: null,
      comment: "",
    },
    {
      id: 4,
      prodName: "Samsung Galaxy",
      userName: "Aravind",
      caption: "Best mobile for taking photos",
      date: formattedDate,
      status: null,
      comment: "",
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [decision, setDecision] = useState(null);

  const handleDecision = (id, decision, comment) => {
    if (!comment.trim()) {
      Alert.alert("Error", "Please add a comment before proceeding.");
      return;
    }
    setSelectedRequest(id);
    setDecision(decision);
    setConfirmationModalVisible(true);
  };

  const confirmDecision = () => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === selectedRequest
          ? { ...request, status: decision }
          : request
      )
    );
    setConfirmationModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>PRODUCTS AND SERVICES AVAILABLE!</Text>
      </View>
      {requests.map((item) => (
        <View key={item.id} style={styles.card}>
          <Image
            source={require("../assets/product.png")}
            style={styles.image}
          />
          <View style={styles.content}>
            <Text style={styles.prodName}>{item.prodName}</Text>
            <Text style={styles.caption}>{item.caption}</Text>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.date}>Posted On: {item.date}</Text>
            {item.status ? (
              <Text style={styles.statusText}>
                Status:{" "}
                {item.status === "allowed" ? "Accepted ✅" : "Denied ❌"}
              </Text>
            ) : (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Add comments..."
                  value={item.comment}
                  onChangeText={(text) =>
                    setRequests((prevRequests) =>
                      prevRequests.map((request) =>
                        request.id === item.id
                          ? { ...request, comment: text }
                          : request
                      )
                    )
                  }
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.allowButton}
                    onPress={() =>
                      handleDecision(item.id, "allowed", item.comment)
                    }
                  >
                    <Text style={styles.buttonText}>Allow</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.denyButton}
                    onPress={() =>
                      handleDecision(item.id, "denied", item.comment)
                    }
                  >
                    <Text style={styles.buttonText}>Deny</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      ))}

      {/* Confirmation Modal */}
      <Modal
        visible={confirmationModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Decision</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to {decision} this request?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmDecision}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setConfirmationModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <RequestBtn customStyle={styles.requestButton} />
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
    marginBottom: 16,
    elevation: 3,
  },
  image: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  content: { flex: 1 },
  prodName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#545e75",
    marginBottom: 6,
  },
  caption: { fontSize: 14, color: "#666", marginBottom: 8 },
  userName: { fontSize: 14, fontWeight: "bold", color: "#333" },
  date: { fontSize: 12, color: "#666" },
  statusText: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  input: {
    backgroundColor: "#f7f7ff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between" },
  allowButton: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  denyButton: {
    backgroundColor: "#dc3545",
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalMessage: { fontSize: 16, textAlign: "center", marginBottom: 20 },
  confirmButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  requestButton: {
    position: "absolute",
    bottom: 20, // Stick to bottom
    right: 20, // Stick to right
    zIndex: 10, // Ensure it stays above other components
  },
});

export default RequestForUser;
