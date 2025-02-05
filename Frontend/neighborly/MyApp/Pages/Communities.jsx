import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { useFocusEffect, useNavigation } from "@react-navigation/native"; // Import useNavigation

// Updated dummy data with area names near Chennai
const dummyData = [
  { id: "1", name: "T. Nagar", latitude: 13.0344, longitude: 80.2303 },
  { id: "2", name: "Adyar", latitude: 13.0067, longitude: 80.2566 },
  { id: "3", name: "Anna Nagar", latitude: 13.0878, longitude: 80.2093 },
  { id: "4", name: "Velachery", latitude: 12.979, longitude: 80.2199 },
  { id: "5", name: "Mylapore", latitude: 13.0376, longitude: 80.2698 },
];

export default function Communities() {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState("Communities Near You");
  const [refresh, setRefresh] = useState(0); // Used to trigger refresh
  const mapRef = useRef(null);
  const navigation = useNavigation(); // Hook for navigation

  // Refresh data when user navigates back
  useFocusEffect(
    useCallback(() => {
      setSelectedId(null);
      setSelectedTitle("Communities Near You");
      setRefresh((prev) => prev + 1); // Force re-render by updating state

      if (mapRef.current) {
        mapRef.current.fitToCoordinates(
          dummyData.map((location) => ({
            latitude: location.latitude,
            longitude: location.longitude,
          })),
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          }
        );
      }
    }, [])
  );
  

  const handleSelect = (id, name, latitude, longitude) => {
    setSelectedId(id);
    setSelectedTitle(name);

    navigation.replace("HomeTabs");
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedId ? "#6C63FF" : "#fff";
    const textColor = item.id === selectedId ? "#fff" : "#000";

    return (
      <TouchableOpacity
        onPress={() =>
          handleSelect(item.id, item.name, item.latitude, item.longitude)
        }
        style={[styles.item, { backgroundColor }]}
      >
        <Text style={[styles.itemText, { color: textColor }]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Container */}
      <View style={styles.mapContainer} key={refresh}>
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
          {dummyData.map((location) => (
            <Marker
              key={location.id}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              onPress={() =>
                handleSelect(
                  location.id,
                  location.name,
                  location.latitude,
                  location.longitude
                )
              }
            >
              <Callout>
                <Text style={styles.markerLabelText}>{location.name}</Text>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* List Container */}
      <FlatList
        data={dummyData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        extraData={refresh} // Ensures list updates on refresh
        style={styles.list}
      />
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
});
