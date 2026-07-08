# Harunohi Backend

Spring Boot 3.5 / Java 21 / MySQL 8 백엔드 스켈레톤이다. 현재는 컴파일·기동·MySQL 연결 배선만 포함한다.

## 스택

- Spring Boot 3.5.x (web, data-jpa, actuator, validation)
- Flyway (스키마 마이그레이션 소유)
- MySQL 8 (`com.mysql:mysql-connector-j`)
- Gradle (wrapper 커밋됨), 패키지 베이스 `net.infobank.harunohi`

## 사전 준비

- Java 21
- 실행 중인 MySQL 8 인스턴스와 대상 데이터베이스(예: `harunohi`)

## 환경변수 (필수)

데이터소스 설정은 환경변수로 주입한다. 비밀번호는 기본값이 없으므로 반드시 지정해야 한다 (보안 정책상 저장소에 자격증명 커밋 금지).

| 변수 | 기본값 | 비고 |
|------|--------|------|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/harunohi?...` | 로컬 개발 기본값 제공 |
| `SPRING_DATASOURCE_USERNAME` | `harunohi` | 로컬 개발 기본값 제공 |
| `SPRING_DATASOURCE_PASSWORD` | (없음) | 반드시 환경변수로 지정 |
| `JWT_SECRET` | (없음) | HS256 서명 비밀. 최소 32바이트. 미설정 시 앱이 기동되지 않음 |
| `JWT_ACCESS_EXP_MIN` | `120` | 액세스 토큰 만료(분) |

## 실행

```bash
export SPRING_DATASOURCE_PASSWORD='<your-db-password>'
export JWT_SECRET='<32바이트 이상의 충분히 긴 비밀 문자열>'
# 필요 시 URL/USERNAME 도 재정의
# export SPRING_DATASOURCE_URL='jdbc:mysql://localhost:3306/harunohi'
# export SPRING_DATASOURCE_USERNAME='harunohi'

./gradlew bootRun
```

기동 시 Flyway 가 `src/main/resources/db/migration/V1__init.sql` 을 적용한다. JPA 는 `ddl-auto=validate` 이므로 스키마를 생성하지 않는다.

## 확인

- 액추에이터 헬스: `GET http://localhost:8080/actuator/health`
- 커스텀 핑: `GET http://localhost:8080/api/ping` → `{"status":"ok"}`

## 빌드 / 컴파일

```bash
./gradlew compileJava      # 컴파일만
./gradlew build -x test    # 전체 빌드 (테스트 제외)
```

## 이후 청크로 미룬 범위

- refresh 토큰 (현재는 access token 만)
- 역할(role)별 세분화된 권한 (현재는 멤버십 유무만 검증)
- 봇 정의(시나리오/노드 그래프) 영속화 및 발행 (`bot_deployment_versions`)
- 대화(conversation) 런타임 API 및 위젯 프로토콜
