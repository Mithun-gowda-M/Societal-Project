package com.bloodconnect.service;

import com.bloodconnect.entity.AppUser;
import com.bloodconnect.entity.DonorProfile;
import com.bloodconnect.entity.UserRole;
import com.bloodconnect.repository.DonorProfileRepository;
import com.bloodconnect.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

/**
 * Seeds all 25 verified multi-role accounts (Admin, Hospitals, Blood Banks, Donors)
 * into the database repository when bloodconnect.seed-test-accounts=true.
 */
@Component
@Order(10)
public class TestAccountsSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TestAccountsSeeder.class);

    private final UserRepository userRepository;
    private final DonorProfileRepository donorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;

    record SeedAccount(String email, String password, UserRole role, String name, String phone,
                       String bloodGroup, String location, Double lat, Double lng, boolean available) {}

    private static final List<SeedAccount> ACCOUNTS_TO_SEED = List.of(
            // 1 System Admin
            new SeedAccount("admin@bloodconnect.local", "BMMCGS5353@m", UserRole.ADMIN, "Chief Medical Administrator", "+918026709999", null, null, null, null, false),

            // 5 Hospitals
            new SeedAccount("victoria.trauma@bmcri.edu.in", "Victoria2026@Trauma", UserRole.REQUESTER, "Victoria Hospital Emergency Trauma", "+918026701150", null, null, null, null, false),
            new SeedAccount("emergency@nimhans.ac.in", "Nimhans2026@Neuro", UserRole.REQUESTER, "NIMHANS Neuro-Trauma Centre", "+918026995000", null, null, null, null, false),
            new SeedAccount("apex.trauma@aiims.edu", "Aiims2026@Trauma", UserRole.REQUESTER, "AIIMS New Delhi Apex Trauma Centre", "+911126588500", null, null, null, null, false),
            new SeedAccount("emergency@lilavatihospital.com", "Lilavati2026@ICU", UserRole.REQUESTER, "Lilavati Hospital & Research ICU", "+912226751000", null, null, null, null, false),
            new SeedAccount("mmc.emergency@tn.gov.in", "Mmc2026@Emergency", UserRole.REQUESTER, "Rajiv Gandhi Govt General Hospital MMC", "+914425305000", null, null, null, null, false),

            // 4 Blood Banks
            new SeedAccount("rotary.ttk@bloodbank.org", "Rotary2026@Bank", UserRole.REQUESTER, "Rotary Bangalore TTK Blood Centre", "+918025287903", null, null, null, null, false),
            new SeedAccount("bloodbank@aiims.edu", "Aiims2026@Delhi", UserRole.REQUESTER, "AIIMS New Delhi Central Blood Centre", "+911126588500", null, null, null, null, false),
            new SeedAccount("kem.blood@mcgm.gov.in", "Kem2026@Mumbai", UserRole.REQUESTER, "KEM Hospital Blood Bank Mumbai", "+912224107000", null, null, null, null, false),
            new SeedAccount("bloodbank@indianredcross.org", "Redcross2026@HQ", UserRole.REQUESTER, "Indian Red Cross Society HQ", "+911123711551", null, null, null, null, false),

            // 15 Donors (covering all 8 blood groups across India)
            new SeedAccount("arjun.rao@blr-med.org", "Arjun@2026Blood", UserRole.DONOR, "Dr. Arjun K. Rao", "+919845112233", "O+", "Indiranagar, Bengaluru", 12.9719, 77.6412, true),
            new SeedAccount("priyanka.s@gmail.com", "Priya@2026Donate", UserRole.DONOR, "Priyanka Sharma", "+919880223344", "A+", "Koramangala, Bengaluru", 12.9345, 77.6265, true),
            new SeedAccount("karthik.v@techblr.io", "Karthik@UniversalO", UserRole.DONOR, "Karthik Venkatesh", "+919741334455", "O-", "Jayanagar, Bengaluru", 12.9298, 77.5843, true),
            new SeedAccount("sneha.n@outlook.com", "Sneha@BPositive", UserRole.DONOR, "Sneha Nandakumar", "+919632445566", "B+", "Whitefield, Bengaluru", 12.9856, 77.7289, false),
            new SeedAccount("rohan.d@fintech.in", "Rohan@ABPlatelets", UserRole.DONOR, "Rohan Deshmukh", "+919513556677", "AB+", "Malleshwaram, Bengaluru", 13.0031, 77.5702, true),
            new SeedAccount("ananya.h@ecity.org", "Ananya@RareBlood", UserRole.DONOR, "Ananya Hegde", "+919448667788", "A-", "Electronic City, Bengaluru", 12.8452, 77.6602, true),
            new SeedAccount("vikram.rathore@delhi-adv.in", "Vikram@DelhiB", UserRole.DONOR, "Vikramaditya Rathore", "+919810122334", "B-", "Connaught Place, New Delhi", 28.6315, 77.2167, true),
            new SeedAccount("meera.iyer@mumbai-art.org", "Meera@MumbaiO", UserRole.DONOR, "Meera Iyer", "+919820044556", "O+", "Bandra West, Mumbai", 19.0596, 72.8295, true),
            new SeedAccount("aravind.swamy@chennai-med.edu", "Aravind@RareAB", UserRole.DONOR, "Dr. Aravind Swamy", "+919840066778", "AB-", "T. Nagar, Chennai", 13.0418, 80.2341, true),
            new SeedAccount("rajeshwari.p@ahmedabad-tech.in", "Rajeshwari@GujO", UserRole.DONOR, "Rajeshwari Patel", "+919825088990", "O-", "SG Highway, Ahmedabad", 23.0338, 72.5126, true),
            new SeedAccount("faizan.a@hyd-eng.in", "Faizan@HydA", UserRole.DONOR, "Faizan Ahmed", "+919849011223", "A+", "Banjara Hills, Hyderabad", 17.4156, 78.4356, true),
            new SeedAccount("debojyoti.m@kol-legal.in", "Debo@KolB", UserRole.DONOR, "Debojyoti Mukherjee", "+919830088991", "B+", "Salt Lake Sector 5, Kolkata", 22.5804, 88.4378, true),
            new SeedAccount("tanvi.verma@jaipur-des.in", "Tanvi@JprO", UserRole.DONOR, "Tanvi Verma", "+919829033445", "O+", "C-Scheme, Jaipur", 26.9088, 75.8052, true),
            new SeedAccount("suresh.menon@kochi-shipping.in", "Suresh@KocB", UserRole.DONOR, "Suresh Menon", "+919847088992", "B-", "Marine Drive, Kochi", 9.9816, 76.2762, true),
            new SeedAccount("kavya.reddy@hsr-tech.in", "Kavya@HsrAB", UserRole.DONOR, "Kavya Reddy", "+919886011224", "AB+", "HSR Layout, Bengaluru", 12.9116, 77.6389, true)
    );

    public TestAccountsSeeder(
            UserRepository userRepository,
            DonorProfileRepository donorProfileRepository,
            PasswordEncoder passwordEncoder,
            @Value("${bloodconnect.seed-test-accounts:false}") boolean enabled
    ) {
        this.userRepository = userRepository;
        this.donorProfileRepository = donorProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) return;

        log.info("BloodConnect 2026: Seeding 25 verified multi-role test accounts into database...");
        for (SeedAccount item : ACCOUNTS_TO_SEED) {
            String email = item.email.trim().toLowerCase(Locale.ROOT);
            userRepository.findByEmail(email).ifPresentOrElse(
                    existing -> log.debug("Account already exists: {}", email),
                    () -> {
                        AppUser user = new AppUser(email, passwordEncoder.encode(item.password), item.role);
                        AppUser savedUser = userRepository.save(user);

                        if (item.role == UserRole.DONOR && item.bloodGroup != null) {
                            DonorProfile profile = new DonorProfile(
                                    savedUser, item.name, item.phone, item.bloodGroup,
                                    item.location, item.lat, item.lng, item.available
                            );
                            donorProfileRepository.save(profile);
                        }
                        log.debug("Seeded account: {} ({})", email, item.role);
                    }
            );
        }
        log.info("BloodConnect 2026: Successfully seeded 25 verified accounts into database.");
    }
}
