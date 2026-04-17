# AI TalkTalk Frontend

`AI TalkTalk`은 아동 대상 상담/대화형 케어 모바일 앱입니다.  
아이와의 대화를 바탕으로 감정, 관심사, 하루 일과를 요약해 보호자에게 전달하고, 퀴즈 형식으로 아이들의 상식 학습을 돕습니다.

## 👀 한눈에 보기
- 🎯 **무엇을 푸는 서비스인가?**: 아이의 감정/관심사/일과를 대화 기반으로 파악하고, 보호자가 더 쉽게 이해하도록 돕는 상담형 서비스
- 🧭 **핵심 사용자 흐름**: 로그인 -> 메인 -> AI 대화 -> 🔐 부모 비밀번호 인증 -> 대화 요약 확인 -> 퀴즈/랭킹/마이페이지
- 🛠️ **기술적 특징**: React Native 기반 크로스플랫폼, 환경변수 기반 API 분리, Google TTS 연동

---

## 1) 🧒 서비스 개요

### ✨ 주요 기능
- 💬 **AI 대화(`Chat`)**: 아이의 감정, 관심사, 하루 일과를 자연스럽게 이끌어내는 상담형 대화
- 📝 **대화 요약(`ChatSummary`)**: 대화 내용을 감정/관심사/일과 중심으로 요약
- 🔐 **보호자 전용 접근 제어**: 대화 요약은 **부모가 설정한 비밀번호**를 통해서만 확인 가능
- 🧠 **퀴즈(`Quiz`)**: 퀴즈 형식으로 아이들의 상식 학습 지원
- 🏆 **랭킹(`Ranking`)**: 사용자 동기 부여
- 👥 **친구(`Friends`) / 마이페이지(`MyPage`)**: 소셜 및 개인 관리
- 🔊 **음성 재생(TTS)**: Google Cloud Text-to-Speech 기반 음성 출력

### 📱 화면 구성(네비게이션 기준)
- `Login`
- `SignUp`
- `Main`
- `Chat`
- `Quiz`
- `Friends`
- `Ranking`
- `MyPage`
- `ChatSummary`

---

## 2) 🛠️ 기술 스택

- 🧱 **Framework**: React Native `0.79.2` (렌더링 코어: React `19`)
- 🧾 **Language**: TypeScript
- 🧭 **Navigation**: `@react-navigation/native`, `@react-navigation/stack`
- 🌐 **HTTP Client**: `axios`
- 💾 **State/Persistence(로컬)**: `@react-native-async-storage/async-storage`
- 🔊 **TTS/Audio**: Google Cloud Text-to-Speech API, `react-native-track-player`, `react-native-fs`
- ⚙️ **Config**: `react-native-config`
- ✅ **Quality**: ESLint, Prettier, Jest

---

## 3) 🗂️ 프로젝트 구조

```text
Front-Backup/
├── App.tsx
├── index.js
├── src/
│   ├── api/
│   │   └── axios.ts              # API 클라이언트(baseURL: API_URL)
│   ├── components/               # 공통 UI 컴포넌트
│   ├── navigation/
│   │   └── AppNavigator.tsx      # 스택 네비게이션 및 화면 라우팅
│   ├── screens/                  # 주요 화면(Login, Chat, Quiz 등)
│   ├── services/
│   │   └── GeminiTTS.ts          # Google TTS 연동 서비스
│   └── declarations.d.ts
├── android/                      # Android 네이티브 프로젝트
├── ios/                          # iOS 네이티브 프로젝트
├── .env.example                  # 환경 변수 예시
├── TTS_README.md                 # TTS 상세 문서
└── package.json
```

---

## 4) 🤝 협업을 위한 환경 설정

### 4-1. 📌 사전 준비
- Node.js `>= 18`
- npm (기본)
- React Native 개발 환경(Android Studio / Xcode)  
  - 공식 가이드: [React Native 환경 설정](https://reactnative.dev/docs/set-up-your-environment)
- (iOS 개발 시) Ruby + Bundler + CocoaPods

### 4-2. 📦 저장소 클론 및 의존성 설치

```bash
npm install
```

### 4-3. 🔑 환경 변수 설정

`.env.example`를 복사해 `.env`를 생성합니다.

```bash
cp .env.example .env
```

`.env` 값 예시:

```env
API_URL=http://your-api-url-here
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

- `API_URL`: 백엔드 서버 주소 (`src/api/axios.ts`에서 사용)
- `GOOGLE_GEMINI_API_KEY`: TTS 음성 합성 API 키

### 4-4. 🍎 iOS 추가 설정(해당 시)

```bash
bundle install
bundle exec pod install --project-directory=ios
```

### 4-5. 🚀 앱 실행

각 명령은 **별도 터미널**에서 실행하는 것을 권장합니다.

```bash
# 터미널 1: Metro
npm start

# 터미널 2: Android
npm run android

# 터미널 2 (대신): iOS
npm run ios
```

---

## 5) 📏 팀 협업 컨벤션

- 🔒 `.env`, API 키 등 **민감 정보는 커밋 금지**
- ✅ PR 전 최소 체크:
  - `npm run lint`
  - `npm test`
  - Android/iOS 중 최소 1개 플랫폼 실행 확인
- 🔄 API 스펙 변경 시:
  - `.env.example` 업데이트
  - `README.md`의 실행/설정 섹션 동기화

---

## 6) ⌨️ 자주 사용하는 스크립트

```bash
npm start       # Metro 실행
npm run android # Android 실행
npm run ios     # iOS 실행
npm run lint    # ESLint 검사
npm test        # Jest 테스트
```

---

## 7) 🧯 문제 해결 가이드

- ⚠️ 환경 변수 인식이 안 될 때:
  - `.env` 파일 존재 여부 확인
  - 앱 재빌드(`npm run android` 또는 `npm run ios`)
- ⚠️ iOS 빌드 실패 시:
  - `bundle exec pod install --project-directory=ios` 재실행
- ⚠️ TTS 오류/세부 설정:
  - `TTS_README.md` 참고

---

## 8) 🔗 참고 문서

- [React Native 공식 문서](https://reactnative.dev)
- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech/pricing)
