import React, { useState } from 'react';
import { SafeAreaView, FlatList, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// Dummy JSON data
const dummyData = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
  { id: '3', name: 'Item 3' },
  { id: '4', name: 'Item 4' },
  { id: '5', name: 'Item 5' },
];

export default function Communities() {
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 12.838,
            longitude: 80.0782,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Add Markers if needed */}
          <Marker
            coordinate={{ latitude: 12.838, longitude: 80.0782 }}
            title="Marker Title"
            description="Marker Description"
          />
        </MapView>
      </View>

      {/* List Container */}
      <FlatList
        data={dummyData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
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
});