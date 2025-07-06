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
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

export default function ExchangeHub() {
  const [activeTab, setActiveTab] = useState("product");
  const [subactiveTab, setsubactiveTab] = useState("lend");
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequestItem, setSelectedRequestItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    user_id: "",
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
    const checkAuth = async () => {
      try {
        const uuid = await SecureStore.getItemAsync("uuid");
        if (!uuid) {
          navigation.navigate("Auth");
          return;
        }
        setUserId(uuid);
        setFormData(prev => ({...prev, user_id: uuid}));
      } catch (error) {
        console.error("Error checking auth:", error);
        navigation.navigate("Auth");
      }
    };

    checkAuth();
  }, [navigation]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [offersResponse, requestsResponse] = await Promise.all([
          fetch("https://34ed-171-79-48-24.ngrok-free.app/api/get_offers/1"),
          fetch("https://34ed-171-79-48-24.ngrok-free.app/api/view_public_requests/1")
        ]);

        if (!offersResponse.ok || !requestsResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const offersData = await offersResponse.json();
        const requestsData = await requestsResponse.json();

        setLend(offersData);
        setReq(requestsData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subactiveTab, userId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openNewModal = () => {
    if (!userId) {
      navigation.navigate("Login");
      return;
    }

    setSelectedRequestItem(null);
    setFormData({
      user_id: userId,
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
    if (!userId) {
      navigation.navigate("Login");
      return;
    }

    try {
      const submissionData = {
        user_id: userId,
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
          ? "https://34ed-171-79-48-24.ngrok-free.app/api/create_request"
          : "https://34ed-171-79-48-24.ngrok-free.app/api/create_offer";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to submit");

      Alert.alert("Success", `Request submitted successfully!`, [
        {
          text: "OK",
          onPress: () => {
            setFormData({
              user_id: userId,
              comm_id: "1",
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

  if (!userId) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  const filteredData = subactiveTab === "lend"
    ? lend.filter((item) => item.offer_type === activeTab)
    : req.filter((item) => item.request_type === activeTab);

  return (
    <View style={styles.container}>
      <View style={styles.pageTop}>
        <Pressable
          onPress={() => setActiveTab("product")}
          style={[
            styles.pageTopLeft,
            activeTab === "product" && styles.activeTab
          ]}
        >
          <Text style={styles.buttonText}>Product</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("service")}
          style={[
            styles.pageTopRight,
            activeTab === "service" && styles.activeTab
          ]}
        >
          <Text style={styles.buttonText}>Services</Text>
        </Pressable>
      </View>

      <View style={styles.subTab}>
        <Pressable
          onPress={() => setsubactiveTab("lend")}
          style={[
            styles.subButton,
            subactiveTab === "lend" && styles.activeSubTab
          ]}
        >
          <Text style={styles.subButtonText}>Lend</Text>
        </Pressable>
        <Pressable
          onPress={() => setsubactiveTab("request")}
          style={[
            styles.subButton,
            subactiveTab === "request" && styles.activeSubTab
          ]}
        >
          <Text style={styles.subButtonText}>Request</Text>
        </Pressable>
      </View>

      <View style={styles.contentBox}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#6C63FF" />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => {
                setsubactiveTab(subactiveTab);
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              No {subactiveTab === "lend" ? "offers" : "requests"} found
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
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
                          "https://34ed-171-79-48-24.ngrok-free.app/api/create_offer",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              user_id: userId,
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

                        const offer_id = offerData.id;

                        const updateRes = await fetch(
                          `https://34ed-171-79-48-24.ngrok-free.app/api/update_request_status/${
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
        )}
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#6C63FF",
  },
  pageTopLeft: {
    width: "50%",
    alignItems: "center",
    paddingBottom: 10,
  },
  pageTopRight: {
    width: "50%",
    alignItems: "center",
    paddingBottom: 10,
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
  activeSubTab: {
    backgroundColor: "#6C63FF",
  },
  subButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  contentBox: {
    paddingHorizontal: 20,
    marginTop: 10,
    flex: 1,
  },
  itemBox: {
    backgroundColor: "#e7fbe7",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  desc: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
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
    marginBottom: 20,
    textAlign: "center",
    color: "#4C3E99",
  },
  label: {
    marginTop: 10,
    fontWeight: "600",
    color: "#333",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  submitBtn: {
    backgroundColor: "#4caf50",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  cancelBtn: {
    backgroundColor: "#e53935",
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  submitText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#e53935",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#4C3E99",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#6C63FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});