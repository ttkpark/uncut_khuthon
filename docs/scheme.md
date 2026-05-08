# DB 스키마 정의

## 테이블 목록

- [users](#users) — 사용자
- [works](#works) — 작품 (책 / LP판 / TV 등)
- [conversations](#conversations) — 작품별 대화 세션
- [messages](#messages) — 대화 메시지
- [summaries](#summaries) — AI 생성 요약/독서록

---

## users

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 사용자 고유 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 (로그인 식별자) |
| nickname | VARCHAR(50) | NOT NULL | 표시 이름 |
| created_at | TIMESTAMPTZ | DEFAULT now() | 가입일 |

---

## works

사용자가 등록한 작품(책, LP, TV 프로그램 등)을 저장합니다.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 작품 고유 ID |
| user_id | UUID | FK → users.id, NOT NULL | 소유 사용자 |
| title | VARCHAR(255) | NOT NULL | 작품 제목 |
| category | VARCHAR(20) | NOT NULL | 카테고리: `book` / `lp` / `tv` |
| cover_url | TEXT | NULLABLE | 커버 이미지 URL |
| created_at | TIMESTAMPTZ | DEFAULT now() | 등록일 |

---

## conversations

작품 하나에 여러 번의 대화 세션이 생길 수 있습니다.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 대화 세션 고유 ID |
| work_id | UUID | FK → works.id, NOT NULL | 대상 작품 |
| user_id | UUID | FK → users.id, NOT NULL | 대화한 사용자 |
| started_at | TIMESTAMPTZ | DEFAULT now() | 세션 시작 시각 |
| ended_at | TIMESTAMPTZ | NULLABLE | 세션 종료 시각 |

---

## messages

대화 세션 안의 개별 발화를 저장합니다.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 메시지 고유 ID |
| conversation_id | UUID | FK → conversations.id, NOT NULL | 소속 대화 세션 |
| role | VARCHAR(10) | NOT NULL | `user` 또는 `assistant` |
| content | TEXT | NOT NULL | 메시지 본문 |
| created_at | TIMESTAMPTZ | DEFAULT now() | 발화 시각 |

---

## summaries

대화 종료 후 AI가 생성한 독서록/감상 요약을 저장합니다.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 요약 고유 ID |
| conversation_id | UUID | FK → conversations.id, UNIQUE | 대상 대화 (1:1) |
| work_id | UUID | FK → works.id, NOT NULL | 대상 작품 (조회 편의) |
| content | TEXT | NOT NULL | AI 생성 요약 본문 |
| created_at | TIMESTAMPTZ | DEFAULT now() | 생성일 |

---

## 관계 다이어그램

```
users
 ├── works (1:N)
 │    └── conversations (1:N)
 │         ├── messages (1:N)
 │         └── summaries (1:1)
 └── conversations (1:N)
```

## 카테고리 값 정의

| 값 | 화면 표시 | 설명 |
|----|-----------|------|
| `book` | 책 | 도서 |
| `lp` | LP판 | 음반 |
| `tv` | TV | 드라마·영화·예능 등 영상 콘텐츠 |
