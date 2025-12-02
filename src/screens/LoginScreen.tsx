import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import API from '../api/axios'; // 수정된 import
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // 추후 백엔드 연동 구현
    if (id.trim() === '' || password.trim() === '') {
      Alert.alert('경고', '아이디와 비밀번호를 입력해주세요.');
      return;
    }
    try {
      const res = await API.post('/sign-in', {
        id,
        password,
      });
      // 201 or 200 으로 응답 돌아오면 성공 처리
      if (res.status === 200) {
         // Swagger 예시대로 res.data = { status, message, data: { grantType, accessToken, refreshToken } }
        const { grantType, accessToken, refreshToken } = res.data.data;

        // "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        const fullToken = `${grantType} ${accessToken}`;

        // 토큰 저장
        await AsyncStorage.setItem('jwt', fullToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        Alert.alert('로그인 성공', '메인 화면으로 이동합니다.', [
          { text: '확인', onPress: () => navigation.navigate('Main') },
        ]);
      } else {
        Alert.alert('로그인 실패', `서버 응답 코드: ${res.status}`);
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        '알 수 없는 오류가 발생했습니다.';
      Alert.alert('로그인 실패', msg);
    }
    // 성공적인 로그인 가정 - 메인 화면으로 이동
    // navigation.navigate('Main');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#6B7C1C" barStyle="light-content" />
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>아이똑똑</Text>
        <Text style={styles.subtitleText}>AI와 함께하는 대화, 퀴즈, 친구</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="아이디"
          value={id}
          onChangeText={setId}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>계정이 없으신가요?</Text>
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.signupButton}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DAE6DD',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 50,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#6B7C1C',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6B7C1C',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 16,
    color: '#666',
  },
  signupButton: {
    fontSize: 16,
    color: '#6B7C1C',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default LoginScreen; 