package com.bloodconnect.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "blood_request_replies")
public class BloodRequestReply {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private BloodRequest request;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "donor_user_id", nullable = false)
    private AppUser donorUser;

    @Column(name = "donor_name", nullable = false, length = 100)
    private String donorName;

    @Column(name = "donor_phone", nullable = false, length = 30)
    private String donorPhone;

    @Column(name = "donor_blood_group", nullable = false, length = 3)
    private String donorBloodGroup;

    @Column(nullable = false, length = 20)
    private String status; // ACCEPTED, DECLINED

    @Column(length = 500)
    private String notes;

    @Column(name = "responded_at", nullable = false, updatable = false)
    private Instant respondedAt;

    protected BloodRequestReply() {
    }

    public BloodRequestReply(BloodRequest request, AppUser donorUser, String donorName, String donorPhone,
                             String donorBloodGroup, String status, String notes) {
        this.request = request;
        this.donorUser = donorUser;
        this.donorName = donorName;
        this.donorPhone = donorPhone;
        this.donorBloodGroup = donorBloodGroup;
        this.status = status;
        this.notes = notes;
    }

    @PrePersist
    void setRespondedAt() {
        if (respondedAt == null) {
            respondedAt = Instant.now();
        }
    }

    public UUID getId() { return id; }
    public BloodRequest getRequest() { return request; }
    public AppUser getDonorUser() { return donorUser; }
    public String getDonorName() { return donorName; }
    public String getDonorPhone() { return donorPhone; }
    public String getDonorBloodGroup() { return donorBloodGroup; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Instant getRespondedAt() { return respondedAt; }
}

