import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// 스크린 임포트
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import MainScreen from '../screens/MainScreen';
import ChatScreen from '../screens/ChatScreen';
import QuizScreen from '../screens/QuizScreen';
import FriendsScreen from '../screens/FriendsScreen';
import RankingScreen from '../screens/RankingScreen';
import MyPageScreen from '../screens/MyPageScreen';
import ChatSummaryScreen from '../screens/ChatSummaryScreen';

// 스택 네비게이터 타입 정의
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
  Chat: undefined;
  Quiz: undefined;
  Friends: undefined;
  Ranking: undefined;
  MyPage: undefined;
  ChatSummary: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#fff' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Friends" component={FriendsScreen} />
        <Stack.Screen name="Ranking" component={RankingScreen} />
        <Stack.Screen name="MyPage" component={MyPageScreen} />
        <Stack.Screen name="ChatSummary" component={ChatSummaryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 