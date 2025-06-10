import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import API from '../api/axios';   // axios 인스턴스
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;  // options 배열의 인덱스
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const QuizScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nextLoading, setNextLoading] = useState(false);

  // 1) 마운트 시 /quiz 호출
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        const res = await API.get<{
          id: string;
          question: string;
          choices: string[];
          answer: string;
          category: string;
        }>('/quiz', {
          headers: { Authorization: token! },
        });
        const q = res.data;
      // answer 문자열이 choices 배열에서 몇 번째 인덱스인지 찾아서 숫자로 변환
      const correctIdx = q.choices.findIndex(c => c === q.answer);
      // 단일 객체를 배열로 포장
      setQuizzes([{
        id: q.id,
        question: q.question,
        options: q.choices,
        correctAnswer: correctIdx >= 0 ? correctIdx : 0,
      }]);
      } catch (e) {
        console.error('퀴즈 로드 에러', e);
        Alert.alert('오류', '퀴즈를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentQuiz = quizzes[currentIndex];

  const handleOptionSelect = async (i: number) => {
    if (isAnswered) return;
  
    setSelectedOption(i);
    setIsAnswered(true);
  
    const isCorrect = i === currentQuiz.correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
  
      // 정답 처리 API 호출
      try {
        const token = await AsyncStorage.getItem('jwt');
        await API.patch(
          '/quiz/solve',
          {}, // 바디는 필요 없고 queryParam 으로 전달
          {
            headers: { Authorization: token! },
            params: { quizId: currentQuiz.id },
          }
        );
        console.log('정답 처리 성공');
        // (필요하면 성공 시 추가 UI 처리)
      } catch (e) {
        console.error('정답 처리 실패', e);
        // 실패해도 UX 방해하지 않도록 Alert 정도만 띄워줍니다
        Alert.alert('알림', '정답 처리에 실패했습니다.');
      }
    }
  };

  // const handleNext = () => {
  //   if (currentIndex < quizzes.length - 1) {
  //     setNextLoading(true);
  //     setTimeout(() => {
  //       setCurrentIndex(idx => idx + 1);
  //       setSelectedOption(null);
  //       setIsAnswered(false);
  //       setNextLoading(false);
  //     }, 800);
  //   } else {
  //     Alert.alert(
  //       '퀴즈 완료',
  //       `총 ${quizzes.length}문제 중 ${score}문제를 맞추셨습니다.`,
  //       [{ text: '확인', onPress: () => navigation.navigate('Main') }]
  //     );
  //   }
  // };
  const handleNext = async () => {
    setNextLoading(true);
  
    try {
      const token = await AsyncStorage.getItem('jwt');
      const res = await API.get<{
        id: string;
        question: string;
        choices: string[];
        answer: string;
        category: string;
      }>('/quiz', {
        headers: { Authorization: token! },
      });
  
      const q = res.data;
      const correctIdx = q.choices.findIndex(c => c === q.answer);
  
      const newQuiz: Quiz = {
        id: q.id,
        question: q.question,
        options: q.choices,
        correctAnswer: correctIdx >= 0 ? correctIdx : 0,
      };
  
      setQuizzes(prev => [...prev, newQuiz]);
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } catch (e) {
      console.error('다음 퀴즈 로드 실패', e);
      Alert.alert('오류', '다음 퀴즈를 불러오지 못했습니다.');
    } finally {
      setNextLoading(false);
    }
  };
  

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header navigation={navigation} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6B7C1C" />
          <Text style={{ marginTop: 8 }}>퀴즈 불러오는 중...</Text>
        </View>
        <BottomNavigation navigation={navigation} currentScreen="Quiz" />
      </SafeAreaView>
    );
  }

  if (!currentQuiz) {
    return (
      <SafeAreaView style={styles.container}>
        <Header navigation={navigation} />
        <View style={styles.center}>
          <Text>퀴즈가 없습니다.</Text>
        </View>
        <BottomNavigation navigation={navigation} currentScreen="Quiz" />
      </SafeAreaView>
    );
  }

  if (nextLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header navigation={navigation} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#B8CCFF" />
          <Text style={{ marginTop: 8 }}>다음 문제 준비중...</Text>
        </View>
        <BottomNavigation navigation={navigation} currentScreen="Quiz" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />
      <View style={styles.quizContainer}>
        <Text style={styles.progress}>
          오늘의 퀴즈 {currentIndex + 1}/{quizzes.length}
        </Text>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuiz.question}</Text>
        </View>

        <View style={styles.optionsGrid}>
          {currentQuiz.options.map((opt, i) => {
            const isCorrect = i === currentQuiz.correctAnswer;
            const isSelected = i === selectedOption;
            const bgStyle = isAnswered
              ? isCorrect
                ? styles.correctOption
                : isSelected
                ? styles.wrongOption
                : {}
              : {};
            return (
              <TouchableOpacity
                key={i}
                style={[styles.optionButton, bgStyle]}
                onPress={() => handleOptionSelect(i)}
                disabled={isAnswered}
              >
                <Text style={styles.optionText}>{opt}</Text>
                {isAnswered && isCorrect && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <Text style={styles.closeIcon}>✗</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {isAnswered && (
  <View style={styles.footer}>
    <Text
      style={[
        styles.feedback,
        selectedOption === currentQuiz.correctAnswer
          ? styles.correctFeedback
          : styles.wrongFeedback
      ]}
    >
      {selectedOption === currentQuiz.correctAnswer
        ? '정답입니다!'
        : '틀렸습니다!'}
    </Text>

    <View style={{ flexDirection: 'row', gap: 12 }}>
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextText}>다음 문제</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: '#999' }]}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.nextText}>그만 풀기</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

      </View>
      <BottomNavigation navigation={navigation} currentScreen="Quiz" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quizContainer: { flex: 1, padding: 16 },
  progress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7C1C',
    textAlign: 'center',
    marginBottom: 12
  },
  questionCard: {
    backgroundColor: '#B8CCFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center'
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  optionButton: {
    width: (SCREEN_WIDTH - 48) / 2,
    padding: 12,
    backgroundColor: '#B8CCFF',
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  correctOption: {
    backgroundColor: '#4CAF50'
  },
  wrongOption: {
    backgroundColor: '#F44336'
  },
  checkIcon: {
    marginTop: 4,
    fontSize: 18,
    color: '#fff'
  },
  closeIcon: {
    marginTop: 4,
    fontSize: 18,
    color: '#fff'
  },
  footer: {
    marginTop: 16,
    alignItems: 'center'
  },
  feedback: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12
  },
  correctFeedback: { color: '#4CAF50' },
  wrongFeedback: { color: '#F44336' },
  nextButton: {
    backgroundColor: '#B8CCFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default QuizScreen;
