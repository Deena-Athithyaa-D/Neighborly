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

const PublicRequests = () => {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];

  const [requests, setRequests] = useState([
    {
      id: 1,
      prodName: "Car",
      userName: "Arjun",
      caption: "Luxury car available for rent.",
      date: formattedDate,
      status: null,
      comment: "",
    },
    {
      id: 2,
      prodName: "Bike",
      userName: "Sachive",
      caption: "Sport bike in excellent condition.",
      date: formattedDate,
      status: null,
      comment: "",
    },
    {
      id: 3,
      prodName: "Monitor",
      userName: "Deena",
      caption: "Ultra HD monitor for sale.",
      date: formattedDate,
      status: null,
      comment: "",
    },
    {
      id: 4,
      prodName: "Smartphone",
      userName: "Aravind",
      caption: "Latest smartphone available.",
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
        <Text style={styles.headerText}>PUBLIC REQUESTS</Text>
        <Text style={styles.subText}>
          All available public product & service requests
        </Text>
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
            <Text style={styles.userName}>Requested by: {item.userName}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef7ff", padding: 16 },
  header: { marginBottom: 20, alignItems: "center" },
  headerText: { fontSize: 22, fontWeight: "bold", color: "#004aad" },
  subText: { fontSize: 14, color: "#555", textAlign: "center", marginTop: 5 },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 5,
  },
  image: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  content: { flex: 1 },
  prodName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#004aad",
    marginBottom: 6,
  },
  caption: { fontSize: 14, color: "#666", marginBottom: 8 },
  userName: { fontSize: 14, fontWeight: "bold", color: "#333" },
  date: { fontSize: 12, color: "#666" },
  statusText: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  input: {
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#004aad",
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
});

export default PublicRequests;
