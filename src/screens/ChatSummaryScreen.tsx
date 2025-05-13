import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Header from '../components/Header';

interface ChatSummaryScreenProps {
  navigation: any;
}

interface ChatSummary {
  date: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
}

const ChatSummaryScreen: React.FC<ChatSummaryScreenProps> = ({ navigation }) => {
  const [summaries, setSummaries] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 백엔드에서 데이터 가져오는 것 시뮬레이션
    const fetchSummaries = () => {
      setTimeout(() => {
        const mockSummaries: ChatSummary[] = [
          {
            date: '2023년 6월 1일',
            summary: '오늘 학교에서 미술 시간에 수채화를 그렸습니다. 친구들과 함께 놀이터에서 놀았고, 집에서는 숙제를 했습니다. 저녁에는 가족과 함께 영화를 봤습니다.',
            sentiment: 'positive',
            keywords: ['미술', '수채화', '놀이터', '숙제', '영화'],
          },
          {
            date: '2023년 6월 2일',
            summary: '오늘은 수학 시험을 봤는데 조금 어려웠어요. 점심시간에 친구와 싸웠지만 곧 화해했습니다. 집에서는 과학 책을 읽었습니다.',
            sentiment: 'neutral',
            keywords: ['수학 시험', '싸움', '화해', '과학 책'],
          },
          {
            date: '2023년 6월 3일',
            summary: '오늘은 비가 많이 와서 체육 수업이 취소되어 슬펐어요. 친구가 아파서 학교에 오지 못했고, 숙제가 많아서 힘들었습니다.',
            sentiment: 'negative',
            keywords: ['비', '체육 취소', '아픈 친구', '숙제'],
          },
          {
            date: '2023년 6월 4일',
            summary: '오늘은 학교에서 특별 활동으로 요리 실습을 했어요. 쿠키를 만들었는데 정말 맛있었습니다. 집에 와서는 피아노 연습을 했습니다.',
            sentiment: 'positive',
            keywords: ['요리 실습', '쿠키', '피아노 연습'],
          },
          {
            date: '2023년 6월 5일',
            summary: '오늘은 학교에서 역사 시간에 조선시대에 대해 배웠습니다. 점심시간에는 친구들과 축구를 했고, 방과후에는 영어 학원에 갔습니다.',
            sentiment: 'neutral',
            keywords: ['역사', '조선시대', '축구', '영어 학원'],
          },
        ];
        
        setSummaries(mockSummaries);
        setLoading(false);
      }, 1500);
    };

    fetchSummaries();
  }, []);

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch(sentiment) {
      case 'positive':
        return '#6B7C1C'; // 초록색 - 테마색상
      case 'neutral':
        return '#90BBFF'; // 파란색 - AI 말풍선 색상
      case 'negative':
        return '#F44336'; // 빨간색
      default:
        return '#90BBFF';
    }
  };

  const getSentimentIcon = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch(sentiment) {
      case 'positive':
        return 'happy';
      case 'neutral':
        return 'happy-outline';
      case 'negative':
        return 'sad';
      default:
        return 'happy-outline';
    }
  };

  const getSentimentText = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch(sentiment) {
      case 'positive':
        return '긍정적';
      case 'neutral':
        return '중립적';
      case 'negative':
        return '부정적';
      default:
        return '중립적';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} title="대화 요약" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B7C1C" />
          <Text style={styles.loadingText}>대화 내용을 분석 중입니다...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.introText}>
            아이와 AI의 대화 내용을 기반으로 한 요약입니다.
          </Text>

          {summaries.map((summary, index) => (
            <View key={index} style={styles.summaryCard}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{summary.date}</Text>
                <View 
                  style={[
                    styles.sentimentBadge, 
                    { backgroundColor: getSentimentColor(summary.sentiment) }
                  ]}
                >
                  <Text style={styles.sentimentText}>
                    {getSentimentText(summary.sentiment)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.summaryText}>{summary.summary}</Text>
              
              <View style={styles.keywordsContainer}>
                <Text style={styles.keywordsTitle}>주요 키워드:</Text>
                <View style={styles.keywordsList}>
                  {summary.keywords.map((keyword, keywordIndex) => (
                    <View key={keywordIndex} style={styles.keywordBadge}>
                      <Text style={styles.keywordText}>{keyword}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DAE6DD', // 앱 공통 배경색
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 15,
    paddingBottom: 30,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sentimentBadge: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: 'center',
  },
  sentimentText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 15,
  },
  keywordsContainer: {
    marginTop: 5,
  },
  keywordsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keywordBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  keywordText: {
    fontSize: 12,
    color: '#666',
  },
});

export default ChatSummaryScreen; 