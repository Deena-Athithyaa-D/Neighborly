import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Alert, Modal, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ExchangeHub() {
  const [activeTab, setActiveTab] = useState("product");
  const [subactiveTab, setsubactiveTab] = useState("lend");
  const [openModal, setOpenModal] = useState(false);

  const [formData, setFormData] = useState({
    type: 'product',
    title: '',
    description: '',
    fromDate: '',
    toDate: '',
    fromTime: '',
    toTime: '',
  });

  const [showDatePicker, setShowDatePicker] = useState({ field: '', show: false, mode: 'date' });

  const req = [
    { id: '1', name: 'John Doe', product: 'Power Drill', description: 'Need for a small home project', type: 'product' },
    { id: '2', name: 'Sarah Smith', product: 'Ladder', description: 'Painting my living room', type: 'service' }
  ];

  const lend = [
    { id: '3', name: 'John Doe', product: 'Lawn Mower', description: 'Available for community use', type: 'product' },
    { id: '4', name: 'John Cena', product: 'Tool Kit', description: 'Not Available for community use', type: 'service' }
  ];

  const onProductPress = () => setActiveTab("product");
  const onServicesPress = () => setActiveTab("services");
  const onLendPress = () => setsubactiveTab("lend");
  const onRequestPress = () => setsubactiveTab("request");

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    Alert.alert('Success', 'Successfully submitted');
    setOpenModal(false);
  };

  const handleCancel = () => {
    Alert.alert('Cancelled', 'Successfully cancelled');
    setOpenModal(false);
  };

  const showPicker = (field, mode) => {
    setShowDatePicker({ field, show: true, mode });
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker({ ...showDatePicker, show: false });
    if (selectedDate) {
      const value = showDatePicker.mode === 'date'
        ? selectedDate.toISOString().split('T')[0]
        : selectedDate.toTimeString().split(' ')[0].slice(0, 5);
      setFormData(prev => ({ ...prev, [showDatePicker.field]: value }));
    }
  };

  return (
    <View>
      {/* Top Tabs */}
      <View style={styles.pageTop}>
        <Pressable onPress={onProductPress} style={styles.pageTopLeft}>
          <Text style={styles.buttonText}>Product</Text>
        </Pressable>
        <Pressable onPress={onServicesPress} style={styles.pageTopRight}>
          <Text style={styles.buttonText}>Services</Text>
        </Pressable>
      </View>

      {/* Sub Tabs */}
      <View style={styles.subTab}>
        <Pressable onPress={onLendPress} style={styles.subButton}>
          <Text style={styles.subButtonText}>Lend</Text>
        </Pressable>
        <Pressable onPress={onRequestPress} style={styles.subButton}>
          <Text style={styles.subButtonText}>Request</Text>
        </Pressable>
      </View>

      {/* Content List */}
      <View style={styles.contentBox}>
        <FlatList
          data={(subactiveTab === "lend" ? lend : req).filter(item => item.type === activeTab)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemBox}>
              <Text style={styles.itemText}>{item.name} - {item.product}</Text>
              <Text style={styles.desc}>{item.description}</Text>
            </View>
          )}
        />
      </View>

      {/* Add Button */}
      <Pressable style={styles.addButton} onPress={() => setOpenModal(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>

      {/* Modal */}
      <Modal visible={openModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Make a Request</Text>

            <Text style={styles.label}>Type:</Text>
            <View style={styles.row}>
              <Pressable onPress={() => handleChange('type', 'product')} style={styles.option}>
                <Text>{formData.type === 'product' ? '[Product]' : 'Product'}</Text>
              </Pressable>
              <Pressable onPress={() => handleChange('type', 'service')} style={[styles.option, { marginLeft: 20 }]}>
                <Text>{formData.type === 'service' ? '[Service]' : 'Service'}</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Title:</Text>
            <TextInput
              value={formData.title}
              onChangeText={(text) => handleChange('title', text)}
              placeholder="Enter title"
              style={styles.input}
            />

            <Text style={styles.label}>Description:</Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              placeholder="Enter description"
              style={styles.input}
            />

            {subactiveTab === 'lend' && (
              <>
                <Text style={styles.label}>From Date:</Text>
                <Pressable onPress={() => showPicker('fromDate', 'date')} style={styles.input}>
                  <Text>{formData.fromDate || 'Select Date'}</Text>
                </Pressable>

                <Text style={styles.label}>To Date:</Text>
                <Pressable onPress={() => showPicker('toDate', 'date')} style={styles.input}>
                  <Text>{formData.toDate || 'Select Date'}</Text>
                </Pressable>

                <Text style={styles.label}>From Time:</Text>
                <Pressable onPress={() => showPicker('fromTime', 'time')} style={styles.input}>
                  <Text>{formData.fromTime || 'Select Time'}</Text>
                </Pressable>

                <Text style={styles.label}>To Time:</Text>
                <Pressable onPress={() => showPicker('toTime', 'time')} style={styles.input}>
                  <Text>{formData.toTime || 'Select Time'}</Text>
                </Pressable>
              </>
            )}

            <View style={styles.row}>
              <Pressable style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitText}>Submit</Text>
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date/Time Picker */}
      {showDatePicker.show && (
        <DateTimePicker
          value={new Date()}
          mode={showDatePicker.mode}
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pageTop: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  pageTopLeft: {
    width: '50%',
    alignItems: 'center',
  },
  pageTopRight: {
    width: '50%',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  subTab: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
  },
  subButton: {
    marginHorizontal: 10,
    backgroundColor: '#d0f0ff',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  subButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contentBox: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  itemBox: {
    backgroundColor: '#e7fbe7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  desc: {
    fontSize: 14,
    color: '#333',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#1e88e5',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    fontSize: 30,
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  option: {
    borderWidth: 1,
    padding: 6,
    borderRadius: 6,
    borderColor: '#aaa',
  },
  submitBtn: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
  },
  cancelBtn: {
    backgroundColor: '#e53935',
    padding: 10,
    borderRadius: 6,
    flex: 1,
  },
  submitText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  cancelText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});
