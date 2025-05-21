import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

interface MyPageScreenProps {
  navigation: any;
}

const MyPageScreen: React.FC<MyPageScreenProps> = ({ navigation }) => {
  const [showParentModal, setShowParentModal] = useState(false);
  const [parentCode, setParentCode] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['과학', '미술']);
  
  const interestOptions = ['학업', '친구', '건강', '가정'];

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => navigation.navigate('Login'),
        },
      ]
    );
  };

  const checkParentCode = () => {
    // 부모 비밀번호 확인 (실제로는 백엔드에서 검증)
    if (parentCode === '1234') {
      setShowParentModal(false);
      setParentCode('');
      navigation.navigate('ChatSummary'); // 대화 요약 화면으로 이동
    } else {
      Alert.alert('오류', '잘못된 비밀번호입니다.');
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const saveInterests = () => {
    // 관심사 저장 로직 (백엔드 연동 필요)
    setShowEditModal(false);
    Alert.alert('성공', '관심 분야가 업데이트되었습니다.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} title="마이페이지" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>김</Text>
          </View>
          <Text style={styles.profileName}>김똑똑</Text>
          <Text style={styles.profileInfo}>8세 | 초등학교 1학년</Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>15</Text>
            <Text style={styles.statLabel}>퀴즈 풀이</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>친구 수</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>대화 횟수</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>설정</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowEditModal(true)}
          >
            <Text style={styles.menuLeft}>
              <Text style={styles.menuIcon}>❤️</Text>
              <Text style={styles.menuText}>관심 분야 수정</Text>
            </Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowParentModal(true)}
          >
            <Text style={styles.menuLeft}>
              <Text style={styles.menuIcon}>💬</Text>
              <Text style={styles.menuText}>대화 내용 확인</Text>
            </Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuLeft}>
              <Text style={styles.menuIcon}>🔔</Text>
              <Text style={styles.menuText}>알림 설정</Text>
            </Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuLeft}>
              <Text style={styles.menuIcon}>ℹ️</Text>
              <Text style={styles.menuText}>앱 정보</Text>
            </Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.menuLeft}>
              <Text style={[styles.menuIcon, styles.logoutIcon]}>🚪</Text>
              <Text style={[styles.menuText, styles.logoutText]}>로그아웃</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 부모 비밀번호 확인 모달 */}
      <Modal
        visible={showParentModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>부모 확인</Text>
            <Text style={styles.modalDescription}>
              아이의 대화 내용을 보기 위해서는 부모 비밀번호를 입력해주세요.
            </Text>
            
            <TextInput
              style={styles.codeInput}
              placeholder="비밀번호 입력"
              value={parentCode}
              onChangeText={setParentCode}
              keyboardType="number-pad"
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowParentModal(false);
                  setParentCode('');
                }}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={checkParentCode}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 관심 분야 수정 모달 */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>관심 분야 수정</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.closeButton}>✖</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.editModalDescription}>
              아이의 관심 분야를 선택해주세요. (여러 개 선택 가능)
            </Text>
            
            <View style={styles.interestsContainer}>
              {interestOptions.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestButton,
                    selectedInterests.includes(interest) && styles.interestButtonSelected
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text 
                    style={[
                      styles.interestButtonText,
                      selectedInterests.includes(interest) && styles.interestButtonTextSelected
                    ]}
                  >
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveInterests}
            >
              <Text style={styles.saveButtonText}>저장하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <BottomNavigation navigation={navigation} currentScreen="MyPage" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DAE6DD',
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6B7C1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileAvatarText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileInfo: {
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    justifyContent: 'space-around',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7C1C',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#ddd',
  },
  menuSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  menuArrow: {
    fontSize: 20,
    color: '#6B7C1C',
  },
  logoutButton: {
    marginTop: 20,
  },
  logoutIcon: {
    color: '#FF3B30',
  },
  logoutText: {
    color: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  codeInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#6B7C1C',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editModalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editModalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
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
  saveButton: {
    height: 50,
    backgroundColor: '#6B7C1C',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#333',
  },
});

export default MyPageScreen; 