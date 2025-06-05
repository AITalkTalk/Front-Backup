import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import API from '../api/axios';  // axios 인스턴스
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserInfo {
  name: string;
  age: number;
  point: number;
  secret: string;
  interest: string;
}

interface MyPageScreenProps {
  navigation: any;
}

const interestOptions = ['학업', '친구', '건강', '가정'];

const MyPageScreen: React.FC<MyPageScreenProps> = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showParentModal, setShowParentModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [parentCode, setParentCode] = useState('');
  // 수정 모달용 상태
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [secret, setSecret] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // 마운트 시 회원정보 조회
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        console.log(token);
        const res = await API.get('/info', { headers: { Authorization: token } });
        const info: UserInfo = res.data.data;
        setUserInfo(info);
        console.log(info);

        // 모달 초기값 세팅
        setName(info.name);
        setAge(info.age.toString());
        setSecret(info.secret);
        setSelectedInterests(
          info.interest.split(',').map(s => s.trim()).filter(s => interestOptions.includes(s))
        );
      } catch (e) {
        console.error(e);
        Alert.alert('오류', '회원 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  const toggleInterest = (i: string) => {
    setSelectedInterests(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const checkParentCode = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const res = await API.post(
        `/secret?secret=${encodeURIComponent(parentCode.trim())}`,
        {},
        { headers: { Authorization: token || '' } }
      );
      console.log('응답:', res.data);
  
      if (res.data.status === 200) {
        setShowParentModal(false);
        setParentCode('');
        navigation.navigate('ChatSummary');
      } else {
        Alert.alert('오류', res.data.message || '비밀키가 올바르지 않습니다.');
        setShowParentModal(false);
        setParentCode('');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('오류', '비밀키 인증 중 오류가 발생했습니다.');
      setShowParentModal(false);
      setParentCode('');
    }
  };
  

  // **회원정보 변경 -> POST /changeinfo**
  const saveProfile = async () => {
    if (!name || !age || !secret || selectedInterests.length === 0) {
      Alert.alert('경고', '모든 필드를 입력하고 관심 분야를 한 개 이상 선택하세요.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('jwt');
      const payload = {
        name: name.trim(),
        age: parseInt(age, 10),
        point: userInfo?.point ?? 0,
        secret: secret.trim(),
        interest: selectedInterests.join(','),
      };
      const res = await API.post(
        '/changeinfo',
        payload,
        { headers: { Authorization: token! } }
      );
      if (res.status === 200) {
        // 로컬 상태 갱신
        setUserInfo(prev => prev ? ({ ...prev, ...payload }) : prev);
        setEditModalVisible(false);
        Alert.alert('성공', '회원 정보가 업데이트되었습니다.');
      } else {
        Alert.alert('오류', res.data.message || '업데이트에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '회원 정보 수정 중 문제가 발생했습니다.');
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex:1 }} size="large" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} title="마이페이지" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {userInfo?.name.charAt(0)}
            </Text>
          </View>
          <Text style={styles.profileName}>{userInfo?.name}</Text>
          <Text style={styles.profileInfo}>{userInfo?.age}세</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditModalVisible(true)}
          >
            <Text style={styles.editButtonText}>정보 수정</Text>
          </TouchableOpacity>
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
          <Modal
            visible={showParentModal}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>비밀키 확인</Text>
                <Text style={styles.modalDescription}>
                  대화 내용을 보기 위해 비밀키를 입력해주세요.
                </Text>
                <TextInput
                  style={styles.codeInput}
                  placeholder="비밀키 입력"
                  value={parentCode}
                  onChangeText={setParentCode}
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
        {/* ... 나머지 메뉴 · 통계 섹션은 기존 코드 유지 ... */}
      </ScrollView>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>회원 정보 수정</Text>

            <TextInput
              style={styles.input}
              placeholder="이름"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="나이"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="비밀번호 (Secret)"
              value={secret}
              onChangeText={setSecret}
              secureTextEntry
            />

            <Text style={styles.sectionTitle}>관심 분야</Text>
            <View style={styles.interestsContainer}>
              {interestOptions.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.interestButton,
                    selectedInterests.includes(opt) && styles.interestButtonSelected
                  ]}
                  onPress={() => toggleInterest(opt)}
                >
                  <Text
                    style={[
                      styles.interestButtonText,
                      selectedInterests.includes(opt) && styles.interestButtonTextSelected
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveProfile}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavigation navigation={navigation} currentScreen="MyPage" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DAE6DD' },
  content: { padding: 20, paddingBottom: 80 },

  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileAvatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#6B7C1C',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15,
  },
  profileAvatarText: { fontSize: 30, color: '#fff', fontWeight: 'bold' },
  profileName: { fontSize: 20, color: '#333', fontWeight: 'bold', marginBottom: 5 },
  profileInfo: { fontSize: 14, color: '#666' },

  editButton: {
    marginTop: 10,
    backgroundColor: '#6B7C1C',
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 6,
  },
  editButtonText: { color: '#fff', fontSize: 14 },

  modalOverlay: {
    flex:1,
    backgroundColor:'rgba(0,0,0,0.5)',
    justifyContent:'center',
    alignItems:'center'
  },
  modalContainer: {
    width:'90%',
    backgroundColor:'#fff',
    borderRadius:10,
    padding:20
  },
  modalTitle: {
    fontSize:18,
    fontWeight:'bold',
    marginBottom:12
  },
  input: {
    borderWidth:1,
    borderColor:'#ddd',
    borderRadius:8,
    padding:10,
    marginBottom:12
  },
  sectionTitle: {
    fontWeight:'600',
    marginBottom:8
  },
  interestsContainer: {
    flexDirection:'row',
    flexWrap:'wrap',
    marginBottom:12
  },
  interestButton: {
    paddingVertical:6,
    paddingHorizontal:12,
    backgroundColor:'#eee',
    borderRadius:20,
    margin:4
  },
  interestButtonSelected: {
    backgroundColor:'#6B7C1C'
  },
  interestButtonText: {
    color:'#333'
  },
  interestButtonTextSelected: {
    color:'#fff'
  },
  modalActions: {
    flexDirection:'row',
    justifyContent:'flex-end',
    marginTop:10
  },
  cancelButton: {
    marginRight:12,
    paddingVertical:6,
    paddingHorizontal:12,
  },
  saveButton: {
    backgroundColor:'#6B7C1C',
    paddingVertical:8,
    paddingHorizontal:16,
    borderRadius:6
  },
  saveButtonText: {
    color:'#fff',
    fontWeight:'600'
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
   logoutButton: {
    marginTop: 20,
  },
  logoutIcon: {
    color: '#FF3B30',
  },
  logoutText: {
    color: '#FF3B30',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  codeInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: '#6B7C1C',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  

  // ... 나머지 스타일 (메뉴, 통계 등) 동일하게 가져오시면 됩니다 ...
});

export default MyPageScreen;
