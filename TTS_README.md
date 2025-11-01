# Google Gemini TTS 구현

이 프로젝트는 `react-native-tts` 대신 Google Gemini (Google Cloud Text-to-Speech) API를 사용합니다.

## 설정 방법

1. Google AI Studio에서 API 키 발급
   - https://makersuite.google.com/app/apikey 방문
   - Google Cloud Console에서 Text-to-Speech API 활성화
   - API 키 발급

2. `.env` 파일 생성
   ```bash
   cp .env.example .env
   ```

3. `.env` 파일에 API 키 입력
   ```
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

4. 의존성 설치
   ```bash
   npm install
   # 또는
   yarn install
   ```

5. iOS의 경우 추가 설정
   ```bash
   cd ios
   pod install
   cd ..
   ```

## 사용 방법

GeminiTTS 서비스는 기존 `react-native-tts`와 동일한 인터페이스를 제공합니다:

```typescript
import Tts from '../services/GeminiTTS';

// 기본 설정
Tts.setDefaultLanguage('ko-KR');
Tts.setDefaultRate(0.5);
Tts.setDefaultPitch(1.0);

// 음성 재생
Tts.speak('안녕하세요!');
```

## 주요 기능

- Google Cloud Text-to-Speech API를 사용한 고품질 TTS
- 한국어 음성 지원 (기본: ko-KR-Neural2-A)
- 속도, 피치, 볼륨 조절 가능
- 기존 `react-native-tts`와 호환되는 API

## 지원 음성

- `ko-KR-Neural2-A`: 한국어 여성 음성
- `ko-KR-Neural2-B`: 한국어 남성 음성
- `ko-KR-Neural2-C`: 한국어 여성 음성 (대안)

음성 변경:
```typescript
Tts.setConfig({ voiceName: 'ko-KR-Neural2-B' });
```

## 의존성

- `react-native-sound`: 오디오 재생
- `react-native-fs`: 임시 파일 저장
- `react-native-config`: 환경 변수 관리
- `react-native-base64`: Base64 인코딩

## API 요금

Google Cloud Text-to-Speech API는 무료 할당량이 있습니다:
- 매월 최대 100만 자까지 무료 (Standard 음성)
- 매월 최대 100만 자까지 무료 (Neural2 음성, 첫 12개월)

자세한 요금 정보: https://cloud.google.com/text-to-speech/pricing
