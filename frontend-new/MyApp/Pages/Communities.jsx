import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";

export default function Communities() {
  const [selectedTitle, setSelectedTitle] = useState("Communities Near You");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [listData, setListData] = useState([]);
  const [user_id, setUser_id] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const uuid = await SecureStore.getItemAsync("uuid");
        if (!uuid) {
          navigation.navigate("Login");
          return;
        }
        setUser_id(uuid);
      } catch (error) {
        console.error("Error checking auth:", error);
        navigation.navigate("Auth");
      }
    };

    checkAuth();
  }, [navigation]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const loc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(loc);
    } catch (err) {
      console.error("Location error:", err);
    }
  };

  const fetchCommunities = async () => {
    if (!user_id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(user_id);
      const res = await fetch(
        `https://34ed-171-79-48-24.ngrok-free.app/api/get_user_communities/${user_id}`
      );
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        if (data.length === 0) {
          setListData([]);
          setError("You're not part of any communities yet. Create or join one to get started!");
        } else {
          const formatted = data.map((item, idx) => ({
            id: item.id?.toString() || idx.toString(),
            name: item.name,
          }));
          setListData(formatted);
        }
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to load communities. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [communityName, user_id]);

  useEffect(() => {
    const init = async () => {
      if (!user_id) return;
      await getUserLocation();
    };
    init();
  }, [user_id]);

  useFocusEffect(
    useCallback(() => {
      setSelectedTitle("Communities Near You");
      fetchCommunities();
    }, [user_id])
  );

  const handleSelect = (id, name) => {
    setSelectedTitle(name);
    navigation.navigate("MainTabs", { screen: "Home" });
  };

  const handleCreateCommunity = async () => {
    if (!user_id) return;
    
    const name = communityName.trim();
    if (!name || !userLocation) {
      Alert.alert("Please enter a community name and ensure location access.");
      return;
    }

    const postData = {
      comm_name: name,
      location: "User Current Location",
      latitude: userLocation.latitude.toString(),
      longtitude: userLocation.longitude.toString(),
      admin_id: user_id,
    };

    try {
      const res = await fetch(
        `https://34ed-171-79-48-24.ngrok-free.app/api/create_community/${user_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        }
      );

      if (res.ok) {
        Alert.alert("Success", "Community created!");
        setCommunityName("");
        setIsModalVisible(false);
        await fetchCommunities();
      } else {
        throw new Error("Failed to create community");
      }
    } catch (err) {
      console.error("Create community error:", err);
      Alert.alert("Error", "Could not create community. Please try again.");
    }
  };

  const handleJoinCommunityPress = () => {
    navigation.navigate("JoinCommunities");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.circleItem}
      onPress={() => handleSelect(item.id, item.name)}
    >
      <Text style={styles.circleItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (!user_id) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{selectedTitle}</Text>

      <View style={styles.topButtonsContainer}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.topButtonText}>Create Community</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topButton}
          onPress={handleJoinCommunityPress}
        >
          <Text style={styles.topButtonText}>Join Community</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={[styles.center, { flex: 1 }]}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      ) : error ? (
        <View style={[styles.center, { flex: 1, padding: 20 }]}>
          <Text>No communities at present!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.ctaButtonText}>Create Your First Community</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          ListEmptyComponent={
            <View style={[styles.center, { flex: 1 }]}>
              <Text style={styles.emptyText}>No communities found</Text>
            </View>
          }
        />
      )}

      <Modal visible={isModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Community</Text>
            <TextInput
              placeholder="Enter community name"
              value={communityName}
              onChangeText={setCommunityName}
              style={styles.input}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCreateCommunity}
            >
              <Text style={styles.modalButtonText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECECFF",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4C3E99",
    textAlign: "center",
    paddingVertical: 12,
  },
  topButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  topButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  topButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 10,
  },
  circleItem: {
    backgroundColor: "#D6D1FF",
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  circleItemText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#F3F0FF",
    marginHorizontal: 30,
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4C3E99",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderColor: "#B9B4F4",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "#6C63FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#B9B4F4",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalCancelText: {
    color: "#333",
    fontWeight: "bold",
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#4C3E99",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#4C3E99",
    textAlign: "center",
  },
  ctaButton: {
    backgroundColor: "#6C63FF",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  ctaButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});