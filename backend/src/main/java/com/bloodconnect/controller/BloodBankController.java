package com.bloodconnect.controller;

import com.bloodconnect.dto.BloodBankResponse;
import com.bloodconnect.dto.BloodStockUpdateRequest;
import com.bloodconnect.service.BloodBankService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blood-banks")
public class BloodBankController {

    private final BloodBankService bloodBankService;

    public BloodBankController(BloodBankService bloodBankService) {
        this.bloodBankService = bloodBankService;
    }

    @GetMapping
    public List<BloodBankResponse> list() {
        return bloodBankService.getAllBanks();
    }

    @GetMapping("/{id}")
    public BloodBankResponse get(@PathVariable String id) {
        return bloodBankService.getBank(id);
    }

    @PatchMapping("/{id}/stock")
    public BloodBankResponse updateStock(@PathVariable String id, @Valid @RequestBody BloodStockUpdateRequest request) {
        return bloodBankService.updateStock(id, request);
    }
}
