import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

interface QuizScreenProps {
  navigation: any;
}

interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
}

const sampleQuizzes: Quiz[] = [
  {
    question: '우리나라의 수도는 어디인가요?',
    options: ['서울', '부산', '대전', '광주'],
    correctAnswer: 0,
  },
  {
    question: '다음 중 바다가 아닌 것은?',
    options: ['동해', '서해', '남해', '북해'],
    correctAnswer: 3,
  },
  {
    question: '1 + 1 = ?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 1,
  },
  {
    question: '다음 중 과일이 아닌 것은?',
    options: ['사과', '바나나', '당근', '딸기'],
    correctAnswer: 2,
  },
  {
    question: '태양계의 행성 개수는?',
    options: ['7개', '8개', '9개', '10개'],
    correctAnswer: 1,
  },
];

const { width } = Dimensions.get('window');

const SCREEN_WIDTH = Dimensions.get('window').width;

const QuizScreen: React.FC<QuizScreenProps> = ({ navigation }) => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentQuiz = sampleQuizzes[currentQuizIndex];

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    
    if (optionIndex === currentQuiz.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < sampleQuizzes.length - 1) {
      setIsLoading(true);
      
      // 잠시 로딩 화면을 보여준 후 다음 퀴즈로 이동 (UX를 위함)
      setTimeout(() => {
        setCurrentQuizIndex(currentQuizIndex + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setIsLoading(false);
      }, 1000);
    } else {
      // 모든 퀴즈를 다 풀었을 때
      Alert.alert(
        '퀴즈 완료!',
        `총 ${sampleQuizzes.length}문제 중 ${score}문제를 맞추셨습니다!`,
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('Main'),
          },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header navigation={navigation} />

        <View style={styles.quizContainer}>
          <Text style={styles.quizProgress}>오늘의 퀴즈 {currentQuizIndex + 1}/{sampleQuizzes.length}</Text>
          
          <View style={styles.loadingQuizSection}>
            <ActivityIndicator size="large" color="#B8CCFF" />
            <Text style={styles.loadingText}>다음 문제 준비중...</Text>
          </View>
        </View>
        
        <BottomNavigation navigation={navigation} currentScreen="Quiz" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />
      
      <View style={styles.quizContainer}>
        <Text style={styles.quizProgress}>오늘의 퀴즈 {currentQuizIndex + 1}/{sampleQuizzes.length}</Text>
        
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuiz.question}</Text>
        </View>
        
        <View style={styles.optionsGrid}>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              key={0}
              style={[
                styles.optionButton,
                selectedOption === 0 && 
                  (0 === currentQuiz.correctAnswer ? styles.correctOption : styles.wrongOption),
                isAnswered && 0 === currentQuiz.correctAnswer && styles.correctOption,
              ]}
              onPress={() => handleOptionSelect(0)}
              disabled={isAnswered}
            >
              <Text 
                style={[
                  styles.optionText,
                  (selectedOption === 0 && 0 === currentQuiz.correctAnswer) || 
                  (isAnswered && 0 === currentQuiz.correctAnswer)
                    ? styles.correctOptionText
                    : selectedOption === 0 
                      ? styles.wrongOptionText 
                      : null
                ]}
              >
                {currentQuiz.options[0]}
              </Text>
              {isAnswered && 0 === currentQuiz.correctAnswer && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
              {isAnswered && selectedOption === 0 && 0 !== currentQuiz.correctAnswer && (
                <Text style={styles.closeIcon}>✗</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              key={1}
              style={[
                styles.optionButton,
                selectedOption === 1 && 
                  (1 === currentQuiz.correctAnswer ? styles.correctOption : styles.wrongOption),
                isAnswered && 1 === currentQuiz.correctAnswer && styles.correctOption,
              ]}
              onPress={() => handleOptionSelect(1)}
              disabled={isAnswered}
            >
              <Text 
                style={[
                  styles.optionText,
                  (selectedOption === 1 && 1 === currentQuiz.correctAnswer) || 
                  (isAnswered && 1 === currentQuiz.correctAnswer)
                    ? styles.correctOptionText
                    : selectedOption === 1 
                      ? styles.wrongOptionText 
                      : null
                ]}
              >
                {currentQuiz.options[1]}
              </Text>
              {isAnswered && 1 === currentQuiz.correctAnswer && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
              {isAnswered && selectedOption === 1 && 1 !== currentQuiz.correctAnswer && (
                <Text style={styles.closeIcon}>✗</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.optionsRow}>
            <TouchableOpacity
              key={2}
              style={[
                styles.optionButton,
                selectedOption === 2 && 
                  (2 === currentQuiz.correctAnswer ? styles.correctOption : styles.wrongOption),
                isAnswered && 2 === currentQuiz.correctAnswer && styles.correctOption,
              ]}
              onPress={() => handleOptionSelect(2)}
              disabled={isAnswered}
            >
              <Text 
                style={[
                  styles.optionText,
                  (selectedOption === 2 && 2 === currentQuiz.correctAnswer) || 
                  (isAnswered && 2 === currentQuiz.correctAnswer)
                    ? styles.correctOptionText
                    : selectedOption === 2 
                      ? styles.wrongOptionText 
                      : null
                ]}
              >
                {currentQuiz.options[2]}
              </Text>
              {isAnswered && 2 === currentQuiz.correctAnswer && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
              {isAnswered && selectedOption === 2 && 2 !== currentQuiz.correctAnswer && (
                <Text style={styles.closeIcon}>✗</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              key={3}
              style={[
                styles.optionButton,
                selectedOption === 3 && 
                  (3 === currentQuiz.correctAnswer ? styles.correctOption : styles.wrongOption),
                isAnswered && 3 === currentQuiz.correctAnswer && styles.correctOption,
              ]}
              onPress={() => handleOptionSelect(3)}
              disabled={isAnswered}
            >
              <Text 
                style={[
                  styles.optionText,
                  (selectedOption === 3 && 3 === currentQuiz.correctAnswer) || 
                  (isAnswered && 3 === currentQuiz.correctAnswer)
                    ? styles.correctOptionText
                    : selectedOption === 3 
                      ? styles.wrongOptionText 
                      : null
                ]}
              >
                {currentQuiz.options[3]}
              </Text>
              {isAnswered && 3 === currentQuiz.correctAnswer && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
              {isAnswered && selectedOption === 3 && 3 !== currentQuiz.correctAnswer && (
                <Text style={styles.closeIcon}>✗</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {isAnswered && (
        <View style={styles.feedbackContainer}>
          <Text style={[
            styles.feedbackText,
            selectedOption === currentQuiz.correctAnswer ? styles.correctFeedbackText : styles.wrongFeedbackText
          ]}>
            {selectedOption === currentQuiz.correctAnswer ? '정답입니다!' : '틀렸습니다!'}
          </Text>
          <TouchableOpacity style={styles.nextButton} onPress={handleNextQuiz}>
            <Text style={styles.nextButtonText}>
              {currentQuizIndex < sampleQuizzes.length - 1 ? '다음 문제' : '결과 보기'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <BottomNavigation navigation={navigation} currentScreen="Quiz" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingQuizSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  quizProgress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7C1C', 
    marginBottom: 15,
    textAlign: 'center',
  },
  quizContainer: {
    flex: 1,
    padding: 15,
  },
  questionCard: {
    backgroundColor: '#B8CCFF',
    borderRadius: 16,
    padding: 20,
    height: 180,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 25,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
  },
  optionsGrid: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  optionButton: {
    width: (SCREEN_WIDTH - 80) / 2.2,
    height: (SCREEN_WIDTH - 80) / 2.2,
    marginHorizontal: 5,
    padding: 8,
    backgroundColor: '#B8CCFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A0B0FF',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  correctOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  wrongOption: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  optionText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  correctOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  wrongOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  feedbackContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  correctFeedbackText: {
    color: '#4CAF50',
  },
  wrongFeedbackText: {
    color: '#F44336',
  },
  nextButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#B8CCFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkIcon: {
    fontSize: 24,
    color: '#fff',
    marginTop: 5,
  },
  closeIcon: {
    fontSize: 24,
    color: '#fff',
    marginTop: 5,
  },
});

export default QuizScreen; 