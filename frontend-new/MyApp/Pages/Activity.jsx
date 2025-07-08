import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Easing,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

const Activity = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("offerings");
  const [expandedItems, setExpandedItems] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const [userId, setUserId] = useState(null);
  const [commId, setCommId] = useState(null);

  const [offeringsData, setOfferingsData] = useState([]);
  const [requestsData, setRequestsData] = useState([]);
  const [interestedUsers, setInterestedUsers] = useState({});

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
        await fetchData(storedUuid, storedCommId);

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

  const fetchData = async (uuid, communityId) => {
    try {
      setRefreshing(true);

      const offersRes = await fetch(
        `https://neighborly-jek2.onrender.com/api/get_offers_for_user/${uuid}/${communityId}`
      );
      if (!offersRes.ok) throw new Error("Failed to fetch offerings");
      const offersData = await offersRes.json();
      setOfferingsData(offersData);

      const requestsRes = await fetch(
        `https://neighborly-jek2.onrender.com/api/view_user_requests/${communityId}/${uuid}`
      );
      if (!requestsRes.ok) throw new Error("Failed to fetch requests");
      const requestsData = await requestsRes.json();
      setRequestsData(requestsData);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch data");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchInterestedUsers = async (offerId) => {
    try {
      const res = await fetch(
        `https://neighborly-jek2.onrender.com/api/view_request_from_neighbours/${offerId}`
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
    if (userId && commId) {
      await fetchData(userId, commId);
    }
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
    try {
      const firstResponse = await fetch(
        `https://neighborly-jek2.onrender.com/api/update_offer_status/${offer_id}/${status}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!firstResponse.ok) throw new Error("First request failed");

      const secondResponse = await fetch(
        `https://neighborly-jek2.onrender.com/api/update_request_status/${request_id}/${status}/${offer_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!secondResponse.ok) throw new Error("Second request failed");

      await fetchInterestedUsers(offer_id);
      Alert.alert("Success", "Response updated successfully!");
    } catch (err) {
      console.error("Error in handleResponse:", err);
      Alert.alert("Error", err.message || "Failed to update response");
    }
  };

  const renderOfferingItem = ({ item }) => {
    const users = interestedUsers[item.id] || [];
    return (
      <Animated.View
        style={{
          ...styles.card,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <TouchableOpacity onPress={() => toggleExpand(item.id)}>
          <View style={styles.cardHeader}>
            <View style={styles.cardContent}>
              <View style={styles.typeBadgeContainer}>
                <Text style={styles.typeBadge}>{item.offer_type}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
            <Ionicons
              name={expandedItems[item.id] ? "chevron-up" : "chevron-down"}
              size={20}
              color="#6b7280"
            />
          </View>
        </TouchableOpacity>

        {expandedItems[item.id] && (
          <View style={styles.interestedUsersContainer}>
            <Text style={styles.interestedTitle}>
              {users.length} {users.length === 1 ? "Response" : "Responses"}
            </Text>
            {users.length > 0 ? (
              users.map((user, index) => (
                <Animated.View
                  key={user.id}
                  style={{
                    ...styles.interestedUserCard,
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateX: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, index % 2 === 0 ? -10 : 10],
                        }),
                      },
                    ],
                  }}
                >
                  <View style={styles.userInfoContainer}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.avatarText}>
                        {user.user_name?.charAt(0).toUpperCase() || "U"}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {user.user_name || "Anonymous"}
                      </Text>
                      <View style={styles.timeDateContainer}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color="#6b7280"
                        />
                        <Text style={styles.timeDate}>
                          {user.from_date} {user.from_time} → {user.to_date}{" "}
                          {user.to_time}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.actionContainer}>
                    {user.status === 1 ? (
                      <View style={styles.buttonGroup}>
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
                      <View style={styles.statusBadge}>
                        <Text style={styles.acceptedText}>Accepted</Text>
                      </View>
                    ) : (
                      <View style={styles.statusBadge}>
                        <Text style={styles.declinedText}>Declined</Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={24} color="#d1d5db" />
                <Text style={styles.emptyStateText}>No responses yet</Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    );
  };

  const renderRequestItem = ({ item }) => (
    <Animated.View
      style={{
        ...styles.card,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View style={styles.cardContent}>
        <View style={styles.typeBadgeContainer}>
          <Text style={styles.typeBadge}>{item.request_type}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.timeDateContainer}>
          <Ionicons name="time-outline" size={14} color="#6b7280" />
          <Text style={styles.timeDate}>
            {item.from_date} {item.from_time} → {item.to_date} {item.to_time}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

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
          <Text style={styles.tabText}>Your Offerings</Text>
          {activeTab === "offerings" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "requests" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("requests")}
        >
          <Text style={styles.tabText}>Your Requests</Text>
          {activeTab === "requests" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === "offerings" ? offeringsData : requestsData}
        renderItem={
          activeTab === "offerings" ? renderOfferingItem : renderRequestItem
        }
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6366f1"]}
            tintColor="#6366f1"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Ionicons name="list-outline" size={48} color="#e5e7eb" />
            <Text style={styles.emptyListText}>
              No {activeTab === "offerings" ? "offerings" : "requests"} found
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    position: "relative",
  },
  activeTab: {},
  activeTabIndicator: {
    position: "absolute",
    bottom: -1,
    height: 2,
    width: "100%",
    backgroundColor: "#6366f1",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#6366f1",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardContent: {
    flex: 1,
  },
  typeBadgeContainer: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: "#e0e7ff",
    color: "#4f46e5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  timeDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  timeDate: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 4,
  },
  interestedUsersContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  interestedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  interestedUserCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  userInfoContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  actionContainer: {
    alignItems: "flex-end",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
    minWidth: 80,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#10b981",
  },
  declineButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
  },
  acceptedText: {
    color: "#10b981",
    fontWeight: "500",
    fontSize: 14,
  },
  declinedText: {
    color: "#ef4444",
    fontWeight: "500",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyStateText: {
    color: "#9ca3af",
    marginTop: 8,
    fontSize: 14,
  },
  emptyList: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyListText: {
    color: "#9ca3af",
    marginTop: 16,
    fontSize: 16,
  },
});

export default Activity;
