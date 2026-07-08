// 인증 실패(잘못된 자격증명/미인증)를 나타내는 예외 (전역 핸들러가 401 로 변환).
package net.infobank.harunohi.service;

public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
