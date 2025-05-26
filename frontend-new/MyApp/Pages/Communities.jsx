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
  const [userLocation, setUserLocation] = useState(null); // Store user location object
  const [communityMarker, setCommunityMarker] = useState(null);
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
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  // Focus map on user's location & zoom in
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

  // Called on initial load & when userLocation changes
  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      focusOnUserLocation();
    }
  }, [userLocation]);

  useFocusEffect(
    useCallback(() => {
      setSelectedId(null);
      setSelectedTitle("Communities Near You");
      setRefresh((prev) => prev + 1);
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

  // For Create Community button (just open modal for now)
  const handleCreateCommunityPress = () => {
    setIsModalVisible(true);
  };

  // For Join Community button (can implement logic later)
  const handleJoinCommunityPress = () => {
    navigation.navigate("JoinCommunities");
  };

  // Handle community creation in modal
  const handleCreateCommunity = () => {
    if (!communityName || !userLocation) {
      Alert.alert(
        "Please enter a community name and ensure location is available."
      );
      return;
    }
    setCommunityMarker({
      id: Date.now().toString(),
      name: communityName,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    });
    Alert.alert(
      `Community "${communityName}" created at (${userLocation.latitude.toFixed(
        4
      )}, ${userLocation.longitude.toFixed(4)})`
    );
    setIsModalVisible(false);
    setCommunityName("");
    focusOnUserLocation();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        handleSelect(
          item.id,
          item.name,
          userLocation?.latitude,
          userLocation?.longitude
        )
      }
      style={[styles.item, { backgroundColor: "#fff" }]}
    >
      <Text style={[styles.itemText, { color: "#000" }]}>{item.name}</Text>
    </TouchableOpacity>
  );

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
            latitude: 13.0827,
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
                <Text style={styles.markerLabelText}>
                  {communityMarker.name}
                </Text>
              </Callout>
            </Marker>
          )}

          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              pinColor="blue"
            >
              <Callout>
                <Text>Your Location</Text>
              </Callout>
            </Marker>
          )}
        </MapView>
      </View>

      {/* Buttons for Create / Join Community */}
      <View style={styles.topButtonsContainer}>
        <TouchableOpacity
          onPress={handleCreateCommunityPress}
          style={styles.topButton}
        >
          <Text style={styles.topButtonText}>Create Community</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleJoinCommunityPress}
          style={styles.topButton}
        >
          <Text style={styles.topButtonText}>Join Community</Text>
        </TouchableOpacity>
      </View>

      {/* List Container */}
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        extraData={refresh}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Community</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter community name"
              placeholderTextColor="#999"
              value={communityName}
              onChangeText={setCommunityName}
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
        </View>
      </Modal>
    </SafeAreaView>
  );
}
// Replace the old styles and modal JSX with this updated version

// NEW STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECECFF", // light bluish-purple background
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4C3E99",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 15,
    backgroundColor: "#D6D0FF",
    marginHorizontal: 20,
    borderRadius: 30,
    marginTop: 10,
    marginBottom: 5,
    shadowColor: "#6C63FF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  topButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 2,
  },
  topButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
    backgroundColor: "#F3F0FF",
    shadowColor: "#6C63FF",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  itemText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3D347A",
  },
  markerLabelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    width: "85%",
    padding: 25,
    backgroundColor: "#F3F0FF",
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#4C3E99",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#B9B4F4",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    backgroundColor: "#fff",
    color: "#333",
  },
  modalButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#B9B4F4",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalCancelText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
});
