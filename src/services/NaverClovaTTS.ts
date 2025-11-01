import axios from 'axios';
import { Platform, Alert } from 'react-native';
import Config from 'react-native-config';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import base64 from 'react-native-base64';

/**
 * Naver Clova TTS Service
 * 
 * Naver Clova Voice API를 사용하여 텍스트를 음성으로 변환합니다.
 * API 문서: https://api.ncloud-docs.com/docs/ai-naver-clovavoice-ttspremium
 */

interface TTSConfig {
  speaker?: string;  // 음성 종류 (예: 'nara', 'jinho', 'nsujin' 등)
  speed?: number;    // 음성 속도 (-5 ~ 5, 기본값 0)
  pitch?: number;    // 음성 높이 (-5 ~ 5, 기본값 0)
  volume?: number;   // 음성 볼륨 (-5 ~ 5, 기본값 0)
  format?: string;   // 음성 파일 포맷 (예: 'mp3', 'wav')
}

class NaverClovaTTS {
  // 32KB 청크 크기: Base64 인코딩 성능과 메모리 효율을 고려한 최적 값
  // 너무 크면 메모리 사용량이 증가하고, 너무 작으면 청크 처리 오버헤드 증가
  private static readonly BASE64_CHUNK_SIZE = 0x8000;
  
  private clientId: string;
  private clientSecret: string;
  private apiUrl: string;
  private config: TTSConfig;
  private currentSound: Sound | null = null;
  private currentFilePath: string | null = null;

  constructor() {
    // 환경 변수에서 API 키 가져오기
    this.clientId = Config.NAVER_CLOVA_CLIENT_ID || '';
    this.clientSecret = Config.NAVER_CLOVA_CLIENT_SECRET || '';
    this.apiUrl = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
    
    // 기본 설정
    this.config = {
      speaker: 'nara',  // 한국어 여성 음성 (나라)
      speed: 0,         // 보통 속도
      pitch: 0,         // 보통 높이
      volume: 0,        // 보통 볼륨
      format: 'mp3',
    };

    // Sound 라이브러리 초기화
    Sound.setCategory('Playback');
  }

  /**
   * TTS 설정 업데이트
   */
  setConfig(config: Partial<TTSConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 기본 언어 설정 (react-native-tts와 호환성을 위한 메서드)
   */
  setDefaultLanguage(language: string) {
    // Naver Clova는 speaker로 언어/음성을 결정
    // ko-KR의 경우 한국어 음성 사용
    if (language === 'ko-KR') {
      this.config.speaker = 'nara';
    }
  }

  /**
   * 기본 속도 설정 (react-native-tts와 호환성을 위한 메서드)
   */
  setDefaultRate(rate: number, ios?: boolean) {
    // react-native-tts는 0~1 범위, Clova는 -5~5 범위
    // 0.5를 기본값(0)으로, 0~1을 -5~5로 변환
    const clovaSpeed = Math.round((rate - 0.5) * 10);
    this.config.speed = Math.max(-5, Math.min(5, clovaSpeed));
  }

  /**
   * 기본 피치 설정 (react-native-tts와 호환성을 위한 메서드)
   */
  setDefaultPitch(pitch: number) {
    // react-native-tts는 0.5~2 범위, Clova는 -5~5 범위
    // 1.0을 기본값(0)으로 변환
    const clovaPitch = Math.round((pitch - 1.0) * 5);
    this.config.pitch = Math.max(-5, Math.min(5, clovaPitch));
  }

  /**
   * 텍스트를 음성으로 변환하여 재생
   */
  async speak(text: string): Promise<void> {
    try {
      if (!text || text.trim().length === 0) {
        console.warn('TTS: 빈 텍스트는 재생할 수 없습니다.');
        return;
      }

      // API 키 확인
      if (!this.clientId || !this.clientSecret) {
        console.error('TTS: Naver Clova API 키가 설정되지 않았습니다.');
        Alert.alert(
          'TTS 오류',
          'Naver Clova API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.'
        );
        return;
      }

      console.log('TTS: 음성 생성 시작:', text.substring(0, 50));

      // Naver Clova TTS API 호출
      const response = await axios.post(
        this.apiUrl,
        text,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-NCP-APIGW-API-KEY-ID': this.clientId,
            'X-NCP-APIGW-API-KEY': this.clientSecret,
          },
          params: {
            speaker: this.config.speaker,
            speed: this.config.speed,
            pitch: this.config.pitch,
            volume: this.config.volume,
            format: this.config.format,
          },
          responseType: 'arraybuffer',
        }
      );

      console.log('TTS: 음성 데이터 수신 완료');

      // 음성 데이터 재생
      await this.playAudio(response.data);

    } catch (error: any) {
      console.error('TTS: 음성 생성 오류:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('TTS API 에러 상세:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      
      // 사용자에게 에러 알림 (선택적)
      // Alert.alert('TTS 오류', '음성 생성 중 오류가 발생했습니다.');
    }
  }

  /**
   * 음성 데이터 재생
   */
  private async playAudio(audioData: ArrayBuffer): Promise<void> {
    try {
      // 기존 사운드 중지 및 임시 파일 정리
      await this.cleanup();

      // 임시 파일 경로 생성
      const fileName = `tts_${Date.now()}.mp3`;
      const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      this.currentFilePath = filePath;

      // ArrayBuffer를 Base64로 변환
      const base64Audio = this.arrayBufferToBase64(audioData);

      // 파일로 저장
      await RNFS.writeFile(filePath, base64Audio, 'base64');

      console.log('TTS: 오디오 파일 저장 완료:', filePath);

      // Sound 객체 생성 및 재생
      // 두 번째 파라미터가 빈 문자열이면 첫 번째 파라미터를 절대 경로로 간주
      this.currentSound = new Sound(filePath, '', (error) => {
        if (error) {
          console.error('TTS: 사운드 로드 실패:', error);
          // 에러 발생 시 임시 파일 정리 (비동기로 처리)
          this.cleanup().catch((err) => {
            console.warn('TTS: cleanup 중 오류:', err);
          });
          return;
        }

        console.log('TTS: 오디오 재생 시작');
        this.currentSound?.play((success) => {
          if (success) {
            console.log('TTS: 오디오 재생 완료');
          } else {
            console.error('TTS: 오디오 재생 실패');
          }

          // 재생 완료 후 리소스 정리 (비동기로 처리)
          this.cleanup().catch((err) => {
            console.warn('TTS: cleanup 중 오류:', err);
          });
        });
      });

    } catch (error) {
      console.error('TTS: 오디오 재생 오류:', error);
      await this.cleanup();
    }
  }

  /**
   * ArrayBuffer를 Base64로 변환
   * React Native 환경에서 동작하는 Base64 인코딩
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binaryString = '';
    
    // 바이너리 데이터를 문자열로 변환
    for (let i = 0; i < bytes.length; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    
    // react-native-base64를 사용하여 Base64 인코딩
    return base64.encode(binaryString);
  }

  /**
   * 리소스 정리 (사운드 중지 및 임시 파일 삭제)
   */
  private async cleanup(): Promise<void> {
    // 사운드 리소스 해제
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.release();
      this.currentSound = null;
    }

    // 임시 파일 삭제
    if (this.currentFilePath) {
      try {
        await RNFS.unlink(this.currentFilePath);
        console.log('TTS: 임시 파일 삭제 완료');
      } catch (err) {
        console.warn('TTS: 임시 파일 삭제 실패:', err);
      }
      this.currentFilePath = null;
    }
  }

  /**
   * 현재 재생 중인 음성 중지
   */
  async stop(): Promise<void> {
    try {
      console.log('TTS: 음성 재생 중지');
      await this.cleanup();
    } catch (error) {
      console.error('TTS: 음성 중지 오류:', error);
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const tts = new NaverClovaTTS();
export default tts;
