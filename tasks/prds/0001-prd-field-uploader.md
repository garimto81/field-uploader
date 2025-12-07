# PRD: Field Uploader - 현장 사진 업로드 PWA

**Version**: 1.0
**Date**: 2025-12-08
**Author**: Claude Code
**Status**: Draft

---

## 1. 개요 (Executive Summary)

### 1.1 목적
휠 복원 기술자가 현장에서 스마트폰으로 작업 사진을 촬영하고, 자동으로 서버에 업로드하는 PWA(Progressive Web App) 개발.

### 1.2 배경
- 현장 기술자는 작업 전/후 사진을 촬영해야 함
- 기존 방식: 카톡/문자로 사진 전송 → 관리 어려움
- 네트워크 불안정한 현장 환경 대응 필요

### 1.3 핵심 가치
| 항목 | 기존 | 개선 |
|------|------|------|
| 사진 전송 | 카톡/문자 수동 전송 | 앱에서 자동 업로드 |
| 오프라인 | 불가 | 큐잉 후 자동 동기화 |
| 이미지 용량 | 원본 그대로 (5-10MB) | 자동 압축 (500KB) |
| 사진 관리 | 채팅방에서 검색 | 서버 DB 체계적 관리 |

---

## 2. 대상 사용자

### 2.1 Primary User: 현장 기술자
- **규모**: 1-10명 (내부 직원)
- **기술 수준**: 비개발자, 스마트폰 기본 사용 가능
- **사용 환경**:
  - 작업 현장 (지하 주차장, 야외 등)
  - 네트워크 불안정 가능
  - Android/iOS 스마트폰

### 2.2 Secondary User: 관리자
- 업로드된 사진 확인 및 관리
- PocketBase 대시보드 또는 별도 관리 앱 사용

### 2.3 인증
- **방식**: SSO/OAuth (회사 시스템 연동)
- **구현 우선순위**: Phase 2 이후 (초기에는 인증 없이 시작 가능)

---

## 3. 핵심 기능

### 3.1 카메라 촬영
**Priority**: P0 (필수)
**Description**: 스마트폰 카메라로 직접 사진 촬영

| 요구사항 | 상세 |
|----------|------|
| 입력 방식 | File input with `capture="environment"` |
| 카메라 | 후면 카메라 기본 |
| 파일 형식 | JPEG |
| 권한 | 카메라/저장소 접근 권한 요청 |

### 3.2 이미지 압축
**Priority**: P0 (필수)
**Description**: 업로드 전 자동 압축으로 데이터 절약

| 요구사항 | 상세 |
|----------|------|
| 목표 용량 | 500KB 이하 |
| 라이브러리 | browser-image-compression |
| 품질 유지 | 시각적 품질 손실 최소화 |
| 썸네일 | 목록 표시용 별도 생성 |

### 3.3 오프라인 큐잉
**Priority**: P1 (중요)
**Description**: 오프라인 상태에서도 사진 저장 후 자동 동기화

| 요구사항 | 상세 |
|----------|------|
| 저장소 | IndexedDB (Dexie.js) |
| 큐 상태 | pending / uploading / completed / failed |
| 재시도 | 실패 시 자동 재시도 (retry_count 관리) |
| 동기화 | 온라인 복귀 시 자동 시작 |

### 3.4 서버 업로드
**Priority**: P0 (필수)
**Description**: PocketBase API로 사진 업로드

| 요구사항 | 상세 |
|----------|------|
| 백엔드 | PocketBase |
| Endpoint | `POST /api/collections/photos/records` |
| 데이터 | FormData (title, image, thumbnail) |
| 에러 처리 | 실패 시 큐에 유지, 재시도 |

### 3.5 PWA 설치
**Priority**: P1 (중요)
**Description**: 홈 화면에 앱처럼 설치

| 요구사항 | 상세 |
|----------|------|
| Service Worker | vite-plugin-pwa 자동 생성 |
| Manifest | 앱 이름, 아이콘, 테마 색상 |
| 설치 프롬프트 | "홈 화면에 추가" 안내 |
| 오프라인 | 앱 셸 캐싱 |

---

## 4. 기술 스택

### 4.1 Frontend
| 기술 | 선택 이유 |
|------|----------|
| Vanilla JS (ES6) | 경량, 빠른 로딩, 빌드 단순 |
| PWA | 네이티브 앱 없이 설치 가능 |
| Vite | 빠른 HMR, PWA 플러그인 지원 |

### 4.2 Storage
| 기술 | 선택 이유 |
|------|----------|
| IndexedDB | 브라우저 내장, 대용량 Blob 저장 |
| Dexie.js | IndexedDB 래퍼, 간결한 API |

### 4.3 Backend
| 기술 | 선택 이유 |
|------|----------|
| PocketBase | 올인원 백엔드, 파일 저장 내장 |

### 4.4 Testing
| 기술 | 선택 이유 |
|------|----------|
| Playwright | E2E 테스트, 모바일 에뮬레이션 |

---

## 5. 데이터 모델

### 5.1 IndexedDB Schema

**Table: upload_queue**
```javascript
{
  id: number,          // Auto-increment
  title: string,       // 사진 제목
  image_data: string,  // Base64 압축 이미지
  thumbnail_data: string, // Base64 썸네일
  status: string,      // pending | uploading | completed | failed
  created_at: string,  // ISO timestamp
  synced_at: string,   // ISO timestamp
  retry_count: number, // 재시도 횟수
  error: string        // 에러 메시지
}
```

**Table: settings**
```javascript
{
  key: string,    // 설정 키 (Primary Key)
  value: any      // 설정 값
}
```

### 5.2 PocketBase Collection: photos
| Field | Type | Description |
|-------|------|-------------|
| id | string | PocketBase auto-generated |
| title | string | 사진 제목 |
| image | file | 압축된 이미지 파일 |
| thumbnail | file | 썸네일 이미지 |
| created | datetime | 생성 시간 |

---

## 6. 사용자 흐름

### 6.1 기본 흐름
```
1. 앱 열기 (PWA 또는 브라우저)
2. "사진 촬영" 버튼 클릭
3. 카메라 실행 → 촬영
4. 제목 입력 (선택)
5. 자동 압축 → 큐에 저장
6. 온라인이면 즉시 업로드
7. 완료 표시
```

### 6.2 오프라인 흐름
```
1. 오프라인 상태에서 촬영
2. 압축 → 큐에 "pending" 저장
3. 큐 목록에 "대기 중" 표시
4. 온라인 복귀 감지
5. 자동 동기화 시작
6. 완료되면 "완료" 표시
```

### 6.3 실패 처리 흐름
```
1. 업로드 실패
2. 상태 "failed"로 변경
3. retry_count 증가
4. 다음 동기화 시 재시도
5. 수동 재시도 버튼 제공
```

---

## 7. UI/UX 요구사항

### 7.1 디자인 원칙
- **간결함**: 최소한의 UI, 핵심 기능만
- **접근성**: 큰 버튼, 명확한 아이콘
- **피드백**: 모든 액션에 즉각적인 피드백
- **다크 테마**: 야외 가시성, 배터리 절약

### 7.2 주요 화면
| 화면 | 구성 요소 |
|------|----------|
| 메인 | 촬영 버튼, 큐 상태, 최근 업로드 |
| 촬영 | 카메라 뷰, 촬영 버튼 |
| 큐 목록 | 대기/진행/완료/실패 상태별 표시 |
| 설정 | 서버 URL, 압축 품질 (향후) |

### 7.3 상태 표시
| 상태 | 아이콘 | 색상 |
|------|--------|------|
| pending | 시계 | 노란색 |
| uploading | 스피너 | 파란색 |
| completed | 체크 | 초록색 |
| failed | X | 빨간색 |

---

## 8. 비기능 요구사항

### 8.1 성능
| 항목 | 목표 |
|------|------|
| 초기 로딩 | < 3초 (3G 환경) |
| 압축 시간 | < 2초 (5MB 이미지) |
| 업로드 시간 | < 5초 (500KB, 4G) |
| 번들 크기 | < 200KB (gzip) |

### 8.2 호환성
| 환경 | 지원 |
|------|------|
| Chrome Mobile | 최신 2개 버전 |
| Safari Mobile | iOS 14+ |
| Android WebView | Chrome 기반 |

### 8.3 보안
- HTTPS 필수 (PWA 요구사항)
- 카메라 권한 명시적 요청
- API 인증 (Phase 2 이후)

---

## 9. 성공 지표 (KPI)

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 업로드 성공률 | > 95% | failed / total |
| 오프라인 복구율 | > 99% | synced / queued |
| 평균 업로드 시간 | < 10초 | 촬영~완료 |
| PWA 설치율 | > 50% | 설치 / 총 사용자 |

---

## 10. 마일스톤

### Phase 0: 요구사항 (현재)
- [x] PRD 작성
- [ ] 기술 검토

### Phase 1: MVP 구현
- [ ] 카메라 촬영
- [ ] 이미지 압축
- [ ] IndexedDB 큐
- [ ] PocketBase 업로드
- [ ] 기본 UI

### Phase 2: PWA + 인증
- [ ] Service Worker
- [ ] 오프라인 지원
- [ ] PWA 설치
- [ ] SSO/OAuth 연동

### Phase 3: 안정화
- [ ] E2E 테스트
- [ ] 에러 처리 개선
- [ ] 성능 최적화

### Phase 4: 배포
- [ ] 프로덕션 빌드
- [ ] 서버 배포
- [ ] 사용자 교육

---

## 11. 제약사항 및 의존성

### 11.1 제약사항
- 브라우저 카메라 API 제한 (HTTPS 필수)
- iOS Safari의 PWA 제한 (푸시 알림 없음)
- IndexedDB 용량 제한 (브라우저별 상이)

### 11.2 외부 의존성
| 의존성 | 버전 | 용도 |
|--------|------|------|
| PocketBase | 최신 | 백엔드 서버 |
| contents-factory | - | 메인 PWA 서버 |

---

## 12. 리스크

| 리스크 | 영향 | 완화 방안 |
|--------|------|----------|
| 브라우저 호환성 | 중 | 주요 브라우저 테스트, 폴리필 |
| 오프라인 데이터 손실 | 고 | IndexedDB persistence 확인 |
| 대용량 이미지 압축 지연 | 저 | Web Worker 사용 검토 |
| PocketBase 서버 다운 | 중 | 로컬 큐 유지, 재시도 로직 |

---

## 13. 관련 문서

- [README.md](../../README.md) - 프로젝트 개요
- [CLAUDE.md](../../CLAUDE.md) - 개발 가이드
- [contents-factory](https://github.com/garimto81/contents-factory) - 메인 서버

---

**Next Steps**:
1. PRD 검토 및 승인
2. `/todo` 실행하여 Task 목록 생성
3. Phase 1 구현 시작
