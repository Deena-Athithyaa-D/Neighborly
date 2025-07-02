import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ExchangeHub() {
  const [activeTab, setActiveTab] = useState("product");
  const [subactiveTab, setsubactiveTab] = useState("lend");
  const [openModal, setOpenModal] = useState(false);

  const [formData, setFormData] = useState({
    user_id: "72ec87c9-eb03-44e7-853f-b4c774db0deb",
    comm_id: "2",
    offer_type: "product",
    title: "",
    description: "",
    fromDate: "",
    toDate: "",
    fromTime: "",
    toTime: "",
  });

  const [showDatePicker, setShowDatePicker] = useState({
    field: "",
    show: false,
    mode: "date",
  });

  const [req, setReq] = useState([]);
  const [lend, setLend] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await fetch(
          "https://69df-202-53-4-31.ngrok-free.app/api/get_offers/2"
        );
        const response = await data.json();
        setLend(response);
      } catch (err) {
        console.log(err);
      }
    };
    const fetchDetails1 = async () => {
      try {
        const data = await fetch(
          "https://69df-202-53-4-31.ngrok-free.app/api/view_public_requests/2"
        );
        const response = await data.json();
        setReq(response);
        console.log(response);
      } catch (err) {
        console.log(err);
      }
    };
    fetchDetails();
    fetchDetails1();
  }, [subactiveTab]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubmit = async () => {
    try {
      const submissionData = {
        user_id: formData.user_id,
        comm_id: formData.comm_id,
        title: formData.title,
        description: formData.description,
      };

      if (subactiveTab === "lend") {
        // For Offers model
        submissionData.offer_type = formData.offer_type;
      } else {
        // For Requests model
        submissionData.request_type = formData.offer_type;
        submissionData.from_date = formData.fromDate;
        submissionData.to_date = formData.toDate;
        submissionData.from_time = formData.fromTime;
        submissionData.to_time = formData.toTime;
      }

      const endpoint =
        subactiveTab === "lend"
          ? "https://69df-202-53-4-31.ngrok-free.app/api/create_offer"
          : "https://69df-202-53-4-31.ngrok-free.app/api/create_request";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit");
      }

      Alert.alert(
        "Success",
        `${
          subactiveTab === "lend" ? "Lending offer" : "Request"
        } submitted successfully!`,
        [
          {
            text: "OK",
            onPress: () => {
              setFormData({
                user_id: "72ec87c9-eb03-44e7-853f-b4c774db0deb",
                comm_id: "2",
                offer_type: "product",
                title: "",
                description: "",
                fromDate: "",
                toDate: "",
                fromTime: "",
                toTime: "",
              });
              setOpenModal(false);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };
  const handleCancel = () => {
    Alert.alert("Cancelled", "Successfully cancelled");
    setOpenModal(false);
  };

  const showPicker = (field, mode) => {
    setShowDatePicker({ field, show: true, mode });
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker({ ...showDatePicker, show: false });
    if (selectedDate) {
      const value =
        showDatePicker.mode === "date"
          ? selectedDate.toISOString().split("T")[0]
          : selectedDate.toTimeString().split(" ")[0].slice(0, 5);
      setFormData((prev) => ({ ...prev, [showDatePicker.field]: value }));
    }
  };

  return (
    <View>
      {/* Top Tabs */}
      <View style={styles.pageTop}>
        <Pressable
          onPress={() => setActiveTab("product")}
          style={styles.pageTopLeft}
        >
          <Text style={styles.buttonText}>Product</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("service")}
          style={styles.pageTopRight}
        >
          <Text style={styles.buttonText}>Services</Text>
        </Pressable>
      </View>

      {/* Sub Tabs */}
      <View style={styles.subTab}>
        <Pressable
          onPress={() => setsubactiveTab("lend")}
          style={styles.subButton}
        >
          <Text style={styles.subButtonText}>Lend</Text>
        </Pressable>
        <Pressable
          onPress={() => setsubactiveTab("request")}
          style={styles.subButton}
        >
          <Text style={styles.subButtonText}>Request</Text>
        </Pressable>
      </View>

      {/* Content List */}
      <View style={styles.contentBox}>
        <FlatList
          data={
            subactiveTab === "lend"
              ? lend.filter((item) => item.offer_type === activeTab)
              : req.filter((item) => item.request_type === activeTab)
          }
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemBox}>
              <Text style={styles.itemText}>{item.title}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              {subactiveTab === "request" && (
                <>
                  <Text style={styles.desc}>
                    From: {item.from_date} {item.from_time}
                  </Text>
                  <Text style={styles.desc}>
                    To: {item.to_date} {item.to_time}
                  </Text>
                </>
              )}
            </View>
          )}
        />
      </View>

      {/* Add Button */}
      <Pressable style={styles.addButton} onPress={() => setOpenModal(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>

      {/* Modal */}
      <Modal visible={openModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {subactiveTab === "lend" ? "Create an Offer" : "Make a Request"}
            </Text>

            <Text style={styles.label}>Type:</Text>
            <View style={styles.row}>
              <Pressable
                onPress={() => handleChange("offer_type", "product")}
                style={styles.option}
              >
                <Text>
                  {formData.offer_type === "product" ? "[Product]" : "Product"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleChange("offer_type", "service")}
                style={[styles.option, { marginLeft: 20 }]}
              >
                <Text>
                  {formData.offer_type === "service" ? "[Service]" : "Service"}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Title:</Text>
            <TextInput
              value={formData.title}
              onChangeText={(text) => handleChange("title", text)}
              placeholder="Enter title"
              style={styles.input}
            />

            <Text style={styles.label}>Description:</Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) => handleChange("description", text)}
              placeholder="Enter description"
              style={styles.input}
            />

            {subactiveTab === "request" && (
              <>
                <Text style={styles.label}>From Date:</Text>
                <Pressable
                  onPress={() => showPicker("fromDate", "date")}
                  style={styles.input}
                >
                  <Text>{formData.fromDate || "Select Date"}</Text>
                </Pressable>

                <Text style={styles.label}>To Date:</Text>
                <Pressable
                  onPress={() => showPicker("toDate", "date")}
                  style={styles.input}
                >
                  <Text>{formData.toDate || "Select Date"}</Text>
                </Pressable>

                <Text style={styles.label}>From Time:</Text>
                <Pressable
                  onPress={() => showPicker("fromTime", "time")}
                  style={styles.input}
                >
                  <Text>{formData.fromTime || "Select Time"}</Text>
                </Pressable>

                <Text style={styles.label}>To Time:</Text>
                <Pressable
                  onPress={() => showPicker("toTime", "time")}
                  style={styles.input}
                >
                  <Text>{formData.toTime || "Select Time"}</Text>
                </Pressable>
              </>
            )}

            <View style={styles.row}>
              <Pressable style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitText}>Submit</Text>
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {showDatePicker.show && (
        <DateTimePicker
          value={new Date()}
          mode={showDatePicker.mode}
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pageTop: {
    flexDirection: "row",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  pageTopLeft: {
    width: "50%",
    alignItems: "center",
  },
  pageTopRight: {
    width: "50%",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  subTab: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#f8f8f8",
  },
  subButton: {
    marginHorizontal: 10,
    backgroundColor: "#d0f0ff",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  subButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  contentBox: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  itemBox: {
    backgroundColor: "#e7fbe7",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
  },
  desc: {
    fontSize: 14,
    color: "#333",
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#1e88e5",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  addButtonText: {
    fontSize: 30,
    color: "white",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    marginTop: 10,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
  },
  row: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between",
  },
  option: {
    borderWidth: 1,
    padding: 6,
    borderRadius: 6,
    borderColor: "#aaa",
  },
  submitBtn: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
  },
  cancelBtn: {
    backgroundColor: "#e53935",
    padding: 10,
    borderRadius: 6,
    flex: 1,
  },
  submitText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  cancelText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
});
