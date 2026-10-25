package com.bloodconnect.service;

public interface OtpDeliveryService {
    void ensureConfigured();

    void sendEmail(String email, String code);

    void sendSms(String phone, String code);
}