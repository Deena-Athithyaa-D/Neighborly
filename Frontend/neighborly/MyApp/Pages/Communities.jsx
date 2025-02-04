import React, { useState } from 'react';
import { SafeAreaView, FlatList, Text, TouchableOpacity, StyleSheet, View, Button } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// Dummy JSON data with lat, lng, and name
const dummyData = [
  { id: '1', name: 'Location 1', latitude: 12.838, longitude: 80.0782 },
  { id: '2', name: 'Location 2', latitude: 12.835, longitude: 80.0795 },
  { id: '3', name: 'Location 3', latitude: 12.837, longitude: 80.0778 },
  { id: '4', name: 'Location 4', latitude: 12.836, longitude: 80.0756 },
  { id: '5', name: 'Location 5', latitude: 12.839, longitude: 80.0768 },
];

export default function Communities({ navigation }) {
  const [selectedId, setSelectedId] = useState(null); // Track selected item

  // Handle item selection
  const handleSelect = (id) => {
    setSelectedId(id === selectedId ? null : id); // Toggle selection
  };

  // Render each item in the list
  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedId ? '#6C63FF' : '#fff'; // Highlight selected item
    const textColor = item.id === selectedId ? '#fff' : '#000'; // Change text color

    return (
      <TouchableOpacity onPress={() => handleSelect(item.id)} style={[styles.item, { backgroundColor }]}>
        <Text style={[styles.itemText, { color: textColor }]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  // Render a button at the end of the list
  const renderFooter = () => (
    <View style={styles.footer}>
      <Button
        title="Go to Home"
        onPress={() => navigation.navigate('Homes')} // Navigate to the Home screen
        color="#6C63FF"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 12.838, // Initial map center
            longitude: 80.0782,
            latitudeDelta: 0.01, // Zoomed in for nearby locations
            longitudeDelta: 0.01,
          }}
        >
          {/* Render markers dynamically from dummyData */}
          {dummyData.map((location) => (
            <Marker
              key={location.id}
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title={location.name} // Display name as the marker title
              description={`Lat: ${location.latitude}, Lng: ${location.longitude}`} // Optional description
            />
          ))}
        </MapView>
      </View>

      {/* List Container */}
      <FlatList
        data={dummyData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListFooterComponent={renderFooter} // Add button at the end
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  mapContainer: {
    height: '40%', // Adjust the height as needed
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  item: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
});