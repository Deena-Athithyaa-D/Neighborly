// ExchangeHub.js
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
  const [selectedRequestItem, setSelectedRequestItem] = useState(null);

  const [formData, setFormData] = useState({
    user_id: "1959af06-26aa-4d18-b5af-96330b2497fa",
    comm_id: "1",
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
          "https://9664-202-53-4-31.ngrok-free.app//api/get_offers/1"
        );
        const response = await data.json();
        setLend(response);
        console.log(response);
      } catch (err) {
        console.log(err);
      }
    };
    const fetchDetails1 = async () => {
      try {
        const data = await fetch(
          "https://9664-202-53-4-31.ngrok-free.app//api/view_public_requests/1"
        );
        const response = await data.json();
        setReq(response);
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

  const openNewModal = () => {
    setSelectedRequestItem(null);
    setFormData({
      user_id: "1959af06-26aa-4d18-b5af-96330b2497fa",
      comm_id: "1",
      offer_type: activeTab,
      title: "",
      description: "",
      fromDate: "",
      toDate: "",
      fromTime: "",
      toTime: "",
    });
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      const submissionData = {
        user_id: formData.user_id,
        comm_id: formData.comm_id,
        title: formData.title,
        description: formData.description,
      };

      if (selectedRequestItem) {
        submissionData.request_type = formData.offer_type;
        submissionData.from_date = formData.fromDate;
        submissionData.to_date = formData.toDate;
        submissionData.from_time = formData.fromTime;
        submissionData.to_time = formData.toTime;
        submissionData.offer_id = selectedRequestItem.id;
        submissionData.user_name = selectedRequestItem.user_name;
      } else if (subactiveTab === "lend") {
        submissionData.offer_type = formData.offer_type;
      } else {
        submissionData.request_type = formData.offer_type;
        submissionData.from_date = formData.fromDate;
        submissionData.to_date = formData.toDate;
        submissionData.from_time = formData.fromTime;
        submissionData.to_time = formData.toTime;
      }

      const endpoint =
        selectedRequestItem || subactiveTab === "request"
          ? "https://9664-202-53-4-31.ngrok-free.app//api/create_request"
          : "https://9664-202-53-4-31.ngrok-free.app//api/create_offer";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });
      console.log(JSON.stringify(submissionData));
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to submit");

      Alert.alert("Success", `Request submitted successfully!`, [
        {
          text: "OK",
          onPress: () => {
            setFormData({
              user_id: "1959af06-26aa-4d18-b5af-96330b2497fa",
              comm_id: "2",
              offer_type: "product",
              title: "",
              description: "",
              fromDate: "",
              toDate: "",
              fromTime: "",
              toTime: "",
            });
            setSelectedRequestItem(null);
            setOpenModal(false);
          },
        },
      ]);
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  const handleCancel = () => {
    setOpenModal(false);
    setSelectedRequestItem(null);
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

              {subactiveTab === "lend" && (
                <Pressable
                  style={styles.requestBtn}
                  onPress={() => {
                    setSelectedRequestItem(item);
                    setFormData({
                      ...formData,
                      title: item.title,
                      description: item.description,
                      offer_type: item.offer_type || item.request_type,
                      offer_id: item.id,
                    });
                    setOpenModal(true);
                  }}
                >
                  <Text style={styles.requestBtnText}>Request</Text>
                </Pressable>
              )}

              {subactiveTab === "request" && (
                <Pressable
                  style={styles.requestBtn}
                  onPress={async () => {
                    try {
                      const offerRes = await fetch(
                        "https://9664-202-53-4-31.ngrok-free.app/api/create_offer",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            user_id: "1959af06-26aa-4d18-b5af-96330b2497fa",
                            comm_id: "1",
                            offer_type: item.request_type,
                            title: item.title,
                            description: item.description,
                          }),
                        }
                      );

                      const offerData = await offerRes.json();

                      if (!offerRes.ok) {
                        throw new Error(
                          offerData.message || "Failed to create offer"
                        );
                      }

                      const offer_id = offerData.id; // Make sure your API returns this in response

                      const updateRes = await fetch(
                        `https://9664-202-53-4-31.ngrok-free.app/api/update_request_status/${
                          item.id
                        }/2/${parseInt(offer_id)}`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }
                      );

                      if (!updateRes.ok) {
                        throw new Error("Failed to update request status");
                      }

                      Alert.alert(
                        "Success",
                        "Lend offer sent and status updated!"
                      );
                    } catch (error) {
                      console.error("Lend error:", error);
                      Alert.alert(
                        "Error",
                        error.message || "Something went wrong"
                      );
                    }
                  }}
                >
                  <Text style={styles.requestBtnText}>Lend</Text>
                </Pressable>
              )}
            </View>
          )}
        />
      </View>

      <Pressable style={styles.addButton} onPress={openNewModal}>
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>

      <Modal visible={openModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedRequestItem
                ? `Request: ${selectedRequestItem.title}`
                : subactiveTab === "lend"
                ? "Create an Offer"
                : "Make a Request"}
            </Text>

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

            {(subactiveTab === "request" || selectedRequestItem) && (
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
  requestBtn: {
    backgroundColor: "#2979ff",
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  requestBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "500",
  },
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
