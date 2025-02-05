import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";

interface RequestBtnProps {
  customStyle?: ViewStyle; // Allow passing custom styles
}

const RequestBtn: React.FC<RequestBtnProps> = ({ customStyle }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={[styles.button, customStyle]} // Combine default & custom styles
      onPress={() => navigation.navigate("JointRequest")}
    >
      <Text style={styles.text}>+</Text>  
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 50, // Small button width
    height: 50, // Small button height
    borderRadius: 25, // Make it round
    backgroundColor: "violet",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Android shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  text: {
    color: "white",
    fontSize: 24, // Bigger + symbol
    fontWeight: "bold",
  },
});

export default RequestBtn;
