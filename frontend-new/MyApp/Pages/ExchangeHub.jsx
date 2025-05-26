import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Easing,
  TextInput,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const ExchangeHub = ({ userId, communityId }) => {
  // State management
  const [activeTab, setActiveTab] = useState("products");
  const [activeSubTab, setActiveSubTab] = useState("lend");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [requestsData, setRequestsData] = useState([]);
  const [offersData, setOffersData] = useState([]);

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());

  // Form data structure matching your Django models
  const [formData, setFormData] = useState({
    request_type: activeTab === "products" ? "product" : "service",
    title: "",
    description: "",
    from_date: "",
    to_date: "",
    from_time: "",
    to_time: "",
    user_id: userId,
    comm_id: communityId,
  });

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(100);

  // Load dummy data
  useEffect(() => {
    // Simulate loading profiles
    const dummyProfiles = [
      {
        uuid: "1",
        email: "john@example.com",
        name: "John Doe",
        age: 32,
        pno: "1234567890",
        profession: "Software Engineer",
        user_code: "JD001",
      },
      {
        uuid: "2",
        email: "sarah@example.com",
        name: "Sarah Smith",
        age: 28,
        pno: "9876543210",
        profession: "Teacher",
        user_code: "SS002",
      },
      {
        uuid: "3",
        email: "mike@example.com",
        name: "Mike Johnson",
        age: 45,
        pno: "5551234567",
        profession: "Plumber",
        user_code: "MJ003",
      },
    ];

    // Initial dummy requests data
    const initialRequests = [
      {
        id: "1",
        request_type: "product",
        title: "Power Drill",
        description: "Need for a small home project",
        from_date: "2023-06-15",
        to_date: "2023-06-20",
        from_time: "10:00",
        to_time: "18:00",
        user_id: "1",
        comm_id: "1",
        provider_id: null,
      },
      {
        id: "2",
        request_type: "product",
        title: "Ladder",
        description: "Painting my living room",
        from_date: "2023-06-18",
        to_date: "2023-06-19",
        from_time: "09:00",
        to_time: "17:00",
        user_id: "2",
        comm_id: "1",
        provider_id: null,
      },
      {
        id: "3",
        request_type: "service",
        title: "Plumbing Help",
        description: "Fixing a leaky faucet",
        from_date: "2023-06-16",
        to_date: "2023-06-16",
        from_time: "14:00",
        to_time: "16:00",
        user_id: "3",
        comm_id: "1",
        provider_id: null,
      },
    ];

    // Initial dummy offers data
    const initialOffers = [
      {
        id: "1",
        offer_type: "product",
        title: "Lawn Mower",
        description: "Available for community use",
        user_id: "1",
        comm_id: "1",
      },
      {
        id: "2",
        offer_type: "service",
        title: "Babysitting",
        description: "Available on weekends",
        user_id: "2",
        comm_id: "1",
      },
    ];

    setProfiles(dummyProfiles);
    setRequestsData(initialRequests);
    setOffersData(initialOffers);
  }, []);

  // Filter data based on current tabs
  const getFilteredData = () => {
    const type = activeTab === "products" ? "product" : "service";

    if (activeSubTab === "lend") {
      return requestsData
        .filter((request) => request.request_type === type)
        .map((request) => ({
          ...request,
          user_name:
            profiles.find((p) => p.uuid === request.user_id)?.name || "Unknown",
        }));
    } else {
      return offersData
        .filter((offer) => offer.offer_type === type)
        .map((offer) => ({
          ...offer,
          user_name:
            profiles.find((p) => p.uuid === offer.user_id)?.name || "Unknown",
        }));
    }
  };

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  // Format time to HH:MM
  const formatTime = (date) => {
    const d = new Date(date);
    let hours = "" + d.getHours();
    let minutes = "" + d.getMinutes();

    if (hours.length < 2) hours = "0" + hours;
    if (minutes.length < 2) minutes = "0" + minutes;

    return [hours, minutes].join(":");
  };

  // Handle date/time picker changes
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(null);
    if (selectedDate) {
      const field = showDatePicker;
      if (field.includes("date")) {
        setFormData({
          ...formData,
          [field]: formatDate(selectedDate),
        });
      } else {
        setFormData({
          ...formData,
          [field]: formatTime(selectedDate),
        });
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.length > 100) {
      errors.title = "Title must be less than 100 characters";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    if (activeSubTab === "lend") {
      if (!formData.from_date) errors.from_date = "Start date is required";
      if (!formData.to_date) errors.to_date = "End date is required";
      if (!formData.from_time) errors.from_time = "Start time is required";
      if (!formData.to_time) errors.to_time = "End time is required";

      if (
        formData.from_date &&
        formData.to_date &&
        formData.from_date > formData.to_date
      ) {
        errors.to_date = "End date must be after start date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Animation functions
  const animateIn = () => {
    setFormData({
      request_type: activeTab === "products" ? "product" : "service",
      title: "",
      description: "",
      from_date: "",
      to_date: "",
      from_time: "",
      to_time: "",
      user_id: userId,
      comm_id: communityId,
    });

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAddModal(false);
      setFormErrors({});
    });
  };

  const handleAddPress = () => {
    setShowAddModal(true);
    animateIn();
  };

  const handleFormSubmit = () => {
    if (!validateForm()) return;

    // Generate a unique ID for the new item
    const newId = Math.random().toString(36).substr(2, 9);

    if (activeSubTab === "lend") {
      // Add to requests data (Request model)
      const newRequest = {
        id: newId,
        request_type: formData.request_type,
        title: formData.title,
        description: formData.description,
        from_date: formData.from_date,
        to_date: formData.to_date,
        from_time: formData.from_time,
        to_time: formData.to_time,
        user_id: userId,
        comm_id: communityId,
        provider_id: null,
      };

      setRequestsData([...requestsData, newRequest]);
      Alert.alert("Success", "Your request has been added!");
    } else {
      // Add to offers data (Offer model)
      const newOffer = {
        id: newId,
        offer_type: formData.request_type,
        title: formData.title,
        description: formData.description,
        user_id: userId,
        comm_id: communityId,
      };

      setOffersData([...offersData, newOffer]);
      Alert.alert("Success", "Your offer has been added!");
    }

    animateOut();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>{item.user_name}</Text>
        <Text style={styles.requestType}>
          {item.request_type || item.offer_type}
        </Text>
      </View>
      <Text style={styles.itemName}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>

      {activeSubTab === "lend" && (
        <>
          <View style={styles.timeContainer}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.timeText}>
              {item.from_date} to {item.to_date}
            </Text>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.timeText}>
              {item.from_time} - {item.to_time}
            </Text>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>
          {activeSubTab === "lend" ? "Lend Now" : "Accept"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Main Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "products" && styles.activeTab,
            { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
          ]}
          onPress={() => setActiveTab("products")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "products" && styles.activeTabText,
            ]}
          >
            Products
          </Text>
        </TouchableOpacity>
        {/* Vertical Separator */}
        <View style={styles.tabSeparator} />
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "services" && styles.activeTab,
            { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
          ]}
          onPress={() => setActiveTab("services")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "services" && styles.activeTabText,
            ]}
          >
            Services
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub Tabs */}
      <View style={styles.subTabContainer}>
        <TouchableOpacity
          style={[
            styles.subTabButton,
            activeSubTab === "lend" && styles.activeSubTab,
            { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
          ]}
          onPress={() => setActiveSubTab("lend")}
        >
          <Text
            style={[
              styles.subTabText,
              activeSubTab === "lend" && styles.activeSubTabText,
            ]}
          >
            Lend
          </Text>
        </TouchableOpacity>
        {/* Vertical Separator */}
        <View style={styles.subTabSeparator} />
        <TouchableOpacity
          style={[
            styles.subTabButton,
            activeSubTab === "request" && styles.activeSubTab,
            { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
          ]}
          onPress={() => setActiveSubTab("request")}
        >
          <Text
            style={[
              styles.subTabText,
              activeSubTab === "request" && styles.activeSubTabText,
            ]}
          >
            Request
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={getFilteredData()}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No {activeSubTab === "lend" ? "requests" : "offers"} found for{" "}
            {activeTab}
          </Text>
        }
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={animateOut}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {activeSubTab === "lend" ? "Create an Offer" : "Make a request"}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      formData.request_type === "product" &&
                        styles.radioButtonActive,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        request_type: "product",
                      })
                    }
                  >
                    <Text style={styles.radioButtonText}>Product</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      formData.request_type === "service" &&
                        styles.radioButtonActive,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        request_type: "service",
                      })
                    }
                  >
                    <Text style={styles.radioButtonText}>Service</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Title*</Text>
                <TextInput
                  style={[styles.input, formErrors.title && styles.inputError]}
                  value={formData.title}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      title: text,
                    })
                  }
                  placeholder="What are you offering/requesting?"
                  maxLength={100}
                />
                {formErrors.title && (
                  <Text style={styles.errorText}>{formErrors.title}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description*</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    formErrors.description && styles.inputError,
                  ]}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      description: text,
                    })
                  }
                  placeholder="Provide details..."
                  multiline
                  maxLength={500}
                />
                {formErrors.description && (
                  <Text style={styles.errorText}>{formErrors.description}</Text>
                )}
              </View>

              {activeSubTab != "lend" && (
                <>
                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>From Date*</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setTempDate(
                            formData.from_date
                              ? new Date(formData.from_date)
                              : new Date()
                          );
                          setShowDatePicker("from_date");
                        }}
                      >
                        <TextInput
                          style={[
                            styles.input,
                            formErrors.from_date && styles.inputError,
                          ]}
                          value={formData.from_date}
                          placeholder="YYYY-MM-DD"
                          editable={false}
                        />
                      </TouchableOpacity>
                      {formErrors.from_date && (
                        <Text style={styles.errorText}>
                          {formErrors.from_date}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>To Date*</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setTempDate(
                            formData.to_date
                              ? new Date(formData.to_date)
                              : new Date()
                          );
                          setShowDatePicker("to_date");
                        }}
                      >
                        <TextInput
                          style={[
                            styles.input,
                            formErrors.to_date && styles.inputError,
                          ]}
                          value={formData.to_date}
                          placeholder="YYYY-MM-DD"
                          editable={false}
                        />
                      </TouchableOpacity>
                      {formErrors.to_date && (
                        <Text style={styles.errorText}>
                          {formErrors.to_date}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>From Time*</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setTempDate(
                            formData.from_time
                              ? new Date(`1970-01-01T${formData.from_time}:00`)
                              : new Date()
                          );
                          setShowDatePicker("from_time");
                        }}
                      >
                        <TextInput
                          style={[
                            styles.input,
                            formErrors.from_time && styles.inputError,
                          ]}
                          value={formData.from_time}
                          placeholder="HH:MM"
                          editable={false}
                        />
                      </TouchableOpacity>
                      {formErrors.from_time && (
                        <Text style={styles.errorText}>
                          {formErrors.from_time}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>To Time*</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setTempDate(
                            formData.to_time
                              ? new Date(`1970-01-01T${formData.to_time}:00`)
                              : new Date()
                          );
                          setShowDatePicker("to_time");
                        }}
                      >
                        <TextInput
                          style={[
                            styles.input,
                            formErrors.to_time && styles.inputError,
                          ]}
                          value={formData.to_time}
                          placeholder="HH:MM"
                          editable={false}
                        />
                      </TouchableOpacity>
                      {formErrors.to_time && (
                        <Text style={styles.errorText}>
                          {formErrors.to_time}
                        </Text>
                      )}
                    </View>
                  </View>
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={animateOut}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleFormSubmit}
                >
                  <Text style={styles.modalButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Date/Time Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode={showDatePicker.includes("time") ? "time" : "date"}
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  // Main Tabs (Products/Services) -- now stick to screen edge, clear partition
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 4,
    // borderRadius: 8, // removed
    // overflow: "hidden", // removed
    // marginHorizontal: 12, // removed
    marginTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5e6",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#4CAF50",
    backgroundColor: "#fff",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  activeTabText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  tabSeparator: {
    width: 1,
    backgroundColor: "#d1d5e6",
    marginVertical: 8,
  },

  // Sub Tabs (Lend/Request) -- green active, rounded, modern
  subTabContainer: {
    flexDirection: "row",
    backgroundColor: "#e9ecef",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    marginHorizontal: 24,
    marginTop: 18,
    marginBottom: 8,
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#e9ecef",
  },
  activeSubTab: {
    backgroundColor: "#4CAF50",
  },
  subTabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
  },
  activeSubTabText: {
    color: "white",
    fontWeight: "bold",
  },
  subTabSeparator: {
    width: 1,
    backgroundColor: "#d1d5e6",
    marginVertical: 8,
  },

  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  requestType: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#eee",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  actionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalScrollContent: {
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  radioGroup: {
    flexDirection: "row",
    marginTop: 8,
  },
  radioButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  radioButtonActive: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  radioButtonText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ACAF50",
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#f44336",
    borderWidth: 1,
  },
  errorText: {
    color: "#f44336",
    fontSize: 12,
    marginTop: 4,
  },
});

export default ExchangeHub;
