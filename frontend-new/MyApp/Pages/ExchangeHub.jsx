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
  Animated,
  Easing,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

export default function ExchangeHub() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("product");
  const [subactiveTab, setsubactiveTab] = useState("lend");
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequestItem, setSelectedRequestItem] = useState(null);
  const [userId, setUserId] = useState(null);
  const [commId, setCommId] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const [formData, setFormData] = useState({
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
    const init = async () => {
      try {
        const storedUuid = await SecureStore.getItemAsync("uuid");
        const storedCommId = await SecureStore.getItemAsync("comm_id");

        if (!storedUuid || !storedCommId) {
          Alert.alert("Session Expired", "Please log in again");
          navigation.navigate("Auth");
          return;
        }

        setUserId(storedUuid);
        setCommId(storedCommId);
        fetchData(storedCommId);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.out(Easing.back(2)),
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error) {
        console.error("Initialization error:", error);
        Alert.alert("Error", "Failed to initialize. Please try again.");
        navigation.navigate("Auth");
      }
    };

    init();
  }, []);

  const fetchData = async (communityId) => {
    try {
      const offersRes = await fetch(
        `https://neighborly-jek2.onrender.com/api/get_offers/${communityId}`
      );
      if (!offersRes.ok) throw new Error("Failed to fetch offers");
      const offersData = await offersRes.json();
      setLend(offersData);

      const requestsRes = await fetch(
        `https://neighborly-jek2.onrender.com/api/view_public_requests/${communityId}`
      );
      if (!requestsRes.ok) throw new Error("Failed to fetch requests");
      const requestsData = await requestsRes.json();
      setReq(requestsData);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch data");
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openNewModal = () => {
    setSelectedRequestItem(null);
    setFormData({
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
      if (!userId || !commId) {
        throw new Error("User session expired. Please log in again.");
      }

      const submissionData = {
        user_id: userId,
        comm_id: commId,
        title: formData.title,
        description: formData.description,
      };

      if (selectedRequestItem) {
        submissionData.request_type = activeTab;
        submissionData.from_date = formData.fromDate;
        submissionData.to_date = formData.toDate;
        submissionData.from_time = formData.fromTime;
        submissionData.to_time = formData.toTime;
        submissionData.offer_id = selectedRequestItem.id;
      } else if (subactiveTab === "lend") {
        submissionData.offer_type = activeTab;
      } else {
        submissionData.request_type = activeTab;
        submissionData.from_date = formData.fromDate;
        submissionData.to_date = formData.toDate;
        submissionData.from_time = formData.fromTime;
        submissionData.to_time = formData.toTime;
      }

      const endpoint =
        selectedRequestItem || subactiveTab === "request"
          ? "https://neighborly-jek2.onrender.com/api/create_request"
          : "https://neighborly-jek2.onrender.com/api/create_offer";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to submit");

      Alert.alert("Success", "Request submitted successfully!", [
        {
          text: "OK",
          onPress: () => {
            setFormData({
              title: "",
              description: "",
              fromDate: "",
              toDate: "",
              fromTime: "",
              toTime: "",
            });
            setSelectedRequestItem(null);
            setOpenModal(false);
            fetchData(commId);
          },
        },
      ]);
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  const handleLend = async (item) => {
    try {
      if (!userId || !commId) {
        throw new Error("User session expired. Please log in again.");
      }

      const offerRes = await fetch(
        "https://neighborly-jek2.onrender.com/api/create_offer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            comm_id: commId,
            offer_type: item.request_type,
            title: item.title,
            description: item.description,
          }),
        }
      );

      const offerData = await offerRes.json();

      if (!offerRes.ok) {
        throw new Error(offerData.message || "Failed to create offer");
      }

      const offer_id = offerData.id;

      const updateRes = await fetch(
        `https://neighborly-jek2.onrender.com/api/update_request_status/${item.id}/2/${offer_id}`,
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

      Alert.alert("Success", "Lend offer sent and status updated!");
      fetchData(commId);
    } catch (error) {
      console.error("Lend error:", error);
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

  const renderItem = ({ item }) => (
    <Animated.View
      style={[
        styles.itemBox,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.itemContent}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {item.offer_type || item.request_type}
          </Text>
        </View>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
      </View>

      {subactiveTab === "lend" ? (
        <Pressable
          style={styles.actionButton}
          onPress={() => {
            setSelectedRequestItem(item);
            setFormData({
              title: item.title,
              description: item.description,
            });
            setOpenModal(true);
          }}
        >
          <Text style={styles.actionButtonText}>Request</Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.actionButton, styles.lendButton]}
          onPress={() => handleLend(item)}
        >
          <Text style={styles.actionButtonText}>Lend</Text>
        </Pressable>
      )}
    </Animated.View>
  );
  return (
    <View style={styles.container}>
      {/* Header Tabs */}
      <View style={styles.headerTabs}>
        <Pressable
          style={[
            styles.headerTab,
            activeTab === "product" && styles.activeHeaderTab,
          ]}
          onPress={() => setActiveTab("product")}
        >
          <Text
            style={[
              styles.headerTabText,
              activeTab === "product" && styles.activeHeaderTabText,
            ]}
          >
            Products
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.headerTab,
            activeTab === "service" && styles.activeHeaderTab,
          ]}
          onPress={() => setActiveTab("service")}
        >
          <Text
            style={[
              styles.headerTabText,
              activeTab === "service" && styles.activeHeaderTabText,
            ]}
          >
            Services
          </Text>
        </Pressable>
      </View>

      {/* Sub Tabs */}
      <View style={styles.subTabs}>
        <Pressable
          style={[
            styles.subTab,
            subactiveTab === "lend" && styles.activeSubTab,
          ]}
          onPress={() => setsubactiveTab("lend")}
        >
          <Text
            style={[
              styles.subTabText,
              subactiveTab === "lend" && styles.activeSubTabText,
            ]}
          >
            Lend/Offer
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.subTab,
            subactiveTab === "request" && styles.activeSubTab,
          ]}
          onPress={() => setsubactiveTab("request")}
        >
          <Text
            style={[
              styles.subTabText,
              subactiveTab === "request" && styles.activeSubTabText,
            ]}
          >
            Request
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <FlatList
        data={
          subactiveTab === "lend"
            ? lend.filter((item) => item.offer_type === activeTab)
            : req.filter((item) => item.request_type === activeTab)
        }
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>
              No {subactiveTab === "lend" ? "offers" : "requests"} found
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      <Pressable style={styles.addButton} onPress={openNewModal}>
        <Ionicons name="add" size={32} color="white" />
      </Pressable>

      {/* Modal */}
      <Modal visible={openModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {selectedRequestItem
                ? `Request: ${selectedRequestItem.title}`
                : subactiveTab === "lend"
                ? "Create an Offer"
                : "Make a Request"}
            </Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              value={formData.title}
              onChangeText={(text) => handleChange("title", text)}
              placeholder="Enter title"
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) => handleChange("description", text)}
              placeholder="Enter description"
              style={[styles.input, styles.multilineInput]}
              multiline
              numberOfLines={3}
              placeholderTextColor="#9ca3af"
            />

            {(subactiveTab === "request" || selectedRequestItem) && (
              <>
                <Text style={styles.label}>From Date</Text>
                <Pressable
                  onPress={() => showPicker("fromDate", "date")}
                  style={styles.input}
                >
                  <Text style={formData.fromDate ? {} : { color: "#9ca3af" }}>
                    {formData.fromDate || "Select Date"}
                  </Text>
                </Pressable>

                <Text style={styles.label}>To Date</Text>
                <Pressable
                  onPress={() => showPicker("toDate", "date")}
                  style={styles.input}
                >
                  <Text style={formData.toDate ? {} : { color: "#9ca3af" }}>
                    {formData.toDate || "Select Date"}
                  </Text>
                </Pressable>

                <Text style={styles.label}>From Time</Text>
                <Pressable
                  onPress={() => showPicker("fromTime", "time")}
                  style={styles.input}
                >
                  <Text style={formData.fromTime ? {} : { color: "#9ca3af" }}>
                    {formData.fromTime || "Select Time"}
                  </Text>
                </Pressable>

                <Text style={styles.label}>To Time</Text>
                <Pressable
                  onPress={() => showPicker("toTime", "time")}
                  style={styles.input}
                >
                  <Text style={formData.toTime ? {} : { color: "#9ca3af" }}>
                    {formData.toTime || "Select Time"}
                  </Text>
                </Pressable>
              </>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
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
    backgroundColor: "#f9fafb",
  },
  headerTabs: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activeHeaderTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#6366f1",
  },
  headerTabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeHeaderTabText: {
    color: "#6366f1",
  },
  subTabs: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  subTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeSubTab: {
    backgroundColor: "#e0e7ff",
  },
  subTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeSubTabText: {
    color: "#4f46e5",
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemBox: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemContent: {
    marginBottom: 12,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4f46e5",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-end",
  },
  lendButton: {
    backgroundColor: "#10b981",
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    color: "#9ca3af",
    marginTop: 16,
    fontSize: 16,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#6366f1",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    color: "#111827",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: "#6366f1",
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "600",
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
