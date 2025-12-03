import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import Voice from '@react-native-community/voice';
import Tts from '../services/GeminiTTS';
import API from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

Tts.setDefaultLanguage('ko-KR');        // 한국어
Tts.setDefaultRate(0.5, true);          // 속도 (0~1)
Tts.setDefaultPitch(1.0);               // 음높이


interface ChatScreenProps {
  navigation: any;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const { height } = Dimensions.get('window');

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '안녕하세요! 오늘 어떻게 지내셨나요?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [hasVoiceInput, setHasVoiceInput] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 새 메시지가 추가될 때마다 스크롤 아래로 이동
    flatListRef.current?.scrollToEnd();
  }, [messages]);

  // 앱 시작시 안드로이드 권한 요청
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: '마이크 사용 권한',
              message: '음성으로 메시지를 입력하기 위해 마이크 사용 권한이 필요합니다.',
              buttonPositive: '확인',
              buttonNegative: '취소',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('권한 거부됨', '음성 인식 기능을 사용할 수 없습니다.');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };

    requestPermissions();
  }, []);

  // Voice 초기화 및 이벤트 리스너 설정
  useEffect(() => {
    // 음성 인식 이벤트 리스너 설정
    Voice.onSpeechStart = () => {
      console.log('음성 인식 시작됨');
      setIsListening(true);
    };

    Voice.onSpeechEnd = () => {
      console.log('음성 인식 종료됨');
      setIsListening(false);
    };

    Voice.onSpeechResults = (e: any) => {
      console.log('음성 인식 결과:', e.value);
      if (e.value && e.value.length > 0) {
        // 가장 긴 결과를 선택 (일반적으로 가장 정확한 결과임)
        const recognizedText = e.value.reduce((longest: string, current: string) => 
          current.length > longest.length ? current : longest
        );
        console.log('최종 인식된 텍스트:', recognizedText);
        // 최종 인식 결과로 텍스트를 완전히 대체
        setVoiceText(recognizedText);
        setHasVoiceInput(true);
        setIsFallback(false);
      }
    };

    Voice.onSpeechPartialResults = (e: any) => {
      console.log('음성 인식 부분 결과:', e.value);
      if (e.value && e.value.length > 0) {
        // 가장 긴 부분 결과를 선택
        const partialText = e.value.reduce((longest: string, current: string) => 
          current.length > longest.length ? current : longest
        );
        console.log('부분 인식 텍스트:', partialText);
        
        // 부분 인식 결과를 임시 표시
        setVoiceText(`${partialText} (typing...)`);
      }
    };

    Voice.onSpeechError = (e: any) => {
      console.error('음성 인식 에러:', e);
      setIsListening(false);
      
      // 에러 발생시 폴백 메커니즘 활성화
      if (!hasVoiceInput) {
        // useFallbackMechanism();
      }
    };

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (simulationTimerRef.current) {
        clearTimeout(simulationTimerRef.current);
      }
      
      try {
        Voice.removeAllListeners();
        Voice.destroy().catch(e => {
          console.error('Voice 정리 오류:', e);
        });
      } catch (e) {
        console.error('Voice 정리 중 예외 발생:', e);
      }
    };
  }, [hasVoiceInput]);

  const handleSendMessage = async (overrideText?: string) => {
    const messageText = overrideText ?? inputText.trim();
    if (!messageText) return;
  
    // 1) 사용자 메시지 화면에 추가
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setVoiceText('');
    setHasVoiceInput(false);
    setShowVoiceInput(false);
    setIsFallback(false);
  
    try {
      // 1) 저장해둔 토큰 꺼내기
      const token = await AsyncStorage.getItem('jwt');
      if (!token) {
        Alert.alert('인증 오류', '로그인 후 다시 시도하세요.');
        return;
      }

      console.log('API 요청 시작:', {
        url: '/chat',
        prompt: messageText,
        tokenExists: !!token
      });

      // 2) /chat 요청에 Authorization 헤더 추가
      const res = await API.post(
        '/chat',
        { prompt: messageText },
        { headers: { Authorization: token } }
      );
      console.log('📦 /chat 응답 전체:', res.data);
      
      console.log('API 응답 성공:', res.data);
      
      // 3) 응답 데이터 구조 확인 및 추출
      const aiText =
        typeof res.data === 'string'
          ? res.data
          : res.data.data?.response
          ?? res.data.data
          ?? res.data.message
          ?? '죄송해요, 응답을 받을 수 없었어요.';
      
      // 4) AI 메시지 화면에 추가
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newAiMessage]);
      Tts.speak(aiText);
    } catch (err: any) {
      console.error('Chat API 에러:', err);
      
      // 상세 에러 로깅
      if (axios.isAxiosError(err)) {
        console.error('Axios 에러 상세 정보:', {
          status: err.response?.status,
          data: err.response?.data,
          headers: err.response?.headers,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            baseURL: err.config?.baseURL,
            headers: err.config?.headers
          }
        });
        
        const serverMsg = err.response?.data?.message
                      || err.response?.data
                      || err.message;
        Alert.alert('Chat API 에러', `서버 응답: ${serverMsg}`);
      } 
      else {
        console.error('일반 에러:', err);
        Alert.alert('Chat API 에러', err.message || '알 수 없는 오류');
      }
    }
  };

  // 폴백 메커니즘: 음성 인식 실패시 대체 텍스트 표시
  // const useFallbackMechanism = () => {
  //   // 폴백 모드 활성화
  //   setIsFallback(true);
    
  //   // 랜덤 텍스트 선택
  //   const randomText = fallbackSpeechTexts[Math.floor(Math.random() * fallbackSpeechTexts.length)];
  //   let currentIndex = 0;
    
  //   // 글자 하나씩 추가하는 시뮬레이션
  //   const addCharacter = () => {
  //     if (currentIndex <= randomText.length) {
  //       const partialText = randomText.substring(0, currentIndex);
  //       setVoiceText(partialText);
  //       setHasVoiceInput(!!partialText);
  //       currentIndex++;
        
  //       // 다음 글자 추가
  //       simulationTimerRef.current = setTimeout(addCharacter, 100);
  //     } else {
  //       // 시뮬레이션 종료
  //       setIsListening(false);
  //       Alert.alert(
  //         '음성 인식 안내',
  //         '음성 인식이 원활하지 않아 예시 텍스트를 표시했습니다. 필요시 수정하거나 다시 시도해 주세요.'
  //       );
  //     }
  //   };
    
  //   // 시뮬레이션 시작
  //   addCharacter();
  // };

  const startSpeechToText = async () => {
    try {
      // 이미 음성 인식 중이면 중지
      if (isListening) {
        await stopSpeechToText();
        // 상태 업데이트 대기
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // 기존 텍스트가 없거나 새로 시작하는 경우 초기화
      setVoiceText('');
      setHasVoiceInput(false);
      setIsFallback(false);
      setIsListening(true);
      
      // 실제 음성 인식 시작 (약간의 지연을 두어 UI가 업데이트될 시간을 줌)
      setTimeout(async () => {
        try {
          console.log('음성 인식 시작 시도...');
          await Voice.start('ko-KR');
          console.log('음성 인식 시작됨');
        } catch (e) {
          console.error('음성 인식 지연 시작 오류:', e);
          setIsListening(false);
          // useFallbackMechanism();
        }
      }, 300);
    } catch (error) {
      console.error('음성 인식 시작 오류:', error);
      setIsListening(false);
      
      // 음성 인식 시작 실패시 폴백 활성화
      Alert.alert(
        '음성 인식 오류',
        '음성 인식을 시작할 수 없습니다. 대체 모드로 전환합니다.'
      );
      // useFallbackMechanism();
    }
  };

  const stopSpeechToText = async () => {
    try {
      // 폴백 모드인 경우 타이머 정리
      if (isFallback && simulationTimerRef.current) {
        clearTimeout(simulationTimerRef.current);
      } else {
        // 실제 음성 인식 중지
        await Voice.stop();
      }
      setIsListening(false);
    } catch (error) {
      console.error('음성 인식 중지 오류:', error);
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  const resetVoiceInput = () => {
    if (isListening) {
      stopSpeechToText();
    }
    setVoiceText('');
    setHasVoiceInput(false);
    setIsFallback(false);
  };

  const toggleVoiceInput = () => {
    setShowVoiceInput(!showVoiceInput);
    if (!showVoiceInput) {
      // 키보드 입력에서 음성 입력으로 전환할 때 기존 입력이 있다면 음성 텍스트로 복사
      if (inputText.trim()) {
        setVoiceText(inputText);
        setHasVoiceInput(true);
      }
    } else {
      // 음성 입력에서 키보드 입력으로 전환할 때 음성 입력이 있다면 키보드 입력으로 복사
      if (voiceText.trim()) {
        setInputText(voiceText);
      }
      // 음성 인식 중이면 중지
      if (isListening) {
        stopSpeechToText();
      }
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessageContainer : styles.aiMessageContainer,
      ]}
    >
      {item.sender === 'ai' && (
        <View style={styles.avatarContainer}>
          <Image
            source={require('../assets/character.png')}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          item.sender === 'user' ? styles.userMessageBubble : styles.aiMessageBubble,
        ]}
      >
        <Text style={[
          styles.messageText,
          item.sender === 'user' ? styles.userMessageText : styles.aiMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.timestamp,
          item.sender === 'user' ? styles.userTimestamp : styles.aiTimestamp
        ]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {item.sender === 'user' && <View style={styles.userMessageTail} />}
      {item.sender === 'ai' && <View style={styles.aiMessageTail} />}
    </View>
  );

  // 음성 입력 컴포넌트
  const renderVoiceInputComponent = () => (
    <View style={styles.voiceInputContainer}>
      <TouchableOpacity 
        style={styles.backToKeyboardButton} 
        onPress={toggleVoiceInput}
      >
        <Text style={styles.backToKeyboardText}>{'← 키보드 입력으로 돌아가기'}</Text>
      </TouchableOpacity>
      
      <View style={[styles.voiceTextContainer, isListening && styles.voiceTextContainerActive]}>
        {voiceText ? (
          <Text style={styles.voiceText}>
            {voiceText}
            {isFallback && <Text style={styles.fallbackIndicator}> (자동생성)</Text>}
            {isListening && <Text style={styles.listeningIndicatorText}>...</Text>}
          </Text>
        ) : (
          <Text style={styles.voiceTextPlaceholder}>
            {isListening ? '듣고 있습니다... 말씀해 주세요.' : '말하기 버튼을 누르고 말씀해 주세요...'}
          </Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={[styles.micButton, isListening && styles.micButtonActive]} 
        onPress={toggleListening}
      >
        {isListening ? (
          <View style={styles.listeningIndicator}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.listeningText}>듣는 중...</Text>
          </View>
        ) : (
          <Text style={styles.micButtonIcon}>🎤</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.voiceButtonsContainer}>
        <TouchableOpacity 
          style={[
            styles.voiceActionButton, 
            !hasVoiceInput && styles.voiceActionButtonDisabled
          ]} 
          onPress={resetVoiceInput}
          disabled={!hasVoiceInput}
        >
          <Text style={[styles.voiceActionButtonText, !hasVoiceInput && styles.voiceActionButtonTextDisabled]}>다시 말하기</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.voiceActionButton, 
            styles.sendVoiceButton,
            !hasVoiceInput && styles.voiceActionButtonDisabled
          ]} 
          onPress={() => handleSendMessage(voiceText)}
          disabled={!hasVoiceInput}
        >
          <Text style={styles.voiceActionButtonText}>보내기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 일반 텍스트 입력 컴포넌트
  const renderTextInputComponent = () => (
    <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.microphone} onPress={toggleVoiceInput}>
        <Text style={styles.microphoneIcon}>🎤</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="메시지를 입력하세요..."
        value={inputText}
        onChangeText={setInputText}
        multiline
      />
      <TouchableOpacity
        style={[styles.sendButton, !inputText.trim() ? styles.sendButtonDisabled : null]}
        onPress={() => handleSendMessage()}
        disabled={!inputText.trim()}
      >
        <Text style={styles.sendButtonText}>➤</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContainer}
        />

        {showVoiceInput ? renderVoiceInputComponent() : renderTextInputComponent()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DAE6DD', // 채팅 영역 전체 배경색 변경
  },
  content: {
    flex: 1,
    marginBottom: 10, // BottomNavigation과의 간격 조정
  },
  messagesContainer: {
    padding: 15,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '80%',
    position: 'relative',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
    marginRight: 'auto',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    position: 'relative',
    maxWidth: '100%',
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  userMessageBubble: {
    backgroundColor: '#BBCCFF', // 사용자 말풍선 색상 변경
    borderBottomRightRadius: 4,
    marginRight: 8,
  },
  aiMessageBubble: {
    backgroundColor: '#90BBFF', // AI 말풍선 색상 변경
    borderBottomLeftRadius: 4,
    marginLeft: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#333',
  },
  aiMessageText: {
    color: '#fff',
  },
  userMessageTail: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 0,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#BBCCFF', // 사용자 말풍선 꼬리 색상 변경
    transform: [{ rotate: '90deg' }],
  },
  aiMessageTail: {
    position: 'absolute',
    left: 40, // 아바타 위치 고려
    bottom: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 0,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#90BBFF', // AI 말풍선 꼬리 색상 변경
    transform: [{ rotate: '-90deg' }],
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  userTimestamp: {
    color: '#777',
  },
  aiTimestamp: {
    color: '#ddd',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 10, // 네비게이션바와의 여백 추가
    alignItems: 'flex-end', // 마이크와 텍스트 입력을 하단에 정렬
  },
  microphone: {
    width: 40,
    height: 40, 
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  microphoneIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B7C1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    alignSelf: 'flex-end',
  },
  sendButtonDisabled: {
    backgroundColor: '#c0c0c0',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  // 음성 입력 관련 스타일
  voiceInputContainer: {
    backgroundColor: '#fff',
    height: height / 2.5, // 높이 증가
    width: '100%',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    justifyContent: 'space-between',
  },
  backToKeyboardButton: {
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: '#f1f1f1',
    borderRadius: 15,
  },
  backToKeyboardText: {
    color: '#555',
    fontSize: 14,
  },
  voiceTextContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginVertical: 15,
    justifyContent: 'center',
    minHeight: 100, // 최소 높이 지정
  },
  voiceTextContainerActive: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#f0f8ff',
  },
  voiceText: {
    fontSize: 18, // 폰트 크기 증가
    color: '#333',
    textAlign: 'center',
    fontWeight: '500', // 약간 더 굵게
  },
  fallbackIndicator: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  voiceTextPlaceholder: {
    color: '#999',
    textAlign: 'center',
    fontSize: 16,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6B7C1C',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 15,
  },
  micButtonActive: {
    backgroundColor: '#ff4444',
  },
  micButtonIcon: {
    fontSize: 32,
    color: '#fff',
  },
  listeningIndicator: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningText: {
    marginTop: 5,
    color: '#fff',
    fontSize: 12,
  },
  voiceButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  voiceActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendVoiceButton: {
    backgroundColor: '#6B7C1C',
  },
  voiceActionButtonDisabled: {
    opacity: 0.5,
  },
  voiceActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  voiceActionButtonTextDisabled: {
    color: '#aaa',
  },
  listeningIndicatorText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default ChatScreen; 