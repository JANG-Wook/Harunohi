// 리소스 충돌(중복 이메일 등)을 나타내는 예외 (전역 핸들러가 409 로 변환).
package net.infobank.harunohi.service;

public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
