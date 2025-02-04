import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Animated, TextInput, Image, StyleSheet, Text, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Home = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [postText, setPostText] = useState('');
  const searchPosition = useRef(new Animated.Value(-1000)).current; // Start off-screen to the left
  const logoPosition = useRef(new Animated.Value(0)).current; // Start at the original position
  const searchInputRef = useRef(null);

  const userArray = [
    { id: 1, user: 'Arjun', caption: 'He is cool' },
    { id: 2, user: 'Sachive', caption: 'He is not cool' },
    { id: 3, user: 'Deena', caption: 'He is cool somewhat' },
  ];

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

  const handlePost = () => {
    console.log('Posting:', postText);
    setPostText(''); // Clear the input after posting
  };

  const renderItem = ({ item }) => (
    <View style={styles.postCard}>
      <Image
        source={require('../assets/profile_pic.png')} // Use profile picture
        style={styles.postProfileImage}
      />
      <View style={styles.postContent}>
        <Text style={styles.postUser}>{item.user}</Text>
        <Text style={styles.postCaption}>{item.caption}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
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

      {/* Post Section */}
      <View style={styles.postContainer}>
        {/* Round placeholder image */}
        <Image
          source={require('../assets/profile_pic.png')} // Updated to profile_pic.png
          style={styles.profileImage}
        />

        {/* Multiline text input */}
        <TextInput
          style={styles.postInput}
          placeholder="What's on your mind?"
          multiline
          value={postText}
          onChangeText={setPostText}
        />
      </View>

      {/* Post Button */}
      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>

      {/* User Posts Section */}
      <View style={styles.postsContainer}>
        <Text style={styles.postsTitle}>Your Posts....</Text>
        <FlatList
          data={userArray}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7ff',
  },
  headerContainer: {
    width: '100%',
    height: 80, // Reduced header height
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
    width: 150, // Increased logo width
    height: 150, // Increased logo height
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
  postContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Makes the image round
    marginRight: 16, // Space between image and text input
  },
  postInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top', // Ensures multiline starts from the top
    minHeight: 80, // Reduced height of the text area
  },
  postButton: {
    backgroundColor: '#545e75',
    borderRadius: 25, // More rounded corners
    paddingVertical: 10, // Reduced vertical padding
    paddingHorizontal: 20, // Reduced horizontal padding
    marginHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'flex-end', // Align button to the right
    elevation: 3, // Adds shadow on Android
    shadowColor: '#000', // Adds shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  postButtonText: {
    color: 'white',
    fontSize: 14, // Smaller font size
    fontWeight: 'bold',
    textTransform: 'uppercase', // Uppercase text
  },
  postsContainer: {
    flex: 1,
    padding: 16,
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#545e75',
  },
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2, // Adds shadow on Android
    shadowColor: '#000', // Adds shadow on iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  postContent: {
    flex: 1,
  },
  postUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#545e75',
  },
  postCaption: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default Home;