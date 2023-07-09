package ru.kata.spring.boot_security.demo.util;

public class UserNotUpdatedException extends RuntimeException {
    public UserNotUpdatedException(String msg) {
        super(msg);
    }
}
