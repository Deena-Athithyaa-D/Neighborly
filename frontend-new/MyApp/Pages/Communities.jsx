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
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

export default function Communities() {
  const [selectedTitle, setSelectedTitle] = useState("Communities Near You");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [listData, setListData] = useState([]);
  const navigation = useNavigation();

  const user_id = "17d45b9c-be88-4445-9cb0-7fee00ef8b18"; // Hardcoded

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
  useEffect(() => {
    const getCommunities = async () => {
      try {
        const res = await fetch(
          `https://4d71-202-53-4-31.ngrok-free.app//api/get_user_communities/${user_id}`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map((item, idx) => ({
            id: item.id?.toString() || idx.toString(),
            name: item.name,
          }));
          setListData(formatted);
          console.log(data);
        } else {
          console.warn("Unexpected API response format:", data);
        }
      } catch (err) {
        console.error("Error fetching communities:", err);
      }
    };

    getCommunities();
  }, [communityName]);

  useEffect(() => {
    const init = async () => {
      await getUserLocation();
      await fetchCommunities();
    };
    init();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setSelectedTitle("Communities Near You");
    }, [])
  );

  const handleSelect = (id, name) => {
    setSelectedTitle(name);
    navigation.navigate("MainTabs", { screen: "Home" });
  };

  const handleCreateCommunity = async () => {
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
        `https://4d71-202-53-4-31.ngrok-free.app//api/create_community/${user_id}`,
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
        // await  getCommunities();
      } else {
        Alert.alert("Failed to create community.");
      }
    } catch (err) {
      console.error("Create community error:", err);
      Alert.alert("Error creating community.");
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

      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
      />

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
    backgroundColor: "#D6D1FF", // Darker shade of lavender
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
    color: "#000", // Ensures visibility
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
});
