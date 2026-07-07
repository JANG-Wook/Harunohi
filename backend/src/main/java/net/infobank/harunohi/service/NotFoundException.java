// 요청한 리소스를 찾지 못했을 때 던지는 예외 (전역 핸들러가 404 로 변환).
package net.infobank.harunohi.service;

public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
