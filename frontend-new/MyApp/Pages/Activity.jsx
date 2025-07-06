import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Easing,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

const Activity = () => {
  const [activeTab, setActiveTab] = useState("offerings");
  const [expandedItems, setExpandedItems] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Data states
  const [offeringsData, setOfferingsData] = useState([]);
  const [requestsData, setRequestsData] = useState([]);
  const [interestedUsers, setInterestedUsers] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const uuid = await SecureStore.getItemAsync("uuid");
        if (!uuid) {
          navigation.navigate("Login");
          return;
        }
        setUserId(uuid);
      } catch (error) {
        console.error("Error checking auth:", error);
        navigation.navigate("Login");
      }
    };

    checkAuth();
  }, [navigation]);

  useEffect(() => {
    if (!userId) return;

    const animateAndFetch = async () => {
      await fetchData();
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
    };

    animateAndFetch();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch offerings data
      const offersRes = await fetch(
        `https://34ed-171-79-48-24.ngrok-free.app/api/get_offers_for_user/${userId}/1`
      );
      if (!offersRes.ok) throw new Error("Failed to fetch offerings");
      const offersData = await offersRes.json();

      // Fetch requests data
      const requestsRes = await fetch(
        `https://34ed-171-79-48-24.ngrok-free.app/api/view_user_requests/1/${userId}`
      );
      if (!requestsRes.ok) throw new Error("Failed to fetch requests");
      const requestsData = await requestsRes.json();

      setOfferingsData(offersData);
      setRequestsData(requestsData);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInterestedUsers = async (offerId) => {
    try {
      const res = await fetch(
        `https://34ed-171-79-48-24.ngrok-free.app/api/view_request_from_neighbours/${offerId}`
      );
      if (!res.ok) throw new Error("Failed to fetch interested users");
      const data = await res.json();
      setInterestedUsers((prev) => ({
        ...prev,
        [offerId]: data,
      }));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch interested users");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const toggleExpand = async (id) => {
    if (!expandedItems[id]) {
      await fetchInterestedUsers(id);
    }
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleResponse = async (offer_id, request_id, status) => {
    if (!userId) {
      navigation.navigate("Login");
      return;
    }

    try {
      setLoading(true);
      
      // First PUT request
      const firstResponse = await fetch(
        `https://34ed-171-79-48-24.ngrok-free.app/api/update_offer_status/${offer_id}/${status}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!firstResponse.ok) {
        throw new Error("Failed to update offer status");
      }

      // Second PUT request
      const secondResponse = await fetch(
        `https://34ed-171-79-48-24.ngrok-free.app/api/update_request_status/${request_id}/${status}/${offer_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!secondResponse.ok) {
        throw new Error("Failed to update request status");
      }

      Alert.alert("Success", "Response submitted successfully!");
      await fetchInterestedUsers(offer_id);
    } catch (err) {
      console.error("Error in handleResponse:", err);
      Alert.alert("Error", err.message || "Failed to submit response");
    } finally {
      setLoading(false);
    }
  };

  const renderOfferingItem = ({ item }) => {
    const users = interestedUsers[item.id] || [];
    return (
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity onPress={() => toggleExpand(item.id)}>
          <View style={styles.cardHeader}>
            <View style={styles.cardContent}>
              <Text style={styles.typeBadge}>{item.offer_type}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
            <Ionicons
              name={expandedItems[item.id] ? "chevron-up" : "chevron-down"}
              size={24}
              color="#666"
            />
          </View>
        </TouchableOpacity>

        {expandedItems[item.id] && (
          <View style={styles.interestedUsersContainer}>
            <Text style={styles.interestedTitle}>
              {users.length} {users.length === 1 ? "response" : "responses"}
            </Text>
            {users.length > 0 ? (
              users.map((user, index) => (
                <Animated.View
                  key={user.id}
                  style={[
                    styles.interestedUserCard,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateX: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, index % 2 === 0 ? -10 : 10],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.userInfoContainer}>
                    <View style={styles.userAvatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {user.user_name?.charAt(0).toUpperCase() || "U"}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {user.user_name || "Unknown User"}
                      </Text>
                      <View style={styles.timeDateContainer}>
                        <Text style={styles.timeDate}>
                          {user.from_date} {user.from_time} → {user.to_date}{" "}
                          {user.to_time}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {user.status === 1 ? (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleResponse(item.id, user.id, 2)}
                      >
                        <Text style={styles.actionButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.declineButton]}
                        onPress={() => handleResponse(item.id, user.id, 0)}
                      >
                        <Text style={styles.actionButtonText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  ) : user.status === 2 ? (
                    <View style={styles.statusContainer}>
                      <Text style={styles.acceptedText}>Accepted</Text>
                    </View>
                  ) : (
                    <View style={styles.statusContainer}>
                      <Text style={styles.declinedText}>Declined</Text>
                    </View>
                  )}
                </Animated.View>
              ))
            ) : (
              <Text style={styles.noResponsesText}>No responses yet</Text>
            )}
          </View>
        )}
      </Animated.View>
    );
  };

  const renderRequestItem = ({ item }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.cardContent}>
        <Text style={styles.typeBadge}>{item.request_type}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.timeDateContainer}>
          <Text style={styles.timeDate}>
            {item.from_date} {item.from_time} → {item.to_date} {item.to_time}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  if (!userId) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const currentData = activeTab === "offerings" ? offeringsData : requestsData;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Responses</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "offerings" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("offerings")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "offerings" && styles.activeTabText,
            ]}
          >
            Your Offerings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "requests" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("requests")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "requests" && styles.activeTabText,
            ]}
          >
            Your Requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading && currentData.length === 0 ? (
        <View style={[styles.center, { flex: 1 }]}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : error ? (
        <View style={[styles.center, { flex: 1 }]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={currentData}
          renderItem={
            activeTab === "offerings" ? renderOfferingItem : renderRequestItem
          }
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            currentData.length === 0 && styles.emptyListContent,
          ]}
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4CAF50"]}
              tintColor="#4CAF50"
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No {activeTab === "offerings" ? "offerings" : "requests"} found
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    backgroundColor: "#4CAF50",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#e9ecef",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#4CAF50",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
  },
  activeTabText: {
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardContent: {
    flex: 1,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e9ecef",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 20,
  },
  timeDateContainer: {
    marginTop: 10,
  },
  timeDate: {
    fontSize: 14,
    color: "#495057",
    fontStyle: "italic",
  },
  interestedUsersContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingTop: 15,
  },
  interestedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 10,
  },
  noResponsesText: {
    textAlign: "center",
    color: "#6c757d",
    fontStyle: "italic",
  },
  interestedUserCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  userInfoContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  userAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  declineButton: {
    backgroundColor: "#f44336",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
  },
  statusContainer: {
    alignItems: "flex-end",
    marginTop: 10,
  },
  acceptedText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  declinedText: {
    color: "#f44336",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#6c757d",
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Activity;