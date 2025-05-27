import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const Comments = ({ post, onClose, onAddComment }) => {
  const [comments, setComments] = useState([
    {
      id: "1",
      user: "Arjun",
      text: "This looks amazing! Where was this taken?",
      time: "2 hours ago",
      avatar: require("../assets/placeholder.png"),
    },
    {
      id: "2",
      user: "Sachin",
      text: "I was there last week! The sunset is beautiful.",
      time: "1 hour ago",
      avatar: require("../assets/placeholder.png"),
    },
  ]);

  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Math.random().toString(),
      user: "You",
      text: newComment,
      time: "Just now",
      avatar: require("../assets/placeholder.png"),
    };

    setComments([...comments, comment]);
    onAddComment(newComment);
    setNewComment("");
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Image source={item.avatar} style={styles.avatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Icon name="arrow-back" size={24} color="#4267B2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comments</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.commentsList}
        ListHeaderComponent={() => (
          <View style={styles.postPreview}>
            <Text style={styles.postCaption}>{post.caption}</Text>
            {post.hasImage && (
              <Image source={{ uri: post.imageUri }} style={styles.postImage} />
            )}
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Write a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
          <Icon name="send" size={20} color="#4267B2" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e4ecfb", // selago - soft light blue background (main bg)
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff", // changed to white for header background
    borderBottomWidth: 1,
    borderBottomColor: "#6995ca", // danube - subtle border under header
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#12203a", // big-stone - dark text on white bg
    letterSpacing: 0.5,
  },
  commentsList: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  postPreview: {
    backgroundColor: "#8aa5ca", // polo-blue - muted blue block
    padding: 15,
    borderRadius: 14,
    marginBottom: 20,
  },
  postCaption: {
    fontSize: 16,
    color: "#12203a", // big-stone - dark text for caption
    marginBottom: 12,
    fontWeight: "600",
  },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
  },
  commentContainer: {
    flexDirection: "row",
    marginBottom: 18,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
  },
  commentContent: {
    flex: 1,
    backgroundColor: "#e4ecfb", // selago - light bubble background
    padding: 14,
    borderRadius: 16,
    shadowColor: "#12203a", // big-stone shadow
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  userName: {
    fontWeight: "700",
    color: "#6995ca", // danube - highlight user name
    fontSize: 15,
  },
  time: {
    fontSize: 12,
    color: "#747c84", // rolling-stone - muted time text
    fontStyle: "italic",
  },
  commentText: {
    color: "#12203a", // big-stone - main comment text
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ffffff", // changed to white for input container bg
    borderTopWidth: 1,
    borderTopColor: "#6995ca", // danube - subtle top border on input container
  },
  input: {
    flex: 1,
    backgroundColor: "#6995ca", // cadet-blue - subtle input bg
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    color: "#12203a", // big-stone - dark input text
    maxHeight: 90,
  },
  sendButton: {
    marginLeft: 12,
    padding: 8,
  },
});

export default Comments;
