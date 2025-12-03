import axios from 'axios';
import { Alert } from 'react-native';
import Config from 'react-native-config';
import TrackPlayer, { Capability, State } from 'react-native-track-player';
import RNFS from 'react-native-fs';
import base64 from 'react-native-base64';

/**
 * Google Gemini TTS Service
 * 
 * Google Gemini 2.5 Flash TTS API를 사용하여 텍스트를 음성으로 변환합니다.
 * API 문서: https://ai.google.dev/gemini-api/docs/text-to-speech
 */

interface TTSConfig {
  voiceName?: string;    // 음성 이름 (예: 'ko-KR-Neural2-A', 'ko-KR-Neural2-B' 등)
  languageCode?: string; // 언어 코드 (예: 'ko-KR')
  speakingRate?: number; // 음성 속도 (0.25 ~ 4.0, 기본값 1.0)
  pitch?: number;        // 음성 높이 (-20.0 ~ 20.0, 기본값 0.0)
  volumeGainDb?: number; // 음성 볼륨 (-96.0 ~ 16.0, 기본값 0.0)
}

class GeminiTTS {
  private apiKey: string;
  private apiUrl: string;
  private config: TTSConfig;
  private currentFilePath: string | null = null;
  private isSpeaking: boolean = false;
  private isPlayerSetup: boolean = false;

  constructor() {
    // 환경 변수에서 API 키 가져오기
    this.apiKey = Config.GOOGLE_GEMINI_API_KEY || '';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    
    // 기본 설정
    this.config = {
      voiceName: 'ko-KR-Neural2-A',  // 한국어 여성 음성
      languageCode: 'ko-KR',
      speakingRate: 1.0,              // 보통 속도
      pitch: 0.0,                     // 보통 높이
      volumeGainDb: 0.0,              // 보통 볼륨
    };

    // TrackPlayer는 필요할 때 초기화 (lazy initialization)
    // 앱이 포어그라운드에 있을 때만 초기화 가능
  }

  /**
   * TrackPlayer 초기화 (lazy initialization)
   */
  private async setupPlayer(): Promise<void> {
    if (this.isPlayerSetup) {
      return;
    }

    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
        compactCapabilities: [Capability.Play, Capability.Stop],
      });
      this.isPlayerSetup = true;
      console.log('TTS: TrackPlayer 초기화 완료');
    } catch (error) {
      console.error('TTS: TrackPlayer 초기화 오류:', error);
      // 이미 초기화되어 있을 수 있음
      this.isPlayerSetup = true;
    }
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
    // 언어 코드 설정
    this.config.languageCode = language;
    
    // 한국어의 경우 한국어 음성 사용
    if (language === 'ko-KR') {
      this.config.voiceName = 'ko-KR-Neural2-A';
    }
  }

  /**
   * 기본 속도 설정 (react-native-tts와 호환성을 위한 메서드)
   */
  setDefaultRate(rate: number, ios?: boolean) {
    // react-native-tts는 0~1 범위, Gemini는 0.25~4.0 범위
    // 0.5를 기본값(1.0)으로 변환
    const geminiRate = rate * 2.0; // 0~1을 0~2로 변환
    this.config.speakingRate = Math.max(0.25, Math.min(4.0, geminiRate));
  }

  /**
   * 기본 피치 설정 (react-native-tts와 호환성을 위한 메서드)
   */
  setDefaultPitch(pitch: number) {
    // react-native-tts는 0.5~2 범위, Gemini는 -20~20 범위
    // 1.0을 기본값(0.0)으로 변환
    const geminiPitch = (pitch - 1.0) * 20;
    this.config.pitch = Math.max(-20.0, Math.min(20.0, geminiPitch));
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

      // 이미 재생 중인 경우 기존 재생을 중지하고 새로운 재생 시작
      if (this.isSpeaking) {
        console.log('TTS: 기존 음성 중지 후 새로운 음성 재생');
        await this.cleanup();
      }

      this.isSpeaking = true;

      // API 키 확인
      if (!this.apiKey) {
        console.error('TTS: Google Gemini API 키가 설정되지 않았습니다.');
        Alert.alert(
          'TTS 오류',
          'Google Gemini API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.'
        );
        this.isSpeaking = false;
        return;
      }

      // Player 설정 대기
      if (!this.isPlayerSetup) {
        await this.setupPlayer();
      }

      console.log('TTS: 음성 생성 시작:', text.substring(0, 50));

      // Google Cloud Text-to-Speech API 호출
      await this.synthesizeSpeech(text);

    } catch (error: any) {
      console.error('TTS: 음성 생성 오류:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('TTS API 에러 상세:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      
      this.isSpeaking = false;
      // 사용자에게 에러 알림 (선택적)
      // Alert.alert('TTS 오류', '음성 생성 중 오류가 발생했습니다.');
    }
  }

  /**
   * Google Cloud Text-to-Speech API를 사용하여 음성 합성
   */
  private async synthesizeSpeech(text: string): Promise<void> {
    try {
      const ttsApiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;
      
      const response = await axios.post(
        ttsApiUrl,
        {
          input: { text: text },
          voice: {
            languageCode: this.config.languageCode,
            name: this.config.voiceName,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: this.config.speakingRate,
            pitch: this.config.pitch,
            volumeGainDb: this.config.volumeGainDb,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('TTS: 음성 데이터 수신 완료');

      // Base64로 인코딩된 오디오 데이터
      const audioContent = response.data.audioContent;
      
      // 음성 데이터 재생
      await this.playAudioFromBase64(audioContent);

    } catch (error: any) {
      console.error('TTS: 음성 합성 오류:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('TTS API 에러 상세:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      
      this.isSpeaking = false;
      throw error;
    }
  }

  /**
   * Base64 인코딩된 오디오 데이터 재생
   */
  private async playAudioFromBase64(base64Audio: string): Promise<void> {
    try {
      // 기존 사운드 중지 및 임시 파일 정리
      await this.cleanup();

      // 임시 파일 경로 생성
      const fileName = `tts_${Date.now()}.mp3`;
      const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      this.currentFilePath = filePath;

      // 파일로 저장
      await RNFS.writeFile(filePath, base64Audio, 'base64');

      console.log('TTS: 오디오 파일 저장 완료:', filePath);

      // TrackPlayer에 트랙 추가 및 재생
      await TrackPlayer.reset();
      await TrackPlayer.add({
        url: `file://${filePath}`,
        title: 'TTS Audio',
        artist: 'Google TTS',
      });

      console.log('TTS: 오디오 재생 시작');
      await TrackPlayer.play();

      // 재생 완료 대기
      this.waitForPlaybackEnd();

    } catch (error) {
      console.error('TTS: 오디오 재생 오류:', error);
      this.isSpeaking = false;
      await this.cleanup();
    }
  }

  /**
   * 재생 완료 대기
   */
  private async waitForPlaybackEnd(): Promise<void> {
    const checkInterval = setInterval(async () => {
      try {
        const state = await TrackPlayer.getState();
        
        if (state === State.Stopped || state === State.None || state === State.Ended) {
          clearInterval(checkInterval);
          console.log('TTS: 오디오 재생 완료');
          this.isSpeaking = false;
          await this.cleanup();
        }
      } catch (error) {
        clearInterval(checkInterval);
        console.error('TTS: 재생 상태 확인 오류:', error);
        this.isSpeaking = false;
      }
    }, 500);
  }

  /**
   * 리소스 정리 (사운드 중지 및 임시 파일 삭제)
   */
  private async cleanup(): Promise<void> {
    // 사운드 리소스 해제
    try {
      const state = await TrackPlayer.getState();
      if (state === State.Playing || state === State.Paused) {
        await TrackPlayer.stop();
      }
      await TrackPlayer.reset();
    } catch (error) {
      console.warn('TTS: TrackPlayer cleanup 중 오류:', error);
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
      this.isSpeaking = false;
      await this.cleanup();
    } catch (error) {
      console.error('TTS: 음성 중지 오류:', error);
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const tts = new GeminiTTS();
export default tts;
