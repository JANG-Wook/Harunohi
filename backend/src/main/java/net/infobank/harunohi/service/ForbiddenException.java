// 접근 권한 없음(워크스페이스 멤버 아님 등)을 나타내는 예외 (전역 핸들러가 403 으로 변환).
package net.infobank.harunohi.service;

public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
