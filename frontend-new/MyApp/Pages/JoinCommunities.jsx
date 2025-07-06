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
  TextInput,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import { MaterialIcons } from "@expo/vector-icons";

export default function JoinCommunities() {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(
    "Join a Community Near You"
  );
  const [refresh, setRefresh] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [communityData, setCommunityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [referralModalVisible, setReferralModalVisible] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [pendingCommId, setPendingCommId] = useState(null);
  const [pendingCommName, setPendingCommName] = useState("");
  const [userId, setUserId] = useState(null);
  const mapRef = useRef(null);
  const navigation = useNavigation();

  const checkAuth = async () => {
    try {
      const uuid = await SecureStore.getItemAsync("uuid");
      if (!uuid) {
        navigation.navigate("Auth");
        return;
      }
      setUserId(uuid);
    } catch (error) {
      console.error("Error checking auth:", error);
      navigation.navigate("Auth");
    }
  };

  const getUserLocation = async () => {
    try {
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

      const response = await fetch(
        `https://34ed-171-79-48-24.ngrok-free.app/api/get_communities/${userLoc.latitude}/${userLoc.longitude}`
      );

      const data = await response.json();
      const formatted = data.map((item) => ({
        id: String(item.id),
        name: item.comm_name,
        latitude: item.latitude,
        longitude: item.longtitude,
        location: item.location,
      }));

      setCommunityData(formatted);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to fetch data.");
    } finally {
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
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      getUserLocation();
    }
  }, [userId]);

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
    setPendingCommId(id);
    setPendingCommName(name);
    setReferralModalVisible(true);
  };

  const joinCommunity = async (comm_id, referral_code) => {
    if (!userId) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      const res = await fetch(
        "https://34ed-171-79-48-24.ngrok-free.app/api/create_join",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            comm_id: comm_id,
            referral_code: referral_code,
            is_admin: 0,
          }),
        }
      );

      const result = await res.json();

      if (res.ok) {
        Alert.alert("Joined!", `You've successfully joined ${pendingCommName}`);
        setReferralModalVisible(false);
        setReferralCode("");
        navigation.navigate("MainTabs", { screen: "Home" });
      } else {
        Alert.alert("Error", result.message || "Failed to join community");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item.id, item.name)}
      style={styles.item}
    >
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={{ color: "#666" }}>{item.location}</Text>
    </TouchableOpacity>
  );

  if (!userId) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
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

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#6C63FF"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={communityData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          extraData={refresh}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {referralModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Referral Code</Text>
            <TextInput
              placeholder="Referral Code"
              value={referralCode}
              onChangeText={setReferralCode}
              style={styles.input}
              placeholderTextColor="#888"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setReferralModalVisible(false);
                  setReferralCode("");
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!referralCode.trim()) {
                    Alert.alert("Please enter a referral code.");
                    return;
                  }
                  joinCommunity(pendingCommId, referralCode.trim());
                }}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmText}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  markerContainer: {
    backgroundColor: "white",
    padding: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4a4a8c",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    color: "#000",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    padding: 10,
  },
  confirmButton: {
    backgroundColor: "#6C63FF",
    padding: 10,
    borderRadius: 5,
  },
  cancelText: {
    color: "#888",
    fontWeight: "600",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
  },
});