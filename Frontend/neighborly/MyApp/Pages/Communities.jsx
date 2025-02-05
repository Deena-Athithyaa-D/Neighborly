import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Modal,
  TextInput,
  Button,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location"; // For real-time location

// Dummy data for the list
const listData = [
  { id: "1", name: "Community A" },
  { id: "2", name: "Community B" },
  { id: "3", name: "Community C" },
  { id: "4", name: "Community D" },
  { id: "5", name: "Community E" },
];

export default function Communities() {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState("Communities Near You");
  const [refresh, setRefresh] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false); // Flag to track if community creation is in progress
  const [communityMarker, setCommunityMarker] = useState(null); // Store the created community marker
  const mapRef = useRef(null);
  const navigation = useNavigation();

  // Get user's real-time location
  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLat(location.coords.latitude);
    setUserLng(location.coords.longitude);
  };

  // Focus map on user's location
  const focusOnUserLocation = () => {
    if (mapRef.current && userLat && userLng) {
      mapRef.current.animateToRegion({
        latitude: userLat,
        longitude: userLng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  // Open modal and get user location
  const handleCreateList = () => {
    setIsModalVisible(true);
    getUserLocation();
  };

  // Handle community creation
  const handleCreateCommunity = () => {
    if (!communityName || !userLat || !userLng) {
      Alert.alert(
        "Please enter a community name and ensure location is available."
      );
      return;
    }
    // Set the community marker
    setCommunityMarker({
      id: Date.now().toString(), // Use a unique ID for the marker
      name: communityName,
      latitude: userLat,
      longitude: userLng,
    });
    Alert.alert(
      `Community "${communityName}" created at (${userLat}, ${userLng})`
    );
    setIsModalVisible(false);
    setCommunityName("");
    focusOnUserLocation();
    setIsCreatingCommunity(false); // Reset the flag after community is created
  };

  // Refresh data when user navigates back
  useFocusEffect(
    useCallback(() => {
      setSelectedId(null);
      setSelectedTitle("Communities Near You");
      setRefresh((prev) => prev + 1);
    }, [])
  );

  const handleSelect = (id, name, latitude, longitude) => {
    if (isCreatingCommunity) {
      return; // Prevent navigation when community creation is in progress
    }

    setSelectedId(id);
    setSelectedTitle(name);

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }

    // Navigate to home page when a community is clicked
    navigation.navigate("HomeTabs", { screen: "Home" });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item.id, item.name)}
      style={[styles.item, { backgroundColor: "#fff" }]}
    >
      <Text style={[styles.itemText, { color: "#000" }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    getUserLocation(); // Get user's location
  }, []); // Empty dependency array to run only once when the component mounts

  useEffect(() => {
    // After getting the user location, focus on it
    if (userLat && userLng) {
      focusOnUserLocation();
    }
  }, [userLat, userLng]); // Re-run when userLat or userLng changes

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Container */}
      <View style={styles.mapContainer}>
        <View style={styles.mapTitleContainer}>
          <Text style={styles.mapTitle}>{selectedTitle}</Text>
        </View>

        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 13.0827, // Chennai coordinates
            longitude: 80.2707,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {communityMarker && (
            <Marker
              key={communityMarker.id}
              coordinate={{
                latitude: communityMarker.latitude,
                longitude: communityMarker.longitude,
              }}
              onPress={() =>
                handleSelect(
                  communityMarker.id,
                  communityMarker.name,
                  communityMarker.latitude,
                  communityMarker.longitude
                )
              }
            >
              <Callout>
                <Text style={styles.markerLabelText}>{communityMarker.name}</Text>
              </Callout>
            </Marker>
          )}

          {userLat && userLng && (
            <Marker
              coordinate={{ latitude: userLat, longitude: userLng }}
              pinColor="blue"
            >
              <Callout>
                <Text>Your Location</Text>
              </Callout>
            </Marker>
          )}
        </MapView>
      </View>

      {/* Create List Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleCreateList}
          style={styles.createListButton}
        >
          <Text style={styles.createListText}>Create List</Text>
        </TouchableOpacity>
      </View>

      {/* List Container */}
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        extraData={refresh}
        style={styles.list}
      />

      {/* Modal for creating a new community */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Community</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter community name"
              value={communityName}
              onChangeText={setCommunityName}
            />
            <Button title="Create" onPress={handleCreateCommunity} />
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  mapContainer: {
    height: "40%",
    width: "100%",
  },
  mapTitleContainer: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 5,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  list: {
    flex: 1,
    width: "100%",
  },
  item: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    width: "80%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  markerLabelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  buttonContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  createListButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  createListText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});
