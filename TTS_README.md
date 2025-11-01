# Naver Clova TTS 구현

이 프로젝트는 `react-native-tts` 대신 Naver Clova TTS API를 사용합니다.

## 설정 방법

1. Naver Cloud Platform에서 API 키 발급
   - https://www.ncloud.com/product/aiService/clovaVoice 방문
   - Clova Voice 서비스 활성화
   - API 키 (Client ID 및 Client Secret) 발급

2. `.env` 파일 생성
   ```bash
   cp .env.example .env
   ```

3. `.env` 파일에 API 키 입력
   ```
   NAVER_CLOVA_CLIENT_ID=your_client_id_here
   NAVER_CLOVA_CLIENT_SECRET=your_client_secret_here
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

NaverClovaTTS 서비스는 기존 `react-native-tts`와 동일한 인터페이스를 제공합니다:

```typescript
import Tts from '../services/NaverClovaTTS';

// 기본 설정
Tts.setDefaultLanguage('ko-KR');
Tts.setDefaultRate(0.5);
Tts.setDefaultPitch(1.0);

// 음성 재생
Tts.speak('안녕하세요!');
```

## 주요 기능

- Naver Clova Voice API를 사용한 고품질 TTS
- 한국어 음성 지원 (기본: 나라)
- 속도, 피치, 볼륨 조절 가능
- 기존 `react-native-tts`와 호환되는 API

## 의존성

- `react-native-sound`: 오디오 재생
- `react-native-fs`: 임시 파일 저장
- `react-native-config`: 환경 변수 관리
