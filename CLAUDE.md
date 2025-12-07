# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Field Uploader** - 휠 복원 현장 기술자를 위한 스마트폰 사진 촬영 PWA

| 레이어 | 기술 |
|--------|------|
| Frontend | Vanilla JS (ES6), PWA |
| Storage | IndexedDB (Dexie.js) |
| Build | Vite + vite-plugin-pwa |
| Sync | PocketBase SDK |
| Test | Playwright E2E |

---

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server → http://localhost:5173
npm run build            # Production build → dist/
npm run preview          # Preview production build
npm test                 # Playwright E2E tests
```

---

## Architecture

```
src/
├── main.js              # Entry point
├── camera.js            # 카메라 API 래퍼
├── compress.js          # 이미지 압축 (browser-image-compression)
├── db.js                # IndexedDB (Dexie.js) 오프라인 큐
└── sync.js              # PocketBase 동기화
public/
└── manifest.json        # PWA manifest
tests/
└── e2e/                 # Playwright E2E tests
```

### Data Flow

```
카메라 촬영 → 이미지 압축 → IndexedDB 저장 → PocketBase 동기화
                              (오프라인 큐)      (온라인 시)
```

---

## Photo Categories

| Category | Korean | Description |
|----------|--------|-------------|
| `before_car` | 입고 | 차량 전체 |
| `before_wheel` | 문제 | 손상 휠 클로즈업 |
| `during` | 과정 | 작업 중 |
| `after_wheel` | 해결 | 복원 휠 클로즈업 |
| `after_car` | 출고 | 완료 차량 |

---

## Related Repositories

| 레포 | 용도 |
|------|------|
| [contents-factory](https://github.com/garimto81/contents-factory) | 메인 PWA + PocketBase 서버 |
| [shorts-generator](https://github.com/garimto81/shorts-generator) | PC 쇼츠 영상 생성 CLI |

---

## Environment

PocketBase 서버 연결 설정:

```javascript
// src/sync.js
const POCKETBASE_URL = 'http://localhost:8090';
```
