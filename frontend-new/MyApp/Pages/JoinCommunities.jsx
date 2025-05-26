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

const listData = [
  { id: "1", name: "Community A", latitude: 13.0827, longitude: 80.2707 },
  { id: "2", name: "Community B", latitude: 13.0828, longitude: 80.271 },
  { id: "3", name: "Community C", latitude: 13.083, longitude: 80.2715 },
];

export default function JoinCommunities() {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(
    "Join a Community Near You"
  );
  const [refresh, setRefresh] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const navigation = useNavigation();

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

  const handleSelect = (id, name, latitude, longitude) => {
    Alert.alert("Join Community", `Would you like to join "${name}"?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
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
      onPress={() =>
        handleSelect(item.id, item.name, item.latitude, item.longitude)
      }
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
            latitude: 13.0827,
            longitude: 80.2707,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {listData.map((community) => (
            <Marker
              key={community.id}
              coordinate={{
                latitude: community.latitude,
                longitude: community.longitude,
              }}
              onPress={() =>
                handleSelect(
                  community.id,
                  community.name,
                  community.latitude,
                  community.longitude
                )
              }
            >
              <Callout>
                <Text style={styles.markerLabelText}>{community.name}</Text>
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
        data={listData}
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
    backgroundColor: "#f0f4ff", // light bluish background
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
    justifyContent: "center",
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
  markerLabelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
});
