import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

// Generate mock communities nearby user
const generateNearbyCommunities = (userLat, userLng, count = 3) => {
  const radiusInMeters = 2000;
  const earthRadius = 6378137;
  const communities = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radiusInMeters;

    const deltaLat = (distance * Math.cos(angle)) / earthRadius;
    const deltaLng =
      (distance * Math.sin(angle)) / (earthRadius * Math.cos((userLat * Math.PI) / 180));

    const newLat = userLat + (deltaLat * 180) / Math.PI;
    const newLng = userLng + (deltaLng * 180) / Math.PI;

    communities.push({
      id: `${i + 1}`,
      name: `Community ${String.fromCharCode(65 + i)}`,
      latitude: newLat,
      longitude: newLng,
    });
  }

  return communities;
};

export default function JoinCommunities() {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState("Join a Community Near You");
  const [userLocation, setUserLocation] = useState(null);
  const [communityData, setCommunityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const navigation = useNavigation();

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission denied.");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userLoc);
      const generated = generateNearbyCommunities(userLoc.latitude, userLoc.longitude, 3);
      setCommunityData(generated);
      setLoading(false);
    } catch (err) {
      Alert.alert("Error fetching location", err.message);
      setLoading(false);
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
      setSelectedTitle("Join a Community Near You");
    }, [])
  );

  const handleSelect = (id, name) => {
    Alert.alert("Join Community", `Would you like to join "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Join",
        onPress: () => {
          setSelectedId(id);
          setSelectedTitle(name);
          navigation.navigate("MainTabs", { screen: "Home" });
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item.id, item.name)}
      style={styles.item}
    >
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text>Loading map and nearby communities...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <View style={styles.mapTitleContainer}>
          <Text style={styles.mapTitle}>{selectedTitle}</Text>
        </View>

        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: userLocation?.latitude || 13.0827,
            longitude: userLocation?.longitude || 80.2707,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {communityData.map((community) => (
            <Marker
              key={community.id}
              coordinate={{
                latitude: community.latitude,
                longitude: community.longitude,
              }}
              onPress={() => handleSelect(community.id, community.name)}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerLabel}>
                  <Text style={styles.markerLabelText}>{community.name}</Text>
                </View>
                <View style={styles.markerPin}>
                  <View style={styles.markerPinInner} />
                </View>
              </View>
              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{community.name}</Text>
                  <TouchableOpacity
                    style={styles.calloutButton}
                    onPress={() => handleSelect(community.id, community.name)}
                  >
                    <Text style={styles.calloutButtonText}>Join Community</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
          ))}

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

      <FlatList
        data={communityData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: "center" }}>No communities found.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4ff" },
  mapContainer: { height: "40%", width: "100%" },
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
    color: "#4a4a8c",
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
    backgroundColor: "#fff",
    shadowColor: "#6C63FF",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  itemText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a4a8c",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 60,
  },
  markerLabel: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6C63FF",
    marginBottom: 4,
    zIndex: 1,
  },
  markerLabelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6C63FF",
  },
  markerPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },
  markerPinInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "white",
  },
  calloutContainer: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    width: 180,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#4a4a8c",
    textAlign: "center",
  },
  calloutButton: {
    backgroundColor: "#6C63FF",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  calloutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
