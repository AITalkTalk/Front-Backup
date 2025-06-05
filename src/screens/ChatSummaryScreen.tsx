import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axios';

interface Summary {
  date: string;
  sentiment: string;
  chat: string;
}

const ChatSummaryScreen: React.FC = () => {
  const [markedDates, setMarkedDates] = useState<{ [date: string]: any }>({});
  const [summaryMap, setSummaryMap] = useState<{ [date: string]: Summary }>({});
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ 현재 월 기준 초기 로딩
  useEffect(() => {
    const today = new Date();
    fetchMonthlySummaries(today.getFullYear(), today.getMonth() + 1);
  }, []);

  // ✅ 월 단위 요약 전체 불러오기
  const fetchMonthlySummaries = async (year: number, month: number) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('jwt');
  
      const fullDate = `${year}-${String(month).padStart(2, '0')}-01`; // '2025-06-01' 형태
      const res = await API.get(`/monthsummary?date=${fullDate}`, {
        headers: { Authorization: token || '' },
      });
  
      const list: Summary[] = res.data.data;
  
      const newMarked: { [date: string]: any } = {};
      const newMap: { [date: string]: Summary } = {};
  
      list.forEach((item) => {
        newMarked[item.date] = {
          marked: true,
          dotColor: '#6B7C1C',
        };
        newMap[item.date] = item;
      });
  
      setMarkedDates(newMarked);
      setSummaryMap(newMap);
    } catch (e) {
      console.error(e);
      Alert.alert('에러', '한 달치 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };
  

  // ✅ 날짜 클릭 시 해당 요약 표시
  const onDateSelected = (date: string) => {
    const data = summaryMap[date];
    if (data) {
      setSummary(data);
    } else {
      setSummary({
        date,
        sentiment: '-',
        chat: '(해당 날짜에 대화 기록이 없습니다.)',
      });
    }
  
    // ✅ 모든 날짜의 selected 제거 + 새 날짜만 selected 처리
    const updatedMarked: { [date: string]: any } = {};
    Object.keys(markedDates).forEach((d) => {
      // 기존 마킹 유지 but selected 제거
      updatedMarked[d] = {
        ...markedDates[d],
        selected: false,
      };
    });
  
    updatedMarked[date] = {
      ...(markedDates[date] || {}),
      selected: true,
      selectedColor: '#6B7C1C',
    };
  
    setMarkedDates(updatedMarked);
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>날짜를 선택하세요</Text>

      <Calendar
        onDayPress={(day) => onDateSelected(day.dateString)}
        onMonthChange={(month) => fetchMonthlySummaries(month.year, month.month)}
        markedDates={markedDates}
        style={styles.calendar}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#6B7C1C',
          selectedDayBackgroundColor: '#6B7C1C',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#6B7C1C',
          dayTextColor: '#333333',
          textDisabledColor: '#d9e1e8',
          arrowColor: '#6B7C1C',
          monthTextColor: '#6B7C1C',
          indicatorColor: '#6B7C1C',
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
      />

      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" />}

      {summary && (
        <View style={styles.summaryBox}>
          <Text style={styles.label}>📅 날짜: {summary.date}</Text>
          <Text style={styles.label}>😊 감정: {summary.sentiment}</Text>
          <Text style={styles.label}>💬 내용:</Text>
          <Text style={styles.chat}>{summary.chat}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DAE6DD', padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  label: { fontSize: 16, marginBottom: 10, fontWeight: '500' },
  chat: { fontSize: 15, lineHeight: 22, color: '#333' },
});

export default ChatSummaryScreen;
