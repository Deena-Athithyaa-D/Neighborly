import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Animated, TextInput, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Home = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchPosition = useRef(new Animated.Value(-1000)).current; // Start off-screen to the left
  const logoPosition = useRef(new Animated.Value(0)).current; // Start at the original position
  const searchInputRef = useRef(null);

  const toggleSearch = () => {
    const toValue = !isSearching;

    Animated.parallel([
      Animated.timing(searchPosition, {
        toValue: toValue ? 0 : -1000, // Slide search bar in from the left
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(logoPosition, {
        toValue: toValue ? -1000 : 0, // Slide logo out to the left
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (toValue) {
        searchInputRef.current?.focus();
      } else {
        setSearchText('');
      }
    });

    setIsSearching(toValue);
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        {/* Logo on the left */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ translateX: logoPosition }], // Slide logo out
            },
          ]}
        >
          <Image
            source={require('../assets/logo.png')} // Replace with your logo path
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Search icon or back arrow on the right */}
        <TouchableOpacity onPress={toggleSearch} style={styles.iconContainer}>
          <Icon
            name={isSearching ? 'arrow-back' : 'search'} // Show back arrow when searching
            size={28}
            color="white"
          />
        </TouchableOpacity>

        {/* Search bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              transform: [{ translateX: searchPosition }], // Slide search bar in
              paddingLeft: 80, // Add padding to avoid overlap with the icon
              paddingRight: 16, // Add padding on the right
              marginRight: 60, // Add margin to create space for the icon
            },
          ]}
        >
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => console.log('Search:', searchText)}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: 128, // h-32 equivalent (32 * 4 = 128)
    backgroundColor: '#545e75',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16, // p-4 equivalent (4 * 4 = 16)
    height: '100%',
  },
  logoContainer: {
    height: '100%',
    justifyContent: 'center',
  },
  logoImage: {
    width: 96, // w-24 equivalent (24 * 4 = 96)
    height: 96, // h-24 equivalent (24 * 4 = 96)
  },
  iconContainer: {
    zIndex: 10,
    marginLeft: 16, // ml-4 equivalent (4 * 4 = 16)
  },
  searchContainer: {
    height: '100%',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8, // rounded-lg equivalent
    paddingHorizontal: 16, // px-4 equivalent (4 * 4 = 16)
    paddingVertical: 8, // py-2 equivalent (2 * 4 = 8)
    width: '100%',
  },
});

export default Home;