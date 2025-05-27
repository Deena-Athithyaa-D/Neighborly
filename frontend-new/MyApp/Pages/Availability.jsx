import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Alert } from "react-native";
import { Menu, TextInput } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import RequestBtn from "./RequestBtn";
const AvailabilityPage = () => {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const detailsArray = [
    {
      id: 1,
      prodName: "Car",
      userName: "Arjun",
      caption: "The car is one of the best in the town",
      date: formattedDate,
    },
    {
      id: 2,
      prodName: "Bike",
      userName: "Sachive",
      caption: "It is a very good bike",
      date: formattedDate,
    },
    {
      id: 3,
      prodName: "Monitor",
      userName: "Deena",
      caption: "It is a very high speed working monitor",
      date: formattedDate,
    },
    {
      id: 4,
      prodName: "Samsung Galaxy",
      userName: "Aravind",
      caption: "Best mobile for taking photos",
      date: formattedDate,
    },
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [time, setTime] = useState("");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState("from"); // To track which picker is active

  // Show date picker
  const showDatePicker = (type) => {
    setPickerType(type);
    setDatePickerVisible(true);
  };

  // Hide date picker
  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  // Handle date selection
  const handleDateConfirm = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    if (pickerType === "from") {
      setFromDate(formattedDate);
    } else {
      setToDate(formattedDate);
    }
    hideDatePicker();
  };

  // Show time picker
  const showTimePicker = () => {
    setTimePickerVisible(true);
  };

  // Hide time picker
  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };

  // Handle time selection
  const handleTimeConfirm = (time) => {
    const formattedTime = time.toTimeString().split(" ")[0].slice(0, 5); // Format as HH:MM
    setTime(formattedTime);
    hideTimePicker();
  };

  const handleRequest = () => {
    if (!fromDate || !toDate || !time) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    console.log("Request Details:", {
      item: selectedItem,
      fromDate,
      toDate,
      time,
    });

    // Close the input modal and show the success modal
    setModalVisible(false);
    setSuccessModalVisible(true);
    setFromDate("");
    setToDate("");
    setTime("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>PRODUCTS AND SERVICES AVAILABLE!</Text>
      </View>
      <View style={styles.listContainer}>
        {detailsArray.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image
              source={require("../assets/product.png")}
              style={styles.image}
            />
            <View style={styles.content}>
              <Text style={styles.prodName}>{item.prodName}</Text>
              <Text style={styles.caption}>{item.caption}</Text>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.userName}</Text>
                <Text style={styles.date}>
                  <Text style={styles.postedOn}>Posted On: </Text>
                  {item.date}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.requestButton}
              onPress={() => {
                setSelectedItem(item);
                setModalVisible(true);
              }}
            >
              <Text style={styles.requestButtonText}>Request</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Input Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Request</Text>

            {/* From Date */}
            <TouchableOpacity onPress={() => showDatePicker("from")}>
              <TextInput
                label="From Date"
                value={fromDate}
                editable={false}
                style={styles.input}
                right={<TextInput.Icon name="calendar" />}
              />
            </TouchableOpacity>

            {/* To Date */}
            <TouchableOpacity onPress={() => showDatePicker("to")}>
              <TextInput
                label="To Date"
                value={toDate}
                editable={false}
                style={styles.input}
                right={<TextInput.Icon name="calendar" />}
              />
            </TouchableOpacity>

            {/* Time */}
            <TouchableOpacity onPress={showTimePicker}>
              <TextInput
                label="Time"
                value={time}
                editable={false}
                style={styles.input}
                right={<TextInput.Icon name="clock" />}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sendButton} onPress={handleRequest}>
              <Text style={styles.sendButtonText}>Send Request</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />

      {/* Time Picker */}
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={hideTimePicker}
      />

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.successMessage}>Your request has been sent successfully.</Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <RequestBtn customStyle={styles.requestButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7ff",
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#545e75",
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  prodName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#545e75",
    marginBottom: 6,
  },
  caption: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#545e75",
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  requestButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#f7f7ff",
    borderRadius: 8,
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: "#545e75",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#545e75",
    fontSize: 16,
    fontWeight: "bold",
  },
  successMessage: {
    fontSize: 16,
    color: "#545e75",
    textAlign: "center",
    marginBottom: 20,
  },
  requestButton: {
    position: "absolute",
    bottom: 20, // Stick to bottom
    right: 20, // Stick to right
    zIndex: 10, // Ensure it stays above other components
  },
});

export default AvailabilityPage;