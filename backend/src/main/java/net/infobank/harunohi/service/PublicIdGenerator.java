// 외부 식별자용 ULID(26자 Crockford base32) 를 생성하는 유틸 컴포넌트.
package net.infobank.harunohi.service;

import org.springframework.stereotype.Component;

import com.github.f4b6a3.ulid.UlidCreator;

@Component
public class PublicIdGenerator {

    public String generate() {
        return UlidCreator.getUlid().toString();
    }
}
