import React from "react";
import { ActivityIndicator, View, StyleSheet, Modal } from "react-native";

const LoadingOverlay = ({ loading }) => {
  return (
    <Modal transparent={true} animationType="fade" visible={loading}>
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default LoadingOverlay;
