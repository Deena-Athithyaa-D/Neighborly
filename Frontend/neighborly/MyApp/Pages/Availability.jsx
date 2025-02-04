import React, { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

const AvailabilityPage = () => {
  // State to manage availability for each day
  const [availability, setAvailability] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });

  // Function to toggle availability for a specific day
  const toggleAvailability = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your Availability</Text>

      {/* Availability Toggles for Each Day */}
      {Object.keys(availability).map((day) => (
        <View key={day} style={styles.dayContainer}>
          <Text style={styles.dayText}>{day}</Text>
          <Switch
            value={availability[day]}
            onValueChange={() => toggleAvailability(day)}
            trackColor={{ false: "#767577", true: "#6C63FF" }}
            thumbColor={availability[day] ? "#fff" : "#f4f3f4"}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  dayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dayText: {
    fontSize: 18,
    color: "#333",
  },
});

export default AvailabilityPage;