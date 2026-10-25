package com.bloodconnect.service;

import com.bloodconnect.dto.BloodBankResponse;
import com.bloodconnect.dto.BloodStockUpdateRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BloodBankService {

    private final Map<String, BloodBankEntry> banks = new ConcurrentHashMap<>();

    public BloodBankService() {
        seedBangaloreBloodBanks();
    }

    private void seedBangaloreBloodBanks() {
        addBank("bank-1", "Victoria Hospital Blood Bank (BMCRI)", "Central / KR Market",
                "BMCRI Campus, Fort, Near City Market, Bengaluru 560002", "+91 80 2670 1150",
                "+919845011150", "https://bmcribangalore.edu.in", 12.9625, 77.5750, "560002",
                "24x7 Emergency Phlebotomy & Issue",
                Map.of("A+", 24, "A-", 8, "B+", 32, "B-", 6, "AB+", 14, "AB-", 4, "O+", 38, "O-", 9, "Platelets", 18, "Plasma", 40));

        addBank("bank-2", "Bowring & Lady Curzon Hospital Blood Bank", "Central / Shivaji Nagar",
                "Lady Curzon Rd, Shivaji Nagar, Bengaluru 560001", "+91 80 2559 1362",
                "+919845021362", "https://karnataka.gov.in", 12.9836, 77.6052, "560001",
                "24x7 Emergency Services",
                Map.of("A+", 18, "A-", 5, "B+", 22, "B-", 4, "AB+", 10, "AB-", 3, "O+", 28, "O-", 6, "Platelets", 12, "Plasma", 25));

        addBank("bank-3", "NIMHANS Blood Bank & Transfusion Medicine", "South / Dairy Circle",
                "Hosur Road, Near Dairy Circle, Bengaluru 560029", "+91 80 2699 5000",
                "+919845035000", "https://nimhans.ac.in", 12.9392, 77.5959, "560029",
                "24 Hours Open",
                Map.of("A+", 30, "A-", 9, "B+", 35, "B-", 8, "AB+", 16, "AB-", 5, "O+", 42, "O-", 12, "Platelets", 22, "Plasma", 45));

        addBank("bank-4", "Rashtrotthana Blood Centre", "South / Basavanagudi",
                "Gavipuram Guttahalli, Kempegowda Nagar, Bengaluru 560019", "+91 80 2661 2730",
                "+919845042730", "https://rashtrotthanabloodbank.com", 12.9498, 77.5683, "560019",
                "24x7 Dedicated Blood Service",
                Map.of("A+", 45, "A-", 14, "B+", 50, "B-", 11, "AB+", 20, "AB-", 7, "O+", 60, "O-", 16, "Platelets", 30, "Plasma", 65));

        addBank("bank-5", "Rotary Bangalore TTK Blood Centre", "East / HAL & Indiranagar",
                "HAL 3rd Stage, New Thippasandra, Bengaluru 560075", "+91 80 2528 7903",
                "+919845057903", "https://rotaryttkbloodbank.org", 12.9698, 77.6534, "560075",
                "24x7 Modern Apheresis Facility",
                Map.of("A+", 36, "A-", 12, "B+", 44, "B-", 9, "AB+", 18, "AB-", 6, "O+", 55, "O-", 15, "Platelets", 28, "Plasma", 50));

        addBank("bank-6", "Kidwai Memorial Institute of Oncology Blood Centre", "South / Marigowda Road",
                "Dr M H Marigowda Rd, Hombegowda Nagar, Bengaluru 560029", "+91 80 2609 4000",
                "+919845064000", "https://kidwai.kar.nic.in", 12.9427, 77.5891, "560029",
                "24x7 Oncology Blood & Platelet Support",
                Map.of("A+", 20, "A-", 4, "B+", 26, "B-", 5, "AB+", 8, "AB-", 2, "O+", 30, "O-", 5, "Platelets", 35, "Plasma", 30));

        addBank("bank-7", "Manipal Hospital Blood Centre", "East / Old Airport Road",
                "98, HAL Old Airport Rd, Kodihalli, Bengaluru 560017", "+91 80 2502 4444",
                "+919845074444", "https://manipalhospitals.com", 12.9592, 77.6499, "560017",
                "24x7 NABH Accredited Centre",
                Map.of("A+", 28, "A-", 7, "B+", 34, "B-", 6, "AB+", 15, "AB-", 4, "O+", 40, "O-", 10, "Platelets", 25, "Plasma", 38));

        addBank("bank-8", "Narayana Hrudayalaya Blood Centre", "South / Bommasandra",
                "258/A, Bommasandra Industrial Area, Anekal, Bengaluru 560099", "+91 80 7122 2222",
                "+919845082222", "https://narayanahealth.org", 12.8228, 77.6917, "560099",
                "24x7 Cardiac & Trauma Support",
                Map.of("A+", 40, "A-", 10, "B+", 45, "B-", 8, "AB+", 22, "AB-", 6, "O+", 52, "O-", 14, "Platelets", 32, "Plasma", 55));

        addBank("bank-9", "Indian Red Cross Society Karnataka Blood Bank", "Central / Race Course Road",
                "26, Red Cross Bhavan, Race Course Rd, Bengaluru 560001", "+91 80 2226 4205",
                "+919845094205", "https://redcrosskarnataka.org", 12.9841, 77.5843, "560001",
                "24x7 State Red Cross Blood Wing",
                Map.of("A+", 32, "A-", 11, "B+", 38, "B-", 9, "AB+", 16, "AB-", 5, "O+", 48, "O-", 11, "Platelets", 20, "Plasma", 42));

        addBank("bank-10", "St. John's Medical College Hospital Blood Bank", "South / Koramangala",
                "Sarjapur Main Rd, John Nagar, Koramangala, Bengaluru 560034", "+91 80 2206 5000",
                "+919845105000", "https://stjohns.in", 12.9309, 77.6202, "560034",
                "24x7 Hospital Transfusion Centre",
                Map.of("A+", 26, "A-", 8, "B+", 30, "B-", 7, "AB+", 12, "AB-", 4, "O+", 36, "O-", 8, "Platelets", 24, "Plasma", 35));
    }

    private void addBank(String id, String name, String zone, String address, String phone,
                         String whatsapp, String website, double lat, double lng, String pinCode,
                         String timing, Map<String, Integer> stock) {
        banks.put(id, new BloodBankEntry(id, name, zone, address, phone, whatsapp, website, lat, lng, pinCode, timing, new ConcurrentHashMap<>(stock)));
    }

    public List<BloodBankResponse> getAllBanks() {
        return banks.values().stream()
                .map(BloodBankEntry::toResponse)
                .toList();
    }

    public BloodBankResponse getBank(String id) {
        BloodBankEntry entry = banks.get(id);
        if (entry == null) {
            throw new NoSuchElementException("Blood bank not found: " + id);
        }
        return entry.toResponse();
    }

    public BloodBankResponse updateStock(String bankId, BloodStockUpdateRequest request) {
        BloodBankEntry entry = banks.get(bankId);
        if (entry == null) {
            throw new NoSuchElementException("Blood bank not found: " + bankId);
        }
        entry.stock.compute(request.group(), (k, v) -> Math.max(0, (v == null ? 0 : v) + request.delta()));
        return entry.toResponse();
    }

    private record BloodBankEntry(
            String id, String name, String zone, String address, String phone,
            String whatsapp, String website, double lat, double lng, String pinCode,
            String timing, Map<String, Integer> stock
    ) {
        BloodBankResponse toResponse() {
            return new BloodBankResponse(id, name, zone, address, phone, whatsapp, website, lat, lng, pinCode, timing, Collections.unmodifiableMap(stock));
        }
    }
}
