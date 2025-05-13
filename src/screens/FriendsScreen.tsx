import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

interface FriendsScreenProps {
  navigation: any;
}

interface Friend {
  id: string;
  name: string;
  quizScore: number;
}

interface FriendRequest {
  id: string;
  name: string;
  type: 'sent' | 'received';
}

const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', name: '김철수', quizScore: 85 },
    { id: '2', name: '박영희', quizScore: 92 },
    { id: '3', name: '이민준', quizScore: 78 },
  ]);
  
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([
    { id: '4', name: '정수진', type: 'received' },
    { id: '5', name: '한지민', type: 'sent' },
  ]);

  const handleSearch = () => {
    if (searchText.trim() === '') {
      Alert.alert('알림', '검색할 아이디를 입력해주세요.');
      return;
    }

    // 검색 로직 (백엔드 연동 필요)
    // 여기서는 간단히 랜덤으로 사용자를 찾았다고 가정
    if (Math.random() > 0.5) {
      Alert.alert(
        '사용자 찾음',
        `"${searchText}" 사용자를 찾았습니다. 친구 요청을 보내시겠습니까?`,
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '요청 보내기',
            onPress: () => {
              // 친구 요청 보내기 로직 (백엔드 연동 필요)
              setFriendRequests([
                ...friendRequests,
                { id: Date.now().toString(), name: searchText, type: 'sent' },
              ]);
              setSearchText('');
              Alert.alert('성공', '친구 요청을 보냈습니다.');
            },
          },
        ]
      );
    } else {
      Alert.alert('알림', `"${searchText}" 사용자를 찾을 수 없습니다.`);
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = friendRequests.find((r) => r.id === requestId);
    if (request) {
      // 친구 추가 로직 (백엔드 연동 필요)
      setFriends([
        ...friends,
        { id: request.id, name: request.name, quizScore: 0 },
      ]);
      // 요청 목록에서 제거
      setFriendRequests(friendRequests.filter((r) => r.id !== requestId));
      Alert.alert('성공', `${request.name}님의 친구 요청을 수락했습니다.`);
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    // 요청 거절 로직 (백엔드 연동 필요)
    setFriendRequests(friendRequests.filter((r) => r.id !== requestId));
    Alert.alert('알림', '친구 요청을 거절했습니다.');
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendScore}>퀴즈 점수: {item.quizScore}</Text>
      </View>
    </View>
  );

  const renderRequestItem = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.requestType}>
          {item.type === 'received' ? '요청을 보냈습니다' : '요청을 받았습니다'}
        </Text>
      </View>
      {item.type === 'received' ? (
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.requestButton, styles.acceptButton]}
            onPress={() => handleAcceptRequest(item.id)}
          >
            <Text style={styles.requestButtonText}>수락</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.requestButton, styles.declineButton]}
            onPress={() => handleDeclineRequest(item.id)}
          >
            <Text style={styles.requestButtonText}>거절</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.requestButton, styles.cancelButton]}
          onPress={() => handleDeclineRequest(item.id)}
        >
          <Text style={styles.requestButtonText}>취소</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} title="친구" />
      
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="친구 아이디 검색"
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'friends' && styles.activeTabText,
              ]}
            >
              친구 목록
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'requests' && styles.activeTabText,
              ]}
            >
              친구 요청
              {friendRequests.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{friendRequests.length}</Text>
                </View>
              )}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'friends' ? (
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>아직 친구가 없습니다.</Text>
            }
          />
        ) : (
          <FlatList
            data={friendRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>친구 요청이 없습니다.</Text>
            }
          />
        )}
      </View>
      
      <BottomNavigation navigation={navigation} currentScreen="Friends" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DAE6DD',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: '#6B7C1C',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6B7C1C',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6B7C1C',
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -15,
    backgroundColor: '#ff3b30',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#90BBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  friendAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  friendScore: {
    fontSize: 14,
    color: '#666',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  requestType: {
    fontSize: 14,
    color: '#666',
  },
  requestActions: {
    flexDirection: 'row',
  },
  requestButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 5,
  },
  acceptButton: {
    backgroundColor: '#6B7C1C',
  },
  declineButton: {
    backgroundColor: '#F44336',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 30,
    color: '#666',
  },
  searchButtonText: {
    fontSize: 20,
    color: '#fff',
  },
});

export default FriendsScreen; 