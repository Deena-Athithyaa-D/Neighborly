import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // For image upload
import Icon from "react-native-vector-icons/MaterialIcons";
import RequestBtn from "./RequestBtn";
// import Noaimge from "../assets/noImage.png";
const AvailabilityUpload = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [showInputSection, setShowInputSection] = useState(false);
  const [items, setItems] = useState([
    // Original dummy JSON data
    {
      id: "1",
      name: "Product 1",
      description: "This is a sample product.",
      image: "https://via.placeholder.com/150", // Placeholder image
      type: "product",
    },
    {
      id: "2",
      name: "Service 1",
      description: "This is a sample service.",
      image: "https://via.placeholder.com/150", // Placeholder image
      type: "service",
    },
  ]);
  const [itemType, setItemType] = useState("product"); // Toggle between 'product' and 'service'

  // Function to handle image upload with 1:1 aspect ratio cropping
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access the camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Ensure the image is cropped to a 1:1 ratio
      quality: 1,
    });

    if (!result.cancelled && result.uri) {
      // Check if the result has a valid URI
      setImage(result.uri); // Set the image URI
    }
  };

  // Function to handle adding a new item
  const handleAddItem = () => {
    // Trim the input fields to remove any extra spaces and check for emptiness
    if (!name.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    const newItem = {
      id: Date.now().toString(), // Unique ID for each item
      name: name.trim(),
      description: description.trim(),
      image: image || "https://via.placeholder.com/150", // Use placeholder if no image is uploaded
      type: itemType, // Add the selected type (product or service)
    };

    // Add new item to the beginning of the list
    setItems((prevItems) => [newItem, ...prevItems]); // Add new item at the top
    setName(""); // Reset name
    setDescription(""); // Reset description
    setImage(null); // Reset image
    setShowInputSection(false); // Hide input section after adding
  };

  // Render each item in the list
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <Text style={styles.itemType}>
          {item.type === "product" ? "Product" : "Service"}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resource Upload</Text>
      </View>

      {/* Previous Items Section */}
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Your Previous Items</Text>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} // Disable scrolling for FlatList inside ScrollView
        />
      </ScrollView>

      {/* Add New Item Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowInputSection(true)}
      >
        <Icon name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add New Item</Text>
      </TouchableOpacity>

      {/* Input Section (Shown when "Add New Item" is pressed) */}
      {showInputSection && (
        <View style={styles.inputSection}>
          <Text style={styles.inputSectionTitle}>Add New Item</Text>

          {/* Toggle for Product or Service */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                itemType === "product" && styles.toggleButtonActive,
              ]}
              onPress={() => setItemType("product")}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  itemType === "product" && styles.toggleButtonTextActive,
                ]}
              >
                Product
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                itemType === "service" && styles.toggleButtonActive,
              ]}
              onPress={() => setItemType("service")}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  itemType === "service" && styles.toggleButtonTextActive,
                ]}
              >
                Service
              </Text>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <TextInput
            style={styles.input}
            placeholder="Item Name"
            value={name}
            onChangeText={setName}
          />

          {/* Description Input */}
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Description (max 50 words)"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={50}
          />

          {/* Image Upload */}
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={pickImage}
          >
            <Text style={styles.imageUploadText}>
              {image ? "Change Image" : "Upload Image"}
            </Text>
          </TouchableOpacity>

          {/* Display Selected Image */}
          {image && (
            <Image source={{ uri: image }} style={styles.selectedImage} />
          )}

          {/* Add Item Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleAddItem}>
            <Text style={styles.submitButtonText}>Add Item</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowInputSection(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7ff",
  },
  header: {
    backgroundColor: "#545e75",
    padding: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#545e75",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#545e75",
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  itemType: {
    fontSize: 12,
    color: "#6C63FF",
    marginTop: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 25,
    padding: 12,
    margin: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  inputSection: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    margin: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  inputSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#545e75",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  toggleButtonActive: {
    backgroundColor: "#6C63FF",
  },
  toggleButtonText: {
    color: "#545e75",
    fontSize: 16,
    fontWeight: "bold",
  },
  toggleButtonTextActive: {
    color: "white",
  },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },
  imageUploadButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  imageUploadText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#545e75",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#545e75",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AvailabilityUpload;
