import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

interface BottomNavigationProps {
  navigation: any;
  currentScreen: 'Friends' | 'Quiz' | 'Chat' | 'Ranking' | 'MyPage';
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const BottomNavigation: React.FC<BottomNavigationProps> = ({ navigation, currentScreen }) => {
  return (
    <View style={styles.bottomNavigationContainer}>
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={[
            styles.navItem,
            currentScreen === 'Friends' && styles.activeNavItem
          ]}
          onPress={() => navigation.navigate('Friends')}
        >
          <Image 
            source={require('../assets/navigation/friends.png')} 
            style={[
              styles.navIcon,
              currentScreen === 'Friends' && styles.activeIcon
            ]} 
            resizeMode="contain"
          />
          <Text style={[
            styles.navText,
            currentScreen === 'Friends' && styles.activeText
          ]}>친구</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.navItem,
            { marginRight: 30 },
            currentScreen === 'Quiz' && styles.activeNavItem
          ]}
          onPress={() => navigation.navigate('Quiz')}
        >
          <Image 
            source={require('../assets/navigation/quiz.png')} 
            style={[
              styles.navIcon,
              currentScreen === 'Quiz' && styles.activeIcon
            ]} 
            resizeMode="contain"
          />
          <Text style={[
            styles.navText,
            currentScreen === 'Quiz' && styles.activeText
          ]}>퀴즈</Text>
        </TouchableOpacity>
        
        <View style={styles.centerButtonContainer}>
          <TouchableOpacity 
            style={[
              styles.chatButton,
              currentScreen === 'Chat' && styles.activeChatButton
            ]}
            onPress={() => navigation.navigate('Chat')}
          >
            <Image 
              source={require('../assets/navigation/chat.png')} 
              style={styles.chatButtonIcon} 
              resizeMode="contain"
            />
            <Text style={styles.chatButtonText}>대화</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.navItem,
            { marginLeft: 30 },
            currentScreen === 'Ranking' && styles.activeNavItem
          ]}
          onPress={() => navigation.navigate('Ranking')}
        >
          <Image 
            source={require('../assets/navigation/ranking.png')} 
            style={[
              styles.navIcon,
              currentScreen === 'Ranking' && styles.activeIcon
            ]} 
            resizeMode="contain"
          />
          <Text style={[
            styles.navText,
            currentScreen === 'Ranking' && styles.activeText
          ]}>랭킹</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.navItem,
            currentScreen === 'MyPage' && styles.activeNavItem
          ]}
          onPress={() => navigation.navigate('MyPage')}
        >
          <Image 
            source={require('../assets/navigation/settings.png')} 
            style={[
              styles.navIcon,
              currentScreen === 'MyPage' && styles.activeIcon
            ]} 
            resizeMode="contain"
          />
          <Text style={[
            styles.navText,
            currentScreen === 'MyPage' && styles.activeText
          ]}>설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
  },
  bottomNavigation: {
    backgroundColor: '#6B7C1C',
    flexDirection: 'row',
    height: 72,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    flex: 1,
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
    marginBottom: 2,
  },
  navText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
  activeNavItem: {
    backgroundColor: 'rgba(184, 204, 255, 0.3)',
    borderRadius: 8,
    paddingVertical: 8,
  },
  activeIcon: {
    tintColor: '#B8CCFF',
  },
  activeText: {
    color: '#B8CCFF',
    fontWeight: 'bold',
  },
  centerButtonContainer: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    zIndex: 10,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButton: {
    backgroundColor: '#B8CCFF',
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  activeChatButton: {
    backgroundColor: '#6C96FF',
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatButtonIcon: {
    width: 32,
    height: 32,
    tintColor: '#fff',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default BottomNavigation; 