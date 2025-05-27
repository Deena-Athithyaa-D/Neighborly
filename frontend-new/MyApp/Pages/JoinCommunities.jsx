import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";

// Utility: Generate random points within ~2km radius
const generateNearbyCommunities = (userLat, userLng, count = 3) => {
  const radiusInMeters = 2000;
  const earthRadius = 6378137;

  const communities = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radiusInMeters;

    const deltaLat = (distance * Math.cos(angle)) / earthRadius;
    const deltaLng =
      (distance * Math.sin(angle)) /
      (earthRadius * Math.cos((userLat * Math.PI) / 180));

    const newLat = userLat + (deltaLat * 180) / Math.PI;
    const newLng = userLng + (deltaLng * 180) / Math.PI;

    communities.push({
      id: `${i + 1}`,
      name: `Community ${String.fromCharCode(65 + i)}`, // A, B, C
      latitude: newLat,
      longitude: newLng,
    });
  }

  return communities;
};

export default function JoinCommunities() {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(
    "Join a Community Near You"
  );
  const [refresh, setRefresh] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [communityData, setCommunityData] = useState([]);
  const mapRef = useRef(null);
  const navigation = useNavigation();

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const userLoc = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setUserLocation(userLoc);

    const generated = generateNearbyCommunities(
      userLoc.latitude,
      userLoc.longitude
    );
    setCommunityData(generated);
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
      setRefresh((prev) => prev + 1);
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
            >
              <MaterialIcons name="maps-home-work" size={36} color="#6C63FF" />
              <Callout tooltip>
                <View style={styles.markerContainer}>
                  <Text style={styles.markerLabelText}>{community.name}</Text>
                  <MaterialIcons
                    name="maps-home-work"
                    size={36}
                    color="#6C63FF"
                  />
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
        extraData={refresh}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4ff",
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
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
    borderRadius: 8,
    width: "85%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#6C63FF",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a4a8c",
  },
  markerLabelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  iconWrapper: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  calloutContainer: {
    backgroundColor: "white",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
