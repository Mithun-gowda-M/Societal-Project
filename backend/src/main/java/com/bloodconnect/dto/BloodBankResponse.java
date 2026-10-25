package com.bloodconnect.dto;

import java.util.Map;

public record BloodBankResponse(
        String id,
        String name,
        String zone,
        String address,
        String phone,
        String whatsapp,
        String website,
        double lat,
        double lng,
        String pinCode,
        String timing,
        Map<String, Integer> stock
) {
}
