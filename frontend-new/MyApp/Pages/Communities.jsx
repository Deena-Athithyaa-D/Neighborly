import React, { useEffect, useRef, useState, useCallback } from "react";
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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

const screenHeight = Dimensions.get("window").height;

export default function Communities() {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState("Communities Near You");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [communityMarker, setCommunityMarker] = useState(null);
  const [listData, setListData] = useState([]);
  const mapRef = useRef(null);
  const navigation = useNavigation();
  const user_id = "72ec87c9-eb03-44e7-853f-b4c774db0deb";

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return null;
      }

      let location = await Location.getCurrentPositionAsync({});
      const loc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(loc);
      return loc;
    } catch (err) {
      console.error("Location error:", err);
      return null;
    }
  };

  const focusOnUserLocation = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const fetchCommunities = async () => {
    try {
      const res = await fetch(
        `https://69df-202-53-4-31.ngrok-free.app/api/get_user_communities/${user_id}`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        const formattedData = data.map((item, index) => ({
          id: item.id?.toString() || index.toString(),
          name: item.comm_name,
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longtitude),
        }));
        setListData(formattedData);
      }
    } catch (err) {
      console.error("Error fetching communities:", err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const location = await getUserLocation();
      await fetchCommunities();
      if (location) focusOnUserLocation();
    };
    initialize();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setSelectedId(null);
      setSelectedTitle("Communities Near You");
    }, [])
  );

  const handleSelect = (id, name, latitude, longitude) => {
    setSelectedId(id);
    setSelectedTitle(name);
    if (mapRef.current && latitude && longitude) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
    navigation.navigate("MainTabs", { screen: "Home" });
  };

  const handleCreateCommunityPress = () => {
    setIsModalVisible(true);
  };

  const handleJoinCommunityPress = () => {
    navigation.navigate("JoinCommunities");
  };

  const handleCreateCommunity = async () => {
    if (!communityName || !userLocation) {
      Alert.alert(
        "Please enter a community name and ensure location is available."
      );
      return;
    }

    const postData = {
      comm_name: communityName,
      location: "User Current Location",
      latitude: userLocation.latitude.toString(),
      longtitude: userLocation.longitude.toString(),
      admin_id: `${user_id}`,
    };

    try {
      const response = await fetch(
        `https://69df-202-53-4-31.ngrok-free.app/api/create_community/${user_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        }
      );

      if (response.ok) {
        Alert.alert("Community created successfully!");
        setCommunityMarker({
          id: Date.now().toString(),
          name: communityName,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        });
        setCommunityName("");
        setIsModalVisible(false);
        focusOnUserLocation();
        fetchCommunities();
      } else {
        Alert.alert("Failed to create community.");
      }
    } catch (error) {
      console.error("Create community error:", error);
      Alert.alert("Error creating community.");
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        handleSelect(item.id, item.name, item.latitude, item.longitude)
      }
    >
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapSection}>
        <Text style={styles.mapTitle}>{selectedTitle}</Text>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 13.0827,
            longitude: 80.2707,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {communityMarker && (
            <Marker
              coordinate={{
                latitude: communityMarker.latitude,
                longitude: communityMarker.longitude,
              }}
            >
              <Callout>
                <Text style={styles.markerLabelText}>
                  {communityMarker.name}
                </Text>
              </Callout>
            </Marker>
          )}
          {userLocation && (
            <Marker coordinate={userLocation} pinColor="blue">
              <Callout>
                <Text style={styles.markerLabelText}>Your Location</Text>
              </Callout>
            </Marker>
          )}
          {listData.map((community) => (
            <Marker
              key={community.id}
              coordinate={{
                latitude: community.latitude,
                longitude: community.longitude,
              }}
            >
              <Callout>
                <Text style={styles.markerLabelText}>{community.name}</Text>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>

      <View style={styles.topButtonsContainer}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={handleCreateCommunityPress}
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
        contentContainerStyle={{ paddingBottom: 30 }}
        style={styles.list}
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
  mapSection: {
    height: screenHeight * 0.4,
  },
  map: {
    flex: 1,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4C3E99",
    textAlign: "center",
    paddingVertical: 10,
  },
  topButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 10,
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
  list: {
    flex: 1,
    marginTop: 10,
  },
  item: {
    backgroundColor: "#F3F0FF",
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemText: {
    color: "#3D347A",
    fontWeight: "bold",
    fontSize: 16,
  },
  markerLabelText: {
    fontSize: 14,
    fontWeight: "bold",
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
