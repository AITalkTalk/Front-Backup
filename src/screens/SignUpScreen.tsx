import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';

import API from '../api/axios'; // 수정된 import
import Config from 'react-native-config';
console.log('API_URL=', Config.API_URL);
interface SignUpScreenProps {
  navigation: any;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [secret, setSecret] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  const interestOptions = ['학업', '친구', '건강', '가정'];

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(item => item !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSignUp = async () => {
    // 기본 유효성 검사
    if (id.trim() === '' || password.trim() === '' || name.trim() === '' || age.trim() === '' || secret.trim() === '') {
      Alert.alert('경고', '모든 필수 항목을 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('경고', '비밀번호가 일치하지 않습니다.');
      return;
    }

    if (interests.length === 0) {
      Alert.alert('경고', '최소 한 개 이상의 관심 분야를 선택해주세요.');
      return;
    }

    try {
      const res = await API.post('/sign-up', {
        id,
        password,
        name, 
        age: parseInt(age, 10),
        secret,
        interest: interests.join(','),
      });
      // 201 or 200 으로 응답 돌아오면 성공 처리
      if (res.status === 201 || res.status === 200) {
        Alert.alert('회원가입 성공', '이제 로그인해주세요.', [
          { text: '확인', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('회원가입 실패', `서버 응답 코드: ${res.status}`);
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        '알 수 없는 오류가 발생했습니다.';
      Alert.alert('회원가입 실패', msg);
    }

    // // 회원가입 성공 후 로그인 화면으로 이동
    // Alert.alert('성공', '회원가입이 완료되었습니다. 로그인해주세요.', [
    //   { text: '확인', onPress: () => navigation.navigate('Login') }
    // ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#6B7C1C" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>회원가입</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>아이디</Text>
          <TextInput
            style={styles.input}
            placeholder="아이디를 입력하세요"
            value={id}
            onChangeText={setId}
            autoCapitalize="none"
          />
          
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호를 다시 입력하세요"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.input}
            placeholder="이름을 입력하세요"
            value={name}
            onChangeText={setName}
          />
          
          <Text style={styles.label}>나이</Text>
          <TextInput
            style={styles.input}
            placeholder="나이를 입력하세요"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          <Text style={styles.label}>대화 확인용 비밀번호</Text>
         <TextInput
            style={styles.input}
            placeholder="비밀번호를 입력하세요"
            value={secret}
            onChangeText={setSecret}
            secureTextEntry
          />
          
          <Text style={styles.label}>관심 분야 (1개 이상 선택)</Text>
          <View style={styles.interestsContainer}>
            {interestOptions.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestButton,
                  interests.includes(interest) && styles.interestButtonSelected
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text 
                  style={[
                    styles.interestButtonText,
                    interests.includes(interest) && styles.interestButtonTextSelected
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>가입하기</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DAE6DD',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B7C1C',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  interestButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  interestButtonSelected: {
    backgroundColor: '#90BBFF',
  },
  interestButtonText: {
    fontSize: 14,
    color: '#333',
  },
  interestButtonTextSelected: {
    color: '#fff',
  },
  signUpButton: {
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
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default SignUpScreen; 