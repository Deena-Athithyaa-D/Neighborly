import React, { useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  TextInput,
  Image,
  StyleSheet,
  Text,
  FlatList,
  ScrollView,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import Comments from "../Components/Comments";

const Home = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [postText, setPostText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const searchPosition = useRef(new Animated.Value(-1000)).current;
  const logoPosition = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef(null);

  const [communityPosts, setCommunityPosts] = useState([
    {
      id: 1,
      user: "Arjun",
      caption: "Just picked up groceries from the supermarket",
      hasImage: false,
      likes: 12,
      isLiked: false,
      comments: 3,
      time: "2 hours ago",
    },
    {
      id: 2,
      user: "Sachin",
      caption: "Check out this cool place I found!",
      hasImage: true,
      imageUri: "https://picsum.photos/500/300",
      likes: 45,
      isLiked: true,
      comments: 8,
      time: "5 hours ago",
    },
  ]);

  const toggleSearch = () => {
    const toValue = !isSearching;

    Animated.parallel([
      Animated.timing(searchPosition, {
        toValue: toValue ? 0 : -1000,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(logoPosition, {
        toValue: toValue ? -1000 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (toValue) {
        searchInputRef.current?.focus();
      } else {
        setSearchText("");
      }
    });

    setIsSearching(toValue);
  };

  const handlePost = () => {
    if (!postText.trim() && !selectedImage) return;

    const newPost = {
      id: Math.random().toString(),
      user: "You",
      caption: postText,
      hasImage: !!selectedImage,
      imageUri: selectedImage?.uri,
      likes: 0,
      isLiked: false,
      comments: 0,
      time: "Just now",
    };

    setCommunityPosts([newPost, ...communityPosts]);
    setPostText("");
    setSelectedImage(null);
  };

  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setSelectedImage(result);
    }
  };

  const toggleLike = (postId) => {
    setCommunityPosts(
      communityPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked,
          };
        }
        return post;
      })
    );
  };

  const openComments = (post) => {
    setSelectedPost(post);
    setShowComments(true);
  };

  const addComment = (commentText) => {
    if (!commentText.trim()) return;

    const updatedPosts = communityPosts.map((post) => {
      if (post.id === selectedPost.id) {
        return {
          ...post,
          comments: post.comments + 1,
        };
      }
      return post;
    });

    setCommunityPosts(updatedPosts);
    setShowComments(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image
          source={require("../assets/placeholder.png")}
          style={styles.postProfileImage}
        />
        <View style={styles.postUserInfo}>
          <Text style={styles.postUser}>{item.user}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
      </View>

      <Text style={styles.postCaption}>{item.caption}</Text>

      {item.hasImage && (
        <Image source={{ uri: item.imageUri }} style={styles.postImage} />
      )}

      <View style={styles.postStats}>
        <Text style={styles.postStatText}>{item.likes} likes</Text>
        <Text style={styles.postStatText}>{item.comments} comments</Text>
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.postActionButton}
          onPress={() => toggleLike(item.id)}
        >
          <Icon
            name={item.isLiked ? "thumb-up" : "thumb-up-off-alt"}
            size={20}
            color={item.isLiked ? "#6b98d3" : "#666"}
          />
          <Text
            style={[
              styles.postActionText,
              { color: item.isLiked ? "#6b98d3" : "#666" },
            ]}
          >
            Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postActionButton}
          onPress={() => openComments(item)}
        >
          <Icon name="chat-bubble-outline" size={20} color="#666" />
          <Text style={styles.postActionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.postActionButton}>
          <Icon name="share" size={20} color="#666" />
          <Text style={styles.postActionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Post Creation */}
      <ScrollView>
        <View style={styles.createPostContainer}>
          <Image
            source={require("../assets/placeholder.png")}
            style={styles.createPostProfileImage}
          />

          <View style={styles.postInputContainer}>
            <TextInput
              style={styles.postInput}
              placeholder="What's on your mind?"
              placeholderTextColor="#6b98d3"
              value={postText}
              onChangeText={setPostText}
            />
          </View>

          <TouchableOpacity onPress={handleSelectImage}>
            <Icon name="photo-camera" size={24} color="#6b98d3" />
          </TouchableOpacity>
        </View>

        {selectedImage && (
          <View style={styles.selectedImagePreview}>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.selectedImage}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <Icon name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.postButton,
            !postText.trim() && !selectedImage && styles.disabledPostButton,
          ]}
          onPress={handlePost}
          disabled={!postText.trim() && !selectedImage}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>

        {/* Community Posts */}
        <View style={styles.postsContainer}>
          <FlatList
            data={communityPosts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Comments Modal */}
      <Modal
        visible={showComments}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowComments(false)}
      >
        <Comments
          post={selectedPost}
          onClose={() => setShowComments(false)}
          onAddComment={addComment}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6efff", // light blue background
  },
  headerContainer: {
    width: "100%",
    height: 80,
    backgroundColor: "#6b98d3", // blue header if needed
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    height: "100%",
  },
  logoContainer: {
    height: "100%",
    justifyContent: "center",
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  iconContainer: {
    zIndex: 10,
    marginLeft: 16,
  },
  searchContainer: {
    height: "100%",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    right: 0,
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: "100%",
  },
  createPostContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    margin: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  createPostProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postInputContainer: {
    flex: 1,
  },
  postInput: {
    backgroundColor: "#e6efff", // light blue input background
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: "#000",
  },
  postButton: {
    backgroundColor: "#6b98d3", // blue button
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  disabledPostButton: {
    backgroundColor: "#a8b8d1",
  },
  postButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  selectedImagePreview: {
    backgroundColor: "white",
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 10,
    padding: 10,
    position: "relative",
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  postsContainer: {
    padding: 12,
  },
  postCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  postProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postUserInfo: {
    flex: 1,
  },
  postUser: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#3a4a6f",
  },
  postTime: {
    fontSize: 12,
    color: "#8a9bb8",
  },
  postCaption: {
    fontSize: 14,
    color: "#3a4a6f",
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  postStatText: {
    fontSize: 12,
    color: "#6b98d3",
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#dde6f2",
    paddingTop: 6,
  },
  postActionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  postActionText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
});

export default Home;
