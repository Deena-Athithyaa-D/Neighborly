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
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Activity = () => {
  const [activeTab, setActiveTab] = useState('offerings');
  const [expandedItems, setExpandedItems] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Dummy data matching your models
  const [offeringsData, setOfferingsData] = useState([
    {
      id: '1',
      type: 'product',
      title: 'Lawn Mower',
      description: 'Available for community use on weekends',
      user: {
        id: '1',
        name: 'John Doe',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        profession: 'Gardener'
      },
      interestedUsers: [
        {
          id: '2',
          name: 'Sarah Smith',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
          message: 'Need it for my backyard this weekend'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
          message: 'Can I borrow it next week?'
        }
      ]
    },
    {
      id: '2',
      type: 'service',
      title: 'Babysitting',
      description: 'Available on weekday evenings',
      user: {
        id: '4',
        name: 'Emily Davis',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        profession: 'Teacher'
      },
      interestedUsers: [
        {
          id: '5',
          name: 'Robert Brown',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
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
      user: {
        id: '6',
        name: 'David Wilson',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        profession: 'Engineer'
      },
      interestedUsers: [
        {
          id: '7',
          name: 'Lisa Taylor',
          avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
          message: 'I have one you can borrow'
        }
      ]
    },
    {
      id: '4',
      type: 'service',
      title: 'Plumbing Help',
      description: 'Need help fixing a leaky faucet',
      user: {
        id: '8',
        name: 'James Miller',
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        profession: 'Accountant'
      },
      interestedUsers: [
        {
          id: '9',
          name: 'Michael Clark',
          avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
          message: 'I can help with that'
        },
        {
          id: '10',
          name: 'Jennifer Lewis',
          avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
          message: 'My husband is a plumber, can help'
        }
      ]
    }
  ]);

  useEffect(() => {
    // Animation when component mounts
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
    // Simulate refresh
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

  const renderInterestedUsers = (users) => {
    return users.map((user, index) => (
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
        <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userMessage}>{user.message}</Text>
        </View>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </Animated.View>
    ));
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
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.user.name}</Text>
            <Text style={styles.userProfession}>{item.user.profession}</Text>
          </View>
          <Ionicons 
            name={expandedItems[item.id] ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#666" 
          />
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.typeBadge}>{item.type}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </TouchableOpacity>

      {expandedItems[item.id] && (
        <View style={styles.interestedUsersContainer}>
          <Text style={styles.interestedTitle}>
            {item.interestedUsers.length} {item.interestedUsers.length === 1 ? 'person is' : 'people are'} interested
          </Text>
          {renderInterestedUsers(item.interestedUsers)}
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Activity</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'offerings' && styles.activeTab]}
          onPress={() => setActiveTab('offerings')}
        >
          <Text style={[styles.tabText, activeTab === 'offerings' && styles.activeTabText]}>
            Offerings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests
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
            No {activeTab} found in your community
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
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
  },
  userProfession: {
    fontSize: 14,
    color: '#6c757d',
  },
  cardContent: {
    marginTop: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userMessage: {
    fontSize: 13,
    color: '#6c757d',
  },
  contactButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6c757d',
  },
});

export default Activity;