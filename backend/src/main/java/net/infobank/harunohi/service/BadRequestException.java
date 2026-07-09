// 잘못된 요청(유효하지 않은 JSON, 크기 초과 등)을 나타내는 예외 (전역 핸들러가 400 으로 변환).
package net.infobank.harunohi.service;

public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
