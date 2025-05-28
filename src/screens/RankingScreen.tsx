import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import API from '../api/axios';         // axios 인스턴스
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RankingScreenProps {
  navigation: any;
}

interface FriendRank {
  name: string;
  point: number;
}

interface User {
  id: string;
  name: string;
  quizScore: number;
  rank?: number;
}

// const RankingScreen: React.FC<RankingScreenProps> = ({ navigation }) => {
//   const [rankingData, setRankingData] = useState<User[]>([
//     { id: '1', name: '김철수', quizScore: 950 },
//     { id: '2', name: '박영희', quizScore: 920 },
//     { id: '3', name: '이민준', quizScore: 870 },
//     { id: '4', name: '정수진', quizScore: 850 },
//     { id: '5', name: '한지민', quizScore: 820 },
//     { id: '6', name: '최재현', quizScore: 780 },
//     { id: '7', name: '장서연', quizScore: 750 },
//     { id: '8', name: '윤도윤', quizScore: 720 },
//     { id: '9', name: '강하늘', quizScore: 700 },
//     { id: '10', name: '조은별', quizScore: 650 },
//   ]);
const RankingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [rankingData, setRankingData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        const res = await API.get<{
          status: number;
          message: string;
          data: FriendRank[];
        }>('/friends/rank', {
          headers: { Authorization: token! },
        });
    // 1) API에서 받은 data 배열
    const raw: FriendRank[] = res.data.data;

    // 2) point 내림차순 정렬
    const sorted = raw
      .slice()
      .sort((a, b) => b.point - a.point)
      .map((u, idx) => ({
        id: `${idx}`,        // keyExtractor 용
        name: u.name,
        quizScore: u.point,
        rank: idx + 1,
      }));

    setRankingData(sorted);
  } catch (e) {
    console.error('랭킹 로드 에러', e);
    // 실패 시 사용자에게 알려주어도 좋습니다.
  } finally {
    setLoading(false);
  }
})();
}, []);

  const renderRankItem = ({ item, index }: { item: User; index: number }) => {
    // 상위 3위까지는 특별한 스타일 적용
    const isTopThree = index < 3;
    
    return (
      <View style={styles.rankItem}>
        <View style={styles.rankContainer}>
          {isTopThree ? (
            <View 
              style={[
                styles.topRankCircle, 
                index === 0 ? styles.firstRank : 
                index === 1 ? styles.secondRank : styles.thirdRank
              ]}
            >
              <Text style={styles.topRankText}>{item.rank}</Text>
            </View>
          ) : (
            <Text style={styles.rankText}>{item.rank}</Text>
          )}
        </View>
        
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.scoreText}>{item.quizScore}점</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} title="친구 랭킹" />
      
      <View style={styles.content}>
        <View style={styles.rankingHeader}>
          <Text style={styles.rankingTitle}>퀴즈 점수 랭킹</Text>
          <Text style={styles.rankingSubtitle}>친구들 중에서 퀴즈 왕은?</Text>
        </View>
        
        <FlatList
          data={rankingData}
          renderItem={renderRankItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
      
      <BottomNavigation navigation={navigation} currentScreen="Ranking" />
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
  rankingHeader: {
    padding: 20,
    backgroundColor: '#6B7C1C',
    alignItems: 'center',
  },
  rankingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  rankingSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  listContainer: {
    padding: 15,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  topRankCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstRank: {
    backgroundColor: '#FFD700', // 금색
  },
  secondRank: {
    backgroundColor: '#C0C0C0', // 은색
  },
  thirdRank: {
    backgroundColor: '#CD7F32', // 동색
  },
  topRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#90BBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  starIcon: {
    fontSize: 14,
    color: '#FFD700',
  },
});

export default RankingScreen; 