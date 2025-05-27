import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Animated, 
  Easing,
  Image,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Activity = () => {
  const [activeTab, setActiveTab] = useState('offerings');
  const [expandedItems, setExpandedItems] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Community members data
  const communityMembers = {
    '2': {
      name: 'Sarah Smith',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      profession: 'Teacher'
    },
    '3': {
      name: 'Mike Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      profession: 'Engineer'
    },
    '5': {
      name: 'Robert Brown',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      profession: 'Designer'
    },
    '7': {
      name: 'Lisa Taylor',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      profession: 'Handyman'
    },
    '9': {
      name: 'Michael Clark',
      avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
      profession: 'Plumber'
    },
    '10': {
      name: 'Jennifer Lewis',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      profession: 'Nurse'
    }
  };

  // Dummy data - showing community responses to your posts
  const [offeringsData, setOfferingsData] = useState([
    {
      id: '1',
      type: 'product',
      title: 'Lawn Mower',
      description: 'Available for community use on weekends',
      interestedUsers: [
        {
          id: '2',
          message: 'Need it for my backyard this weekend'
        },
        {
          id: '3',
          message: 'Can I borrow it next week?'
        }
      ]
    },
    {
      id: '2',
      type: 'service',
      title: 'Babysitting',
      description: 'Available on weekday evenings',
      interestedUsers: [
        {
          id: '5',
          message: 'Need someone this Friday evening'
        }
      ]
    }
  ]);

  const [requestsData, setRequestsData] = useState([
    {
      id: '3',
      type: 'product',
      title: 'Power Drill',
      description: 'Need for a small home project',
      interestedUsers: [
        {
          id: '7',
          message: 'I have one you can borrow'
        }
      ]
    },
    {
      id: '4',
      type: 'service',
      title: 'Plumbing Help',
      description: 'Need help fixing a leaky faucet',
      interestedUsers: [
        {
          id: '9',
          message: 'I can help with that'
        },
        {
          id: '10',
          message: 'My husband is a plumber, can help'
        }
      ]
    }
  ]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAccept = (itemId, userId) => {
    const user = communityMembers[userId];
    Alert.alert('Accepted', `You've accepted ${user.name}'s response`);
    // Here you would update your backend
  };

  const handleDecline = (itemId, userId) => {
    const user = communityMembers[userId];
    Alert.alert('Declined', `You've declined ${user.name}'s response`);
    // Here you would update your backend
  };

  const renderInterestedUsers = (users, itemId) => {
    return users.map((user, index) => {
      const userDetails = communityMembers[user.id];
      return (
        <Animated.View 
          key={user.id}
          style={[
            styles.interestedUserCard,
            {
              opacity: fadeAnim,
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, (index % 2 === 0 ? -10 : 10)]
                })
              }]
            }
          ]}
        >
          <View style={styles.userInfoContainer}>
            <Image source={{ uri: userDetails.avatar }} style={styles.userAvatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userDetails.name}</Text>
              <Text style={styles.userProfession}>{userDetails.profession}</Text>
              <Text style={styles.userMessage}>{user.message}</Text>
            </View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAccept(itemId, user.id)}
            >
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleDecline(itemId, user.id)}
            >
              <Text style={styles.actionButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    });
  };

  const renderItem = ({ item }) => (
    <Animated.View 
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity onPress={() => toggleExpand(item.id)}>
        <View style={styles.cardHeader}>
          <View style={styles.cardContent}>
            <Text style={styles.typeBadge}>{item.type}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
          <Ionicons 
            name={expandedItems[item.id] ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#666" 
          />
        </View>
      </TouchableOpacity>

      {expandedItems[item.id] && (
        <View style={styles.interestedUsersContainer}>
          <Text style={styles.interestedTitle}>
            {item.interestedUsers.length} {item.interestedUsers.length === 1 ? 'response' : 'responses'}
          </Text>
          {renderInterestedUsers(item.interestedUsers, item.id)}
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Responses</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'offerings' && styles.activeTab]}
          onPress={() => setActiveTab('offerings')}
        >
          <Text style={[styles.tabText, activeTab === 'offerings' && styles.activeTabText]}>
            Your Offerings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Your Requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === 'offerings' ? offeringsData : requestsData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No responses to your {activeTab} yet
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  interestedUsersContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 15,
  },
  interestedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  interestedUserCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  userInfoContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 2,
  },
  userProfession: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  userMessage: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6c757d',
  },
});

export default Activity;