package com.bloodconnect.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "donor_profiles")
public class DonorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AppUser user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(name = "blood_group", nullable = false, length = 3)
    private String bloodGroup;

    @Column(nullable = false, length = 160)
    private String location;

    private Double latitude;

    private Double longitude;

    @Column(nullable = false)
    private boolean available;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected DonorProfile() {
    }

    public DonorProfile(AppUser user, String name, String phone, String bloodGroup, String location,
                        Double latitude, Double longitude, boolean available) {
        this.user = user;
        update(name, phone, bloodGroup, location, latitude, longitude, available);
    }

    public void update(String name, String phone, String bloodGroup, String location,
                       Double latitude, Double longitude, boolean available) {
        this.name = name;
        this.phone = phone;
        this.bloodGroup = bloodGroup;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.available = available;
        this.updatedAt = Instant.now();
    }

    public void setAvailable(boolean available) {
        this.available = available;
        this.updatedAt = Instant.now();
    }

    @PrePersist
    @PreUpdate
    void updateTimestamp() {
        if (updatedAt == null) {
            updatedAt = Instant.now();
        }
    }

    public UUID getId() { return id; }
    public AppUser getUser() { return user; }
    public String getName() { return name; }
    public String getPhone() { return phone; }
    public String getBloodGroup() { return bloodGroup; }
    public String getLocation() { return location; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public boolean isAvailable() { return available; }
    public Instant getUpdatedAt() { return updatedAt; }
}