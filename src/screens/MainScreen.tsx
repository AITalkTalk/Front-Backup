import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

interface MainScreenProps {
  navigation: any;
}

const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const handleNavigation = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#6B7C1C" barStyle="light-content" />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>아이똑똑</Text>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => handleNavigation('MyPage')}
          >
            <Text style={styles.profileText}>마이페이지</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>안녕하세요!</Text>
          <Text style={styles.welcomeSubText}>오늘 AI와 함께 무엇을 하고 싶나요?</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => handleNavigation('Chat')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#90BBFF' }]}>
              <Text style={styles.menuIconText}>💬</Text>
            </View>
            <Text style={styles.menuText}>AI와 대화하기</Text>
            <Text style={styles.menuDescription}>AI와 자유롭게 대화하고 오늘의 일을 기록해보세요</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => handleNavigation('Quiz')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#B8CCFF' }]}>
              <Text style={styles.menuIconText}>❓</Text>
            </View>
            <Text style={styles.menuText}>퀴즈 풀기</Text>
            <Text style={styles.menuDescription}>재미있는 퀴즈로 새로운 지식을 배워보세요</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => handleNavigation('Friends')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#6B7C1C' }]}>
              <Text style={styles.menuIconText}>👨‍👩‍👧‍👦</Text>
            </View>
            <Text style={styles.menuText}>친구</Text>
            <Text style={styles.menuDescription}>친구들과 함께 즐겁게 배우고 경쟁해보세요</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => handleNavigation('Ranking')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#BBCCFF' }]}>
              <Text style={styles.menuIconText}>🏆</Text>
            </View>
            <Text style={styles.menuText}>랭킹</Text>
            <Text style={styles.menuDescription}>친구들 중 최고의 퀴즈 왕은 누구일까요?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <BottomNavigation navigation={navigation} currentScreen="Friends" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DAE6DD',
  },
  headerContainer: {
    backgroundColor: '#6B7C1C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileText: {
    color: '#fff',
    fontWeight: '500',
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  welcomeContainer: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  welcomeSubText: {
    fontSize: 16,
    color: '#666',
  },
  menuContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  menuIconText: {
    fontSize: 24,
  },
  menuText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default MainScreen; 