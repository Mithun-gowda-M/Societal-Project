/**
 * BloodConnect 2026 — India National Blood Banks, Emergency Hospitals & Seeded Data Registry
 * 
 * Provides nationwide coverage of major Indian blood banks, 24x7 emergency trauma hospitals,
 * ambulance helplines, universal compatibility matrices, and fast spatial distance calculation.
 */

const IndiaBloodData = (function () {
  'use strict';

  const STORAGE_KEY_BANKS = 'bloodconnect_india_banks_v4';
  const STORAGE_KEY_HOSPITALS = 'bloodconnect_india_hospitals_v4';
  const STORAGE_KEY_DONORS = 'bloodconnect_india_donors_v3';
  const STORAGE_KEY_REVIEWS = 'bloodconnect_reviews_v3';
  const STORAGE_KEY_EMERGENCIES = 'bloodconnect_emergencies_v3';

  // =========================================================================
  // 1. NATIONWIDE BLOOD BANKS DIRECTORY (All Major Indian Cities & States)
  // =========================================================================
  const DEFAULT_BANKS = [
    // --- KARNATAKA / BANGALORE ---
    {
      id: 'bank-blr-1',
      name: 'Victoria Hospital Blood Bank (BMCRI)',
      state: 'Karnataka',
      city: 'Bengaluru',
      zone: 'Central / KR Market',
      address: 'BMCRI Campus, Fort, Near City Market, Bengaluru, Karnataka 560002',
      phone: '+91 80 2670 1150',
      whatsapp: '+919845011150',
      email: 'victoria.bloodbank@bmcri.edu.in',
      website: 'https://bmcribangalore.edu.in',
      lat: 12.9625,
      lng: 77.5750,
      pinCode: '560002',
      timing: '24x7 Emergency Phlebotomy & Issue',
      stock: { 'A+': 28, 'A-': 9, 'B+': 35, 'B-': 7, 'AB+': 16, 'AB-': 4, 'O+': 42, 'O-': 11, 'Platelets': 22, 'Plasma': 48 }
    },
    {
      id: 'bank-blr-2',
      name: 'Bowring & Lady Curzon Hospital Blood Bank',
      state: 'Karnataka',
      city: 'Bengaluru',
      zone: 'Central / Shivaji Nagar',
      address: 'Lady Curzon Rd, Shivaji Nagar, Bengaluru, Karnataka 560001',
      phone: '+91 80 2559 1362',
      whatsapp: '+919845021362',
      email: 'bowring.blood@karnataka.gov.in',
      website: 'https://karnataka.gov.in',
      lat: 12.9836,
      lng: 77.6052,
      pinCode: '560001',
      timing: '24x7 Emergency Blood Service',
      stock: { 'A+': 19, 'A-': 5, 'B+': 24, 'B-': 4, 'AB+': 11, 'AB-': 3, 'O+': 30, 'O-': 7, 'Platelets': 14, 'Plasma': 28 }
    },
    {
      id: 'bank-blr-3',
      name: 'NIMHANS Blood Bank & Transfusion Medicine',
      state: 'Karnataka',
      city: 'Bengaluru',
      zone: 'South / Dairy Circle',
      address: 'Hosur Road, Near Dairy Circle, Bengaluru, Karnataka 560029',
      phone: '+91 80 2699 5000',
      whatsapp: '+919845035000',
      email: 'transfusion@nimhans.ac.in',
      website: 'https://nimhans.ac.in',
      lat: 12.9392,
      lng: 77.5959,
      pinCode: '560029',
      timing: '24 Hours Open',
      stock: { 'A+': 32, 'A-': 10, 'B+': 38, 'B-': 9, 'AB+': 18, 'AB-': 5, 'O+': 46, 'O-': 14, 'Platelets': 26, 'Plasma': 50 }
    },
    {
      id: 'bank-blr-4',
      name: 'Rashtrotthana Blood Centre',
      state: 'Karnataka',
      city: 'Bengaluru',
      zone: 'South / Basavanagudi',
      address: 'Gavipuram Guttahalli, Kempegowda Nagar, Bengaluru, Karnataka 560019',
      phone: '+91 80 2661 2730',
      whatsapp: '+919845042730',
      email: 'info@rashtrotthanabloodbank.com',
      website: 'https://rashtrotthanabloodbank.com',
      lat: 12.9498,
      lng: 77.5683,
      pinCode: '560019',
      timing: '24x7 Dedicated Voluntary Service',
      stock: { 'A+': 48, 'A-': 15, 'B+': 55, 'B-': 12, 'AB+': 22, 'AB-': 8, 'O+': 65, 'O-': 18, 'Platelets': 34, 'Plasma': 70 }
    },
    {
      id: 'bank-blr-5',
      name: 'Rotary Bangalore TTK Blood Centre',
      state: 'Karnataka',
      city: 'Bengaluru',
      zone: 'East / HAL & Indiranagar',
      address: 'HAL 3rd Stage, New Thippasandra, Bengaluru, Karnataka 560075',
      phone: '+91 80 2528 7903',
      whatsapp: '+919845057903',
      email: 'rotary.ttk@bloodbank.org',
      website: 'https://rotaryttkbloodbank.org',
      lat: 12.9698,
      lng: 77.6534,
      pinCode: '560075',
      timing: '24x7 Modern Apheresis Facility',
      stock: { 'A+': 38, 'A-': 13, 'B+': 46, 'B-': 10, 'AB+': 19, 'AB-': 7, 'O+': 58, 'O-': 16, 'Platelets': 30, 'Plasma': 55 }
    },
    {
      id: 'bank-blr-6',
      name: 'Kidwai Memorial Institute of Oncology Blood Centre',
      state: 'Karnataka',
      city: 'Bengaluru',
      zone: 'South / Marigowda Road',
      address: 'Dr M H Marigowda Rd, Hombegowda Nagar, Bengaluru, Karnataka 560029',
      phone: '+91 80 2609 4000',
      whatsapp: '+919845064000',
      email: 'bloodcentre@kidwai.kar.nic.in',
      website: 'https://kidwai.kar.nic.in',
      lat: 12.9427,
      lng: 77.5891,
      pinCode: '560029',
      timing: '24x7 Oncology Blood & Platelet Support',
      stock: { 'A+': 22, 'A-': 6, 'B+': 28, 'B-': 6, 'AB+': 9, 'AB-': 3, 'O+': 34, 'O-': 7, 'Platelets': 38, 'Plasma': 32 }
    },
    {
      id: 'bank-blr-7',
      name: 'Manipal Hospital Blood Centre',
      state: 'Karnataka',
      city: 'Bengaluru',
      zone: 'East / Old Airport Road',
      address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka 560017',
      phone: '+91 80 2502 4444',
      whatsapp: '+919845074444',
      email: 'transfusion.blr@manipalhospitals.com',
      website: 'https://manipalhospitals.com',
      lat: 12.9592,
      lng: 77.6499,
      pinCode: '560017',
      timing: '24x7 NABH Accredited Centre',
      stock: { 'A+': 30, 'A-': 8, 'B+': 36, 'B-': 7, 'AB+': 16, 'AB-': 5, 'O+': 44, 'O-': 12, 'Platelets': 28, 'Plasma': 42 }
    },
    {
      id: 'bank-blr-8',
      name: 'Narayana Hrudayalaya Blood Centre',
      state: 'Karnataka',
      city: 'Bengaluru',
      zone: 'South / Bommasandra & Electronic City',
      address: '258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru 560099',
      phone: '+91 80 7122 2222',
      whatsapp: '+919845082222',
      email: 'bloodbank.nh@narayanahealth.org',
      website: 'https://narayanahealth.org',
      lat: 12.8228,
      lng: 77.6917,
      pinCode: '560099',
      timing: '24x7 Cardiac & Trauma Support',
      stock: { 'A+': 44, 'A-': 12, 'B+': 48, 'B-': 9, 'AB+': 24, 'AB-': 7, 'O+': 56, 'O-': 15, 'Platelets': 35, 'Plasma': 60 }
    },
    {
      id: 'bank-blr-9',
      name: 'Indian Red Cross Society Karnataka Blood Bank',
      state: 'Karnataka',
      city: 'Bengaluru',
      zone: 'Central / Race Course Road',
      address: '26, Red Cross Bhavan, 1st Floor, Race Course Rd, Bengaluru 560001',
      phone: '+91 80 2226 4205',
      whatsapp: '+919845094205',
      email: 'contact@redcrosskarnataka.org',
      website: 'https://redcrosskarnataka.org',
      lat: 12.9841,
      lng: 77.5843,
      pinCode: '560001',
      timing: '24x7 State Red Cross Blood Wing',
      stock: { 'A+': 35, 'A-': 12, 'B+': 40, 'B-': 10, 'AB+': 18, 'AB-': 6, 'O+': 52, 'O-': 13, 'Platelets': 24, 'Plasma': 46 }
    },
    {
      id: 'bank-blr-10',
      name: "St. John's Medical College Hospital Blood Bank",
      state: 'Karnataka',
      city: 'Bengaluru',
      zone: 'South / Koramangala',
      address: 'Sarjapur Main Rd, John Nagar, Koramangala, Bengaluru 560034',
      phone: '+91 80 2206 5000',
      whatsapp: '+919845105000',
      email: 'bloodbank@stjohns.in',
      website: 'https://stjohns.in',
      lat: 12.9309,
      lng: 77.6202,
      pinCode: '560034',
      timing: '24x7 Hospital Transfusion Centre',
      stock: { 'A+': 28, 'A-': 9, 'B+': 33, 'B-': 8, 'AB+': 14, 'AB-': 5, 'O+': 40, 'O-': 10, 'Platelets': 26, 'Plasma': 38 }
    },
    {
      id: 'bank-hub-1',
      name: 'KIMS Hospital Blood Centre (Hubli)',
      state: 'Karnataka',
      city: 'Hubballi',
      zone: 'North Karnataka',
      address: 'Vidyanagar, Hubballi, Karnataka 580022',
      phone: '+91 836 237 0057',
      whatsapp: '+919845037005',
      email: 'kims.blood@hubli.org',
      website: 'https://kimshubballi.karnataka.gov.in',
      lat: 15.3647,
      lng: 75.1240,
      pinCode: '580022',
      timing: '24x7 Regional Transfusion Centre',
      stock: { 'A+': 25, 'A-': 6, 'B+': 30, 'B-': 5, 'AB+': 12, 'AB-': 3, 'O+': 36, 'O-': 8, 'Platelets': 18, 'Plasma': 30 }
    },
    {
      id: 'bank-mys-1',
      name: 'K.R. Hospital & MMCRI Blood Centre (Mysuru)',
      state: 'Karnataka',
      city: 'Mysuru',
      zone: 'Old Mysore',
      address: 'Sayyaji Rao Rd, Medar Block, Yadavagiri, Mysuru, Karnataka 570001',
      phone: '+91 821 252 0512',
      whatsapp: '+919845052051',
      email: 'mmcri.blood@karnataka.gov.in',
      website: 'https://mmcrimysore.in',
      lat: 12.3168,
      lng: 76.6508,
      pinCode: '570001',
      timing: '24x7 Government Blood Bank',
      stock: { 'A+': 22, 'A-': 5, 'B+': 26, 'B-': 4, 'AB+': 10, 'AB-': 2, 'O+': 32, 'O-': 7, 'Platelets': 15, 'Plasma': 25 }
    },

    // --- NEW DELHI & NCR ---
    {
      id: 'bank-del-1',
      name: 'AIIMS Main Blood Centre (Ansari Nagar)',
      state: 'Delhi',
      city: 'New Delhi',
      zone: 'South Delhi / AIIMS',
      address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029',
      phone: '+91 11 2658 8500',
      whatsapp: '+919811028500',
      email: 'bloodbank@aiims.edu',
      website: 'https://aiims.edu',
      lat: 28.5672,
      lng: 77.2100,
      pinCode: '110029',
      timing: '24x7 Apex National Transfusion Medicine Unit',
      stock: { 'A+': 60, 'A-': 18, 'B+': 70, 'B-': 15, 'AB+': 30, 'AB-': 10, 'O+': 85, 'O-': 25, 'Platelets': 50, 'Plasma': 90 }
    },
    {
      id: 'bank-del-2',
      name: 'Safdarjung Hospital Regional Blood Centre',
      state: 'Delhi',
      city: 'New Delhi',
      zone: 'South Delhi / Ring Road',
      address: 'Ansari Nagar West, Ring Road, New Delhi 110029',
      phone: '+91 11 2616 5060',
      whatsapp: '+919811016506',
      email: 'safdarjung.blood@gov.in',
      website: 'https://vmmc-sjh.nic.in',
      lat: 28.5695,
      lng: 77.2064,
      pinCode: '110029',
      timing: '24x7 Emergency Trauma Phlebotomy',
      stock: { 'A+': 42, 'A-': 12, 'B+': 50, 'B-': 11, 'AB+': 20, 'AB-': 6, 'O+': 60, 'O-': 16, 'Platelets': 32, 'Plasma': 65 }
    },
    {
      id: 'bank-del-3',
      name: 'Indian Red Cross Society National Headquarters Blood Bank',
      state: 'Delhi',
      city: 'New Delhi',
      zone: 'Central Delhi / Parliament Street',
      address: '1, Red Cross Road, New Delhi 110001',
      phone: '+91 11 2371 1551',
      whatsapp: '+919811071155',
      email: 'bloodbank@indianredcross.org',
      website: 'https://indianredcross.org',
      lat: 28.6219,
      lng: 77.2103,
      pinCode: '110001',
      timing: '24x7 Dedicated Voluntary Service',
      stock: { 'A+': 55, 'A-': 16, 'B+': 62, 'B-': 14, 'AB+': 28, 'AB-': 8, 'O+': 75, 'O-': 20, 'Platelets': 40, 'Plasma': 80 }
    },
    {
      id: 'bank-del-4',
      name: 'Medanta The Medicity Blood Centre (Gurugram)',
      state: 'Haryana',
      city: 'Gurugram',
      zone: 'NCR / Sector 38',
      address: 'CH Bakhtawar Singh Rd, Sector 38, Gurugram, Haryana 122001',
      phone: '+91 124 414 1414',
      whatsapp: '+919812414141',
      email: 'bloodcentre@medanta.org',
      website: 'https://medanta.org',
      lat: 28.4398,
      lng: 77.0427,
      pinCode: '122001',
      timing: '24x7 Modern Apheresis & Component Lab',
      stock: { 'A+': 36, 'A-': 10, 'B+': 44, 'B-': 9, 'AB+': 18, 'AB-': 5, 'O+': 52, 'O-': 14, 'Platelets': 28, 'Plasma': 50 }
    },

    // --- MAHARASHTRA / MUMBAI & PUNE ---
    {
      id: 'bank-mum-1',
      name: 'KEM Hospital & Seth GS Medical College Blood Bank',
      state: 'Maharashtra',
      city: 'Mumbai',
      zone: 'Central Mumbai / Parel',
      address: 'Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012',
      phone: '+91 22 2410 7000',
      whatsapp: '+919820010700',
      email: 'kem.blood@mcgm.gov.in',
      website: 'https://kem.edu',
      lat: 19.0028,
      lng: 72.8427,
      pinCode: '400012',
      timing: '24x7 Major Civic Hospital Blood Bank',
      stock: { 'A+': 45, 'A-': 14, 'B+': 52, 'B-': 12, 'AB+': 22, 'AB-': 7, 'O+': 64, 'O-': 18, 'Platelets': 35, 'Plasma': 72 }
    },
    {
      id: 'bank-mum-2',
      name: 'Tata Memorial Hospital Blood Bank (ACTREC)',
      state: 'Maharashtra',
      city: 'Mumbai',
      zone: 'Central Mumbai / Parel',
      address: 'Dr. E Borges Road, Parel, Mumbai, Maharashtra 400012',
      phone: '+91 22 2417 7000',
      whatsapp: '+919820017700',
      email: 'tmhblood@tmc.gov.in',
      website: 'https://tmc.gov.in',
      lat: 19.0062,
      lng: 72.8436,
      pinCode: '400012',
      timing: '24x7 Premier Oncology Apheresis Support',
      stock: { 'A+': 35, 'A-': 9, 'B+': 40, 'B-': 8, 'AB+': 16, 'AB-': 5, 'O+': 48, 'O-': 12, 'Platelets': 55, 'Plasma': 45 }
    },
    {
      id: 'bank-mum-3',
      name: 'Lilavati Hospital & Research Centre Blood Bank',
      state: 'Maharashtra',
      city: 'Mumbai',
      zone: 'Western Suburbs / Bandra West',
      address: 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050',
      phone: '+91 22 2675 1000',
      whatsapp: '+919820075100',
      email: 'bloodbank@lilavatihospital.com',
      website: 'https://lilavatihospital.com',
      lat: 19.0515,
      lng: 72.8286,
      pinCode: '400050',
      timing: '24x7 NABH Multi-Component Centre',
      stock: { 'A+': 28, 'A-': 8, 'B+': 34, 'B-': 6, 'AB+': 14, 'AB-': 4, 'O+': 38, 'O-': 10, 'Platelets': 24, 'Plasma': 40 }
    },
    {
      id: 'bank-pun-1',
      name: 'Armed Forces Medical College (AFMC) Command Blood Bank',
      state: 'Maharashtra',
      city: 'Pune',
      zone: 'Camp / Wanowrie',
      address: 'Solapur Road, Near Race Course, Wanowrie, Pune, Maharashtra 411040',
      phone: '+91 20 2633 4200',
      whatsapp: '+919820033420',
      email: 'bloodbank.afmc@nic.in',
      website: 'https://afmc.nic.in',
      lat: 18.5028,
      lng: 73.8899,
      pinCode: '411040',
      timing: '24x7 Military & Civilian Emergency',
      stock: { 'A+': 38, 'A-': 11, 'B+': 42, 'B-': 9, 'AB+': 18, 'AB-': 6, 'O+': 50, 'O-': 14, 'Platelets': 28, 'Plasma': 52 }
    },

    // --- TAMIL NADU / CHENNAI & COIMBATORE ---
    {
      id: 'bank-chn-1',
      name: 'Rajiv Gandhi Government General Hospital (MMC) Blood Bank',
      state: 'Tamil Nadu',
      city: 'Chennai',
      zone: 'Central / Park Town',
      address: 'EVR Periyar Salai, Park Town, Chennai, Tamil Nadu 600003',
      phone: '+91 44 2530 5000',
      whatsapp: '+919840030500',
      email: 'mmcblood@tn.gov.in',
      website: 'https://mmc.tn.gov.in',
      lat: 13.0818,
      lng: 80.2789,
      pinCode: '600003',
      timing: '24x7 Major Apex Hospital Blood Bank',
      stock: { 'A+': 50, 'A-': 14, 'B+': 58, 'B-': 12, 'AB+': 24, 'AB-': 7, 'O+': 70, 'O-': 19, 'Platelets': 38, 'Plasma': 75 }
    },
    {
      id: 'bank-chn-2',
      name: 'Apollo Hospitals Main Blood Centre (Greams Road)',
      state: 'Tamil Nadu',
      city: 'Chennai',
      zone: 'Central / Thousand Lights',
      address: '21, Greams Lane, Thousand Lights, Chennai, Tamil Nadu 600006',
      phone: '+91 44 2829 0200',
      whatsapp: '+919840029020',
      email: 'bloodbank_chn@apollohospitals.com',
      website: 'https://apollohospitals.com',
      lat: 13.0569,
      lng: 80.2508,
      pinCode: '600006',
      timing: '24x7 Multi-Organ & Cardiac Support',
      stock: { 'A+': 34, 'A-': 9, 'B+': 40, 'B-': 8, 'AB+': 16, 'AB-': 5, 'O+': 48, 'O-': 13, 'Platelets': 30, 'Plasma': 48 }
    },
    {
      id: 'bank-cbe-1',
      name: 'Coimbatore Medical College Hospital Blood Centre (CMCH)',
      state: 'Tamil Nadu',
      city: 'Coimbatore',
      zone: 'Trichy Road',
      address: 'Trichy Rd, Gopalapuram, Coimbatore, Tamil Nadu 641018',
      phone: '+91 422 230 1393',
      whatsapp: '+919840030139',
      email: 'cmch.blood@tn.gov.in',
      website: 'https://cmch.ac.in',
      lat: 11.0018,
      lng: 76.9698,
      pinCode: '641018',
      timing: '24x7 Western Tamil Nadu Hub',
      stock: { 'A+': 26, 'A-': 7, 'B+': 32, 'B-': 6, 'AB+': 12, 'AB-': 4, 'O+': 38, 'O-': 9, 'Platelets': 20, 'Plasma': 35 }
    },

    // --- TELANGANA / HYDERABAD ---
    {
      id: 'bank-hyd-1',
      name: 'Osmania General Hospital Blood Bank',
      state: 'Telangana',
      city: 'Hyderabad',
      zone: 'Old City / Afzal Gunj',
      address: 'Afzal Gunj, Koti, Hyderabad, Telangana 500012',
      phone: '+91 40 2460 0146',
      whatsapp: '+919849000146',
      email: 'osmania.blood@telangana.gov.in',
      website: 'https://osmaniahospital.org',
      lat: 17.3753,
      lng: 78.4744,
      pinCode: '500012',
      timing: '24x7 Emergency Trauma Unit',
      stock: { 'A+': 42, 'A-': 11, 'B+': 48, 'B-': 10, 'AB+': 20, 'AB-': 6, 'O+': 58, 'O-': 15, 'Platelets': 30, 'Plasma': 60 }
    },
    {
      id: 'bank-hyd-2',
      name: "Nizam's Institute of Medical Sciences (NIMS) Blood Centre",
      state: 'Telangana',
      city: 'Hyderabad',
      zone: 'Punjagutta',
      address: 'Punjagutta Main Rd, Hyderabad, Telangana 500082',
      phone: '+91 40 2348 9000',
      whatsapp: '+919849089000',
      email: 'bloodbank@nims.edu.in',
      website: 'https://nims.edu.in',
      lat: 17.4243,
      lng: 78.4527,
      pinCode: '500082',
      timing: '24x7 Super Speciality Apheresis Unit',
      stock: { 'A+': 35, 'A-': 9, 'B+': 42, 'B-': 8, 'AB+': 18, 'AB-': 5, 'O+': 50, 'O-': 12, 'Platelets': 32, 'Plasma': 50 }
    },

    // --- WEST BENGAL / KOLKATA ---
    {
      id: 'bank-kol-1',
      name: 'Medical College & Hospital Kolkata Blood Bank',
      state: 'West Bengal',
      city: 'Kolkata',
      zone: 'Central Kolkata / College Street',
      address: '88, College Street, Kolkata, West Bengal 700073',
      phone: '+91 33 2255 1600',
      whatsapp: '+919830051600',
      email: 'bloodbank.mch@wb.gov.in',
      website: 'https://medicalcollegekolkata.in',
      lat: 22.5744,
      lng: 88.3629,
      pinCode: '700073',
      timing: '24x7 Heritage Apex Medical Centre',
      stock: { 'A+': 38, 'A-': 10, 'B+': 45, 'B-': 9, 'AB+': 18, 'AB-': 6, 'O+': 54, 'O-': 14, 'Platelets': 28, 'Plasma': 52 }
    },
    {
      id: 'bank-kol-2',
      name: 'SSKM Hospital & IPGMER Central Blood Bank',
      state: 'West Bengal',
      city: 'Kolkata',
      zone: 'South Kolkata / Bhowanipore',
      address: '244, AJC Bose Road, Kolkata, West Bengal 700020',
      phone: '+91 33 2223 1589',
      whatsapp: '+919830023158',
      email: 'sskm.blood@wbhealth.gov.in',
      website: 'https://ipgmer.gov.in',
      lat: 22.5398,
      lng: 88.3436,
      pinCode: '700020',
      timing: '24x7 Super Speciality Government Blood Centre',
      stock: { 'A+': 44, 'A-': 12, 'B+': 52, 'B-': 11, 'AB+': 22, 'AB-': 7, 'O+': 62, 'O-': 16, 'Platelets': 34, 'Plasma': 65 }
    },

    // --- GUJARAT / AHMEDABAD & SURAT ---
    {
      id: 'bank-ahmed-1',
      name: 'Civil Hospital & BJ Medical College Blood Bank',
      state: 'Gujarat',
      city: 'Ahmedabad',
      zone: 'Asarwa',
      address: 'Asarwa, Ahmedabad, Gujarat 380016',
      phone: '+91 79 2268 3721',
      whatsapp: '+919825068372',
      email: 'civilblood.ahd@gujarat.gov.in',
      website: 'https://bjmcabd.edu.in',
      lat: 23.0525,
      lng: 72.6028,
      pinCode: '380016',
      timing: '24x7 Asia Largest Civil Hospital Blood Centre',
      stock: { 'A+': 52, 'A-': 15, 'B+': 60, 'B-': 14, 'AB+': 25, 'AB-': 8, 'O+': 72, 'O-': 20, 'Platelets': 42, 'Plasma': 80 }
    },
    {
      id: 'bank-ahmed-2',
      name: 'Prathama Blood Centre (NABH Accredited)',
      state: 'Gujarat',
      city: 'Ahmedabad',
      zone: 'Vasna',
      address: 'Near Parimal Garden, Doctor House, Ellisbridge, Ahmedabad, Gujarat 380006',
      phone: '+91 79 2657 5555',
      whatsapp: '+919825057555',
      email: 'prathama@prathamabloodcentre.org',
      website: 'https://prathama.org',
      lat: 23.0189,
      lng: 72.5589,
      pinCode: '380006',
      timing: '24x7 Modern Voluntary Blood Facility',
      stock: { 'A+': 34, 'A-': 9, 'B+': 40, 'B-': 8, 'AB+': 16, 'AB-': 5, 'O+': 48, 'O-': 12, 'Platelets': 28, 'Plasma': 50 }
    },

    // --- KERALA / KOCHI & THIRUVANANTHAPURAM ---
    {
      id: 'bank-koc-1',
      name: 'Amrita Institute of Medical Sciences (AIMS) Blood Centre',
      state: 'Kerala',
      city: 'Kochi',
      zone: 'Edappally',
      address: 'AIMS Ponekkara P.O., Kochi, Kerala 682041',
      phone: '+91 484 285 1234',
      whatsapp: '+919847051234',
      email: 'transfusion@aims.amrita.edu',
      website: 'https://amritahospitals.org',
      lat: 10.0328,
      lng: 76.2917,
      pinCode: '682041',
      timing: '24x7 Super Speciality Apheresis Unit',
      stock: { 'A+': 32, 'A-': 8, 'B+': 38, 'B-': 7, 'AB+': 15, 'AB-': 4, 'O+': 46, 'O-': 12, 'Platelets': 26, 'Plasma': 44 }
    },

    // --- RAJASTHAN / JAIPUR ---
    {
      id: 'bank-jpr-1',
      name: 'SMS Medical College & Hospital Blood Bank',
      state: 'Rajasthan',
      city: 'Jaipur',
      zone: 'JLN Marg',
      address: 'Jawahar Lal Nehru Marg, Ashok Nagar, Jaipur, Rajasthan 302004',
      phone: '+91 141 251 8200',
      whatsapp: '+919829018200',
      email: 'smsbloodbank@rajasthan.gov.in',
      website: 'https://medicaleducation.rajasthan.gov.in',
      lat: 26.8988,
      lng: 75.8152,
      pinCode: '302004',
      timing: '24x7 State Apex Blood Centre',
      stock: { 'A+': 46, 'A-': 12, 'B+': 55, 'B-': 11, 'AB+': 22, 'AB-': 7, 'O+': 65, 'O-': 18, 'Platelets': 36, 'Plasma': 70 }
    },

    // --- UTTAR PRADESH / LUCKNOW ---
    {
      id: 'bank-lko-1',
      name: "King George's Medical University (KGMU) Blood Bank",
      state: 'Uttar Pradesh',
      city: 'Lucknow',
      zone: 'Chowk',
      address: 'Shah Mina Rd, Chowk, Lucknow, Uttar Pradesh 226003',
      phone: '+91 522 225 7450',
      whatsapp: '+919839057450',
      email: 'transfusion@kgmcindia.edu',
      website: 'https://kgmu.org',
      lat: 26.8689,
      lng: 80.9168,
      pinCode: '226003',
      timing: '24x7 Apex Transfusion Medicine Department',
      stock: { 'A+': 48, 'A-': 14, 'B+': 56, 'B-': 12, 'AB+': 24, 'AB-': 7, 'O+': 68, 'O-': 18, 'Platelets': 38, 'Plasma': 75 }
    },

    // --- CHANDIGARH / PUNJAB & HARYANA ---
    {
      id: 'bank-chd-1',
      name: 'PGIMER Department of Transfusion Medicine',
      state: 'Chandigarh',
      city: 'Chandigarh',
      zone: 'Sector 12',
      address: 'Madhya Marg, Sector 12, Chandigarh 160012',
      phone: '+91 172 275 6480',
      whatsapp: '+919815056480',
      email: 'bloodbank@pgimer.edu.in',
      website: 'https://pgimer.edu.in',
      lat: 30.7652,
      lng: 76.7774,
      pinCode: '160012',
      timing: '24x7 Apex Regional Transfusion Centre',
      stock: { 'A+': 52, 'A-': 16, 'B+': 60, 'B-': 14, 'AB+': 26, 'AB-': 8, 'O+': 74, 'O-': 22, 'Platelets': 45, 'Plasma': 85 }
    },

    // --- MADHYA PRADESH / BHOPAL ---
    {
      id: 'bank-bho-1',
      name: 'AIIMS Bhopal Central Blood Centre',
      state: 'Madhya Pradesh',
      city: 'Bhopal',
      zone: 'Saket Nagar',
      address: 'AIIMS Campus, Saket Nagar, Bhopal, Madhya Pradesh 462020',
      phone: '+91 755 267 2355',
      whatsapp: '+919826072355',
      email: 'bloodbank@aiimsbhopal.edu.in',
      website: 'https://aiimsbhopal.edu.in',
      lat: 23.2089,
      lng: 77.4589,
      pinCode: '462020',
      timing: '24x7 Apex National Hospital Centre',
      stock: { 'A+': 35, 'A-': 9, 'B+': 40, 'B-': 8, 'AB+': 17, 'AB-': 5, 'O+': 48, 'O-': 12, 'Platelets': 25, 'Plasma': 46 }
    },

    // --- BIHAR / PATNA ---
    {
      id: 'bank-pat-1',
      name: 'Patna Medical College and Hospital (PMCH) Blood Bank',
      state: 'Bihar',
      city: 'Patna',
      zone: 'Ashok Rajpath',
      address: 'Ashok Rajpath, Patna, Bihar 800004',
      phone: '+91 612 230 0341',
      whatsapp: '+919835000341',
      email: 'pmch.blood@bihar.gov.in',
      website: 'https://pmchpatna.in',
      lat: 25.6219,
      lng: 85.1618,
      pinCode: '800004',
      timing: '24x7 Government Blood Centre',
      stock: { 'A+': 32, 'A-': 8, 'B+': 38, 'B-': 7, 'AB+': 15, 'AB-': 4, 'O+': 44, 'O-': 11, 'Platelets': 22, 'Plasma': 40 }
    },

    // --- ODISHA / BHUBANESWAR ---
    {
      id: 'bank-bhu-1',
      name: 'AIIMS Bhubaneswar Blood Centre',
      state: 'Odisha',
      city: 'Bhubaneswar',
      zone: 'Sijua',
      address: 'Sijua, Patrapada, Bhubaneswar, Odisha 751019',
      phone: '+91 674 247 6789',
      whatsapp: '+919861076789',
      email: 'bloodbank@aiimsbhubaneswar.edu.in',
      website: 'https://aiimsbhubaneswar.nic.in',
      lat: 20.2319,
      lng: 85.7758,
      pinCode: '751019',
      timing: '24x7 Apex Medical Transfusion Facility',
      stock: { 'A+': 30, 'A-': 8, 'B+': 36, 'B-': 7, 'AB+': 14, 'AB-': 4, 'O+': 42, 'O-': 11, 'Platelets': 24, 'Plasma': 45 }
    },

{
    "id": "bank-kar-mys-2",
    "name": "JSS Hospital Blood Centre & Transfusion Services (Mysuru)",
    "state": "Karnataka",
    "city": "Mysuru",
    "district": "Mysuru",
    "zone": "Agrahara / Ramanuja Road",
    "address": "M.G. Road, Agrahara, Fort Mohalla, Mysuru, Karnataka 570004",
    "phone": "+91 821 233 5555",
    "whatsapp": "+919845055555",
    "email": "bloodcentre@jsshospital.in",
    "website": "https://jsshospital.in",
    "lat": 12.2958,
    "lng": 76.6534,
    "pinCode": "570004",
    "timing": "24x7 NABH Accredited Transfusion Unit",
    "stock": {
        "A+": 32,
        "A-": 8,
        "B+": 38,
        "B-": 7,
        "AB+": 16,
        "AB-": 4,
        "O+": 46,
        "O-": 12,
        "Platelets": 24,
        "Plasma": 40
    }
},
{
    "id": "bank-kar-mng-1",
    "name": "Kasturba Medical College (KMC) Hospital Blood Centre (Mangaluru)",
    "state": "Karnataka",
    "city": "Mangaluru",
    "district": "Dakshina Kannada",
    "zone": "Ambedkar Circle / Light House Hill",
    "address": "Dr. B. R. Ambedkar Circle, Hampankatta, Mangaluru, Karnataka 575001",
    "phone": "+91 824 244 5858",
    "whatsapp": "+919845045858",
    "email": "bloodbank.kmc@manipal.edu",
    "website": "https://manipalhospitals.com/mangalore",
    "lat": 12.8703,
    "lng": 74.8427,
    "pinCode": "575001",
    "timing": "24x7 Coastal Regional Blood Hub",
    "stock": {
        "A+": 30,
        "A-": 9,
        "B+": 35,
        "B-": 8,
        "AB+": 15,
        "AB-": 5,
        "O+": 44,
        "O-": 13,
        "Platelets": 28,
        "Plasma": 45
    }
},
{
    "id": "bank-kar-mng-2",
    "name": "District Wenlock Hospital Government Blood Bank (Mangaluru)",
    "state": "Karnataka",
    "city": "Mangaluru",
    "district": "Dakshina Kannada",
    "zone": "Hampankatta",
    "address": "K.S. Rao Road, Hampankatta, Mangaluru, Karnataka 575001",
    "phone": "+91 824 242 4118",
    "whatsapp": "+919845024118",
    "email": "wenlock.blood@karnataka.gov.in",
    "website": "https://karnataka.gov.in",
    "lat": 12.8689,
    "lng": 74.842,
    "pinCode": "575001",
    "timing": "24x7 District Government Apex Centre",
    "stock": {
        "A+": 24,
        "A-": 6,
        "B+": 28,
        "B-": 5,
        "AB+": 11,
        "AB-": 3,
        "O+": 36,
        "O-": 9,
        "Platelets": 18,
        "Plasma": 32
    }
},
{
    "id": "bank-kar-mng-3",
    "name": "Father Muller Charitable Hospital Blood Centre (Mangaluru)",
    "state": "Karnataka",
    "city": "Mangaluru",
    "district": "Dakshina Kannada",
    "zone": "Kankanady",
    "address": "Father Muller Road, Kankanady, Mangaluru, Karnataka 575002",
    "phone": "+91 824 223 8000",
    "whatsapp": "+919845038000",
    "email": "fmcon@fathermuller.in",
    "website": "https://fathermuller.edu.in",
    "lat": 12.8596,
    "lng": 74.8584,
    "pinCode": "575002",
    "timing": "24x7 Charitable Blood & Apheresis Services",
    "stock": {
        "A+": 26,
        "A-": 7,
        "B+": 30,
        "B-": 6,
        "AB+": 13,
        "AB-": 4,
        "O+": 40,
        "O-": 10,
        "Platelets": 22,
        "Plasma": 38
    }
},
{
    "id": "bank-kar-bel-1",
    "name": "KLE Centenary Charitable Hospital & JNMC Blood Centre (Belagavi)",
    "state": "Karnataka",
    "city": "Belagavi",
    "district": "Belagavi",
    "zone": "Nehru Nagar / JNMC Campus",
    "address": "JNMC Campus, Nehru Nagar, Belagavi, Karnataka 590010",
    "phone": "+91 831 247 3777",
    "whatsapp": "+919845073777",
    "email": "bloodbank@jnmc.edu",
    "website": "https://klehospital.org",
    "lat": 15.8872,
    "lng": 74.5165,
    "pinCode": "590010",
    "timing": "24x7 North-Western Karnataka Transfusion Hub",
    "stock": {
        "A+": 34,
        "A-": 9,
        "B+": 40,
        "B-": 8,
        "AB+": 18,
        "AB-": 5,
        "O+": 48,
        "O-": 12,
        "Platelets": 26,
        "Plasma": 44
    }
},
{
    "id": "bank-kar-dav-1",
    "name": "Bapuji Hospital & JJMMC Blood Centre (Davanagere)",
    "state": "Karnataka",
    "city": "Davanagere",
    "district": "Davanagere",
    "zone": "MCC B Block",
    "address": "Hadadi Road, MCC B Block, Davanagere, Karnataka 577004",
    "phone": "+91 8192 231 405",
    "whatsapp": "+919845031405",
    "email": "bapujiblood@jjmmc.org",
    "website": "https://jjmmc.org",
    "lat": 14.4644,
    "lng": 75.9218,
    "pinCode": "577004",
    "timing": "24x7 Central Karnataka Blood Bank",
    "stock": {
        "A+": 22,
        "A-": 6,
        "B+": 27,
        "B-": 5,
        "AB+": 12,
        "AB-": 3,
        "O+": 35,
        "O-": 8,
        "Platelets": 16,
        "Plasma": 30
    }
},
{
    "id": "bank-kar-kal-1",
    "name": "Gulbarga Institute of Medical Sciences (GIMS) Blood Centre (Kalaburagi)",
    "state": "Karnataka",
    "city": "Kalaburagi",
    "district": "Kalaburagi",
    "zone": "Sedam Road",
    "address": "Sedam Road, Kalaburagi, Karnataka 585105",
    "phone": "+91 8472 230 400",
    "whatsapp": "+919845030400",
    "email": "gimsblood@karnataka.gov.in",
    "website": "https://gims-gulbarga.com",
    "lat": 17.3297,
    "lng": 76.8343,
    "pinCode": "585105",
    "timing": "24x7 Hyderabad-Karnataka Regional Transfusion Unit",
    "stock": {
        "A+": 25,
        "A-": 6,
        "B+": 32,
        "B-": 6,
        "AB+": 13,
        "AB-": 4,
        "O+": 38,
        "O-": 9,
        "Platelets": 18,
        "Plasma": 34
    }
},
{
    "id": "bank-kar-bal-1",
    "name": "VIMS Medical College Blood Bank (Ballari)",
    "state": "Karnataka",
    "city": "Ballari",
    "district": "Ballari",
    "zone": "Cantonment / Cantonment Road",
    "address": "Cantonment, Ballari, Karnataka 583104",
    "phone": "+91 8392 235 200",
    "whatsapp": "+919845035200",
    "email": "vims.blood@karnataka.gov.in",
    "website": "https://vims.karnataka.gov.in",
    "lat": 15.1438,
    "lng": 76.9214,
    "pinCode": "583104",
    "timing": "24x7 Tungabhadra Belt Blood Hub",
    "stock": {
        "A+": 20,
        "A-": 5,
        "B+": 26,
        "B-": 4,
        "AB+": 10,
        "AB-": 3,
        "O+": 32,
        "O-": 7,
        "Platelets": 14,
        "Plasma": 28
    }
},
{
    "id": "bank-kar-shm-1",
    "name": "SIMS Government Blood Centre (Shivamogga)",
    "state": "Karnataka",
    "city": "Shivamogga",
    "district": "Shivamogga",
    "zone": "Sagar Road",
    "address": "N.H. 206, Sagar Road, Shivamogga, Karnataka 577201",
    "phone": "+91 8182 229 933",
    "whatsapp": "+919845029933",
    "email": "simsblood@karnataka.gov.in",
    "website": "https://sims.karnataka.gov.in",
    "lat": 13.9299,
    "lng": 75.5681,
    "pinCode": "577201",
    "timing": "24x7 Malnad Region Transfusion Centre",
    "stock": {
        "A+": 21,
        "A-": 5,
        "B+": 25,
        "B-": 4,
        "AB+": 11,
        "AB-": 3,
        "O+": 31,
        "O-": 8,
        "Platelets": 15,
        "Plasma": 26
    }
},
{
    "id": "bank-kar-tum-1",
    "name": "District Government Hospital Blood Centre (Tumakuru)",
    "state": "Karnataka",
    "city": "Tumakuru",
    "district": "Tumakuru",
    "zone": "B.H. Road",
    "address": "B.H. Road, Near Town Hall, Tumakuru, Karnataka 572101",
    "phone": "+91 816 227 8250",
    "whatsapp": "+919845078250",
    "email": "tumkur.blood@karnataka.gov.in",
    "website": "https://karnataka.gov.in",
    "lat": 13.3379,
    "lng": 77.101,
    "pinCode": "572101",
    "timing": "24x7 Government Blood Bank",
    "stock": {
        "A+": 19,
        "A-": 4,
        "B+": 24,
        "B-": 4,
        "AB+": 10,
        "AB-": 2,
        "O+": 28,
        "O-": 6,
        "Platelets": 12,
        "Plasma": 22
    }
},
{
    "id": "bank-kar-has-1",
    "name": "HIMS Blood Centre (Hassan)",
    "state": "Karnataka",
    "city": "Hassan",
    "district": "Hassan",
    "zone": "BM Road",
    "address": "Near Old Bus Stand, B.M. Road, Hassan, Karnataka 573201",
    "phone": "+91 8172 231 699",
    "whatsapp": "+919845031699",
    "email": "hims.blood@karnataka.gov.in",
    "website": "https://hims-hassan.org",
    "lat": 13.0033,
    "lng": 76.1004,
    "pinCode": "573201",
    "timing": "24x7 Government Medical College Centre",
    "stock": {
        "A+": 18,
        "A-": 4,
        "B+": 22,
        "B-": 4,
        "AB+": 9,
        "AB-": 2,
        "O+": 27,
        "O-": 6,
        "Platelets": 12,
        "Plasma": 24
    }
},
{
    "id": "bank-kar-udp-1",
    "name": "Kasturba Hospital Blood Centre (Manipal / Udupi)",
    "state": "Karnataka",
    "city": "Udupi",
    "district": "Udupi",
    "zone": "Tiger Circle / Manipal",
    "address": "Madhav Nagar, Manipal, Udupi, Karnataka 576104",
    "phone": "+91 820 292 2332",
    "whatsapp": "+919845022332",
    "email": "khbloodbank@manipal.edu",
    "website": "https://manipalhospitals.com",
    "lat": 13.3525,
    "lng": 74.7865,
    "pinCode": "576104",
    "timing": "24x7 Tertiary Teaching Hospital Transfusion Unit",
    "stock": {
        "A+": 32,
        "A-": 8,
        "B+": 36,
        "B-": 7,
        "AB+": 15,
        "AB-": 5,
        "O+": 45,
        "O-": 12,
        "Platelets": 30,
        "Plasma": 46
    }
},
{
    "id": "bank-del-3",
    "name": "Indian Red Cross Society National HQ Blood Bank",
    "state": "Delhi",
    "city": "New Delhi",
    "district": "Central Delhi",
    "zone": "Parliament Street / Connaught Place",
    "address": "1, Red Cross Road, Near Parliament House, New Delhi 110001",
    "phone": "+91 11 2371 1551",
    "whatsapp": "+919811071155",
    "email": "bloodbank@indianredcross.org",
    "website": "https://indianredcross.org",
    "lat": 28.6219,
    "lng": 77.2103,
    "pinCode": "110001",
    "timing": "24x7 Apex National Red Cross Hub",
    "stock": {
        "A+": 55,
        "A-": 15,
        "B+": 62,
        "B-": 14,
        "AB+": 26,
        "AB-": 8,
        "O+": 76,
        "O-": 20,
        "Platelets": 42,
        "Plasma": 80
    }
},
{
    "id": "bank-mum-3",
    "name": "Tata Memorial Hospital Blood Bank (Cancer Institute)",
    "state": "Maharashtra",
    "city": "Mumbai",
    "district": "Mumbai City",
    "zone": "Parel / Dr. E Borges Road",
    "address": "Dr. E Borges Rd, Parel East, Mumbai, Maharashtra 400012",
    "phone": "+91 22 2417 7000",
    "whatsapp": "+919820077000",
    "email": "bloodbank@tmc.gov.in",
    "website": "https://tmc.gov.in",
    "lat": 19.0069,
    "lng": 72.8436,
    "pinCode": "400012",
    "timing": "24x7 Oncology Blood, Platelet Apheresis & Cryo Support",
    "stock": {
        "A+": 46,
        "A-": 14,
        "B+": 52,
        "B-": 12,
        "AB+": 22,
        "AB-": 7,
        "O+": 64,
        "O-": 18,
        "Platelets": 55,
        "Plasma": 60
    }
},
{
    "id": "bank-koc-1",
    "name": "Amrita Institute of Medical Sciences (AIMS) Blood Bank (Kochi)",
    "state": "Kerala",
    "city": "Kochi",
    "district": "Ernakulam",
    "zone": "Edappally",
    "address": "Ponekkara, Edappally, Kochi, Kerala 682041",
    "phone": "+91 484 285 1234",
    "whatsapp": "+919847051234",
    "email": "transfusion@aims.amrita.edu",
    "website": "https://amritahospitals.org",
    "lat": 10.0326,
    "lng": 76.2917,
    "pinCode": "682041",
    "timing": "24x7 Super Speciality Transfusion & Apheresis Hub",
    "stock": {
        "A+": 36,
        "A-": 9,
        "B+": 42,
        "B-": 8,
        "AB+": 17,
        "AB-": 6,
        "O+": 52,
        "O-": 14,
        "Platelets": 32,
        "Plasma": 50
    }
},

    // --- ASSAM / GUWAHATI ---
    {
      id: 'bank-guw-1',
      name: 'Gauhati Medical College and Hospital (GMCH) Blood Centre',
      state: 'Assam',
      city: 'Guwahati',
      zone: 'Bhangagarh',
      address: 'Narakasur Hilltop, Bhangagarh, Guwahati, Assam 781032',
      phone: '+91 361 252 9457',
      whatsapp: '+919864029457',
      email: 'gmchblood@assam.gov.in',
      website: 'https://gmch.gov.in',
      lat: 26.1558,
      lng: 91.7708,
      pinCode: '781032',
      timing: '24x7 North East Regional Apex Centre',
      stock: { 'A+': 28, 'A-': 7, 'B+': 34, 'B-': 6, 'AB+': 13, 'AB-': 4, 'O+': 38, 'O-': 9, 'Platelets': 20, 'Plasma': 36 }
    }
  ];

  // =========================================================================
  // 2. 24x7 EMERGENCY HOSPITALS & AMBULANCE DISPATCH DIRECTORY
  // =========================================================================
  const DEFAULT_HOSPITALS = [
    // BANGALORE
    {
      id: 'hosp-blr-1',
      name: 'Victoria Hospital Emergency Trauma ICU (BMCRI)',
      city: 'Bengaluru',
      state: 'Karnataka',
      zone: 'KR Market / Fort',
      address: 'BMCRI Campus, Fort, Near City Market, Bengaluru 560002',
      lat: 12.9625,
      lng: 77.5750,
      emergencyPhone: '+91 80 2670 1150',
      ambulancePhone: '108',
      hospitalAmbulance: '+91 80 2670 0000',
      whatsapp: '+919845011150',
      website: 'https://bmcribangalore.edu.in',
      icuBedsAvailable: 14,
      attachedBloodBank: 'Victoria Hospital Blood Bank (On-site 24x7)',
      specialties: ['Level 1 Trauma Care', 'Burns & Plastic Surgery', 'Emergency ICU', 'Acute Hemorrhage Management']
    },
    {
      id: 'hosp-blr-2',
      name: 'NIMHANS Neuro-Emergency & Trauma Centre',
      city: 'Bengaluru',
      state: 'Karnataka',
      zone: 'Dairy Circle / Hosur Rd',
      address: 'Hosur Road, Near Dairy Circle, Bengaluru 560029',
      lat: 12.9392,
      lng: 77.5959,
      emergencyPhone: '+91 80 2699 5000',
      ambulancePhone: '108',
      hospitalAmbulance: '+91 80 2699 5555',
      whatsapp: '+919845035000',
      website: 'https://nimhans.ac.in',
      icuBedsAvailable: 8,
      attachedBloodBank: 'NIMHANS Blood Bank (On-site 24x7)',
      specialties: ['Neuro-Trauma ICU', 'Acute Stroke Care', 'Emergency Craniotomy', 'Transfusion Medicine']
    },
    {
      id: 'hosp-blr-3',
      name: 'Manipal Hospital Emergency & Trauma',
      city: 'Bengaluru',
      state: 'Karnataka',
      zone: 'Old Airport Road',
      address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru 560017',
      lat: 12.9592,
      lng: 77.6499,
      emergencyPhone: '+91 80 2502 4444',
      ambulancePhone: '108',
      hospitalAmbulance: '+91 80 2502 3333',
      whatsapp: '+919845074444',
      website: 'https://manipalhospitals.com',
      icuBedsAvailable: 18,
      attachedBloodBank: 'Manipal Hospital Blood Centre (On-site 24x7)',
      specialties: ['Cardiac Emergency & Cath Lab', 'Polytrauma Unit', 'Emergency Apheresis', 'Pediatric ICU']
    },
    {
      id: 'hosp-blr-4',
      name: "St. John's Medical College Hospital Emergency Dept",
      city: 'Bengaluru',
      state: 'Karnataka',
      zone: 'Koramangala',
      address: 'Sarjapur Main Rd, John Nagar, Koramangala, Bengaluru 560034',
      lat: 12.9309,
      lng: 77.6202,
      emergencyPhone: '+91 80 2206 5000',
      ambulancePhone: '108',
      hospitalAmbulance: '+91 80 2206 5252',
      whatsapp: '+919845105000',
      website: 'https://stjohns.in',
      icuBedsAvailable: 12,
      attachedBloodBank: "St. John's Blood Bank (On-site 24x7)",
      specialties: ['Emergency Resuscitation', 'Surgical Trauma ICU', 'Cardiac Arrest Recovery', 'Blood Transfusion']
    },
    {
      id: 'hosp-blr-5',
      name: 'Bowring & Lady Curzon Emergency Hospital',
      city: 'Bengaluru',
      state: 'Karnataka',
      zone: 'Shivaji Nagar',
      address: 'Lady Curzon Rd, Shivaji Nagar, Bengaluru 560001',
      lat: 12.9836,
      lng: 77.6052,
      emergencyPhone: '+91 80 2559 1362',
      ambulancePhone: '108',
      hospitalAmbulance: '+91 80 2559 0000',
      whatsapp: '+919845021362',
      website: 'https://karnataka.gov.in',
      icuBedsAvailable: 9,
      attachedBloodBank: 'Bowring Hospital Blood Bank (On-site 24x7)',
      specialties: ['24x7 Casualty & Trauma', 'Acute Surgery Unit', 'Pediatric Trauma', 'Emergency Phlebotomy']
    },

    // NEW DELHI & NCR
    {
      id: 'hosp-del-1',
      name: 'AIIMS Jai Prakash Narayan Apex Trauma Centre',
      city: 'New Delhi',
      state: 'Delhi',
      zone: 'Safdarjung Enclave / Ring Road',
      address: 'Chaudhary Jhandu Singh Marg, Raj Nagar, Safdarjung Enclave, New Delhi 110029',
      lat: 28.5672,
      lng: 77.2100,
      emergencyPhone: '+91 11 2658 8500',
      ambulancePhone: '108',
      hospitalAmbulance: '+91 11 2618 9000',
      whatsapp: '+919811028500',
      website: 'https://aiims.edu',
      icuBedsAvailable: 25,
      attachedBloodBank: 'AIIMS Central Blood Centre (On-site 24x7)',
      specialties: ['Apex Level 1 Trauma Care', 'Emergency Massive Transfusion Protocol', 'Severe Brain & Spine Injury', 'Helipad Evacuation']
    },
    {
      id: 'hosp-del-2',
      name: 'Safdarjung Hospital Emergency Trauma Centre',
      city: 'New Delhi',
      state: 'Delhi',
      zone: 'Ring Road',
      address: 'Ansari Nagar West, Ring Road, New Delhi 110029',
      lat: 28.5695,
      lng: 77.2064,
      emergencyPhone: '+91 11 2616 5060',
      ambulancePhone: '108',
      hospitalAmbulance: '+91 11 2616 8888',
      whatsapp: '+919811016506',
      website: 'https://vmmc-sjh.nic.in',
      icuBedsAvailable: 19,
      attachedBloodBank: 'Safdarjung Hospital Regional Blood Centre (On-site 24x7)',
      specialties: ['Accident & Emergency Care', 'Dedicated Burns ICU', 'Emergency General Surgery', 'Pediatric ICU']
    },

    // MUMBAI
    {
      id: 'hosp-mum-1',
      name: 'KEM Hospital Emergency & Trauma Care Unit',
      city: 'Mumbai',
      state: 'Maharashtra',
      zone: 'Parel',
      address: 'Acharya Donde Marg, Parel, Mumbai 400012',
      lat: 19.0028,
      lng: 72.8427,
      emergencyPhone: '+91 22 2410 7000',
      ambulancePhone: '108',
      hospitalAmbulance: '+91 22 2413 6051',
      whatsapp: '+919820010700',
      website: 'https://kem.edu',
      icuBedsAvailable: 20,
      attachedBloodBank: 'KEM Hospital Blood Bank (On-site 24x7)',
      specialties: ['Disaster & Trauma Unit', 'Emergency Vascular Surgery', 'Neuro ICU', 'Massive Transfusion Protocol']
    },
    {
      id: 'hosp-mum-2',
      name: 'Lilavati Hospital 24x7 Emergency Care',
      city: 'Mumbai',
      state: 'Maharashtra',
      zone: 'Bandra West',
      address: 'A-791, Bandra Reclamation, Bandra West, Mumbai 400050',
      lat: 19.0515,
      lng: 72.8286,
      emergencyPhone: '+91 22 2675 1000',
      ambulancePhone: '108',
      hospitalAmbulance: '+91 22 2656 8000',
      whatsapp: '+919820075100',
      website: 'https://lilavatihospital.com',
      icuBedsAvailable: 15,
      attachedBloodBank: 'Lilavati Blood Bank (On-site 24x7)',
      specialties: ['Acute Cardiac Care', 'Critical Care ICU', 'Stroke Intervention', 'Emergency Transfusions']
    },

    // CHENNAI
    {
      id: 'hosp-chn-1',
      name: 'Rajiv Gandhi Government General Hospital (MMC) Emergency Unit',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zone: 'Park Town',
      address: 'EVR Periyar Salai, Park Town, Chennai 600003',
      lat: 13.0818,
      lng: 80.2789,
      emergencyPhone: '+91 44 2530 5000',
      ambulancePhone: '108',
      hospitalAmbulance: '+91 44 2530 5151',
      whatsapp: '+919840030500',
      website: 'https://mmc.tn.gov.in',
      icuBedsAvailable: 22,
      attachedBloodBank: 'MMC Blood Bank (On-site 24x7)',
      specialties: ['Level 1 Trauma Centre', 'Disaster Relief Unit', 'Emergency Surgery ICU', 'Blood Transfusion']
    },

    // HYDERABAD
    {
      id: 'hosp-hyd-1',
      name: 'Osmania General Hospital Emergency & Trauma Care',
      city: 'Hyderabad',
      state: 'Telangana',
      zone: 'Afzal Gunj',
      address: 'Afzal Gunj, Koti, Hyderabad 500012',
      lat: 17.3753,
      lng: 78.4744,
      emergencyPhone: '+91 40 2460 0146',
      ambulancePhone: '108',
      hospitalAmbulance: '+91 40 2460 0111',
      whatsapp: '+919849000146',
      website: 'https://osmaniahospital.org',
      icuBedsAvailable: 16,
      attachedBloodBank: 'Osmania Blood Bank (On-site 24x7)',
      specialties: ['Casualty & Trauma Surgery', 'Orthopedic Emergencies', 'Acute Resuscitation', 'Emergency Blood Issue']
    },

    // KOLKATA
    {
      id: 'hosp-kol-1',
      name: 'SSKM Hospital & IPGMER Emergency Trauma Centre',
      city: 'Kolkata',
      state: 'West Bengal',
      zone: 'Bhowanipore',
      address: '244, AJC Bose Road, Kolkata 700020',
      lat: 22.5398,
      lng: 88.3436,
      emergencyPhone: '+91 33 2223 1589',
      ambulancePhone: '108',
      hospitalAmbulance: '+91 33 2223 1111',
      whatsapp: '+919830023158',
      website: 'https://ipgmer.gov.in',
      icuBedsAvailable: 17,
      attachedBloodBank: 'SSKM Central Blood Bank (On-site 24x7)',
      specialties: ['Apex Trauma Care', 'Emergency Burn Ward', 'Neuro ICU', 'Massive Transfusion Service']
    },

    // AHMEDABAD
    {
      id: 'hosp-ahd-1',
      name: 'Ahmedabad Civil Hospital 1200-Bed Trauma & Emergency Wing',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zone: 'Asarwa',
      address: 'Asarwa, Ahmedabad 380016',
      lat: 23.0525,
      lng: 72.6028,
      emergencyPhone: '+91 79 2268 3721',
      ambulancePhone: '108',
      hospitalAmbulance: '+91 79 2268 0000',
      whatsapp: '+919825068372',
      website: 'https://bjmcabd.edu.in',
      icuBedsAvailable: 28,
      attachedBloodBank: 'Civil Hospital Blood Bank (On-site 24x7)',
      specialties: ['Super Speciality Trauma Care', 'Disaster Triage Unit', 'Emergency ICU', 'High-Speed Phlebotomy']
    },
    {
      "id": "hosp-blr-6",
      "name": "MS Ramaiah Memorial Emergency & Trauma Hospital",
      "city": "Bengaluru",
      "district": "Bengaluru Urban",
      "state": "Karnataka",
      "zone": "Mathikere / New BEL Road",
      "address": "MSRIT Post, M S Ramaiah Nagar, Mathikere, Bengaluru 560054",
      "lat": 13.0305,
      "lng": 77.5649,
      "emergencyPhone": "+91 80 2360 8888",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 80 2360 9999",
      "whatsapp": "+919845068888",
      "email": "emergency@msrmh.com",
      "website": "https://msrmh.com",
      "icuBedsAvailable": 22,
      "attachedBloodBank": "MS Ramaiah Blood Centre (On-site 24x7)",
      "specialties": [
        "Level 1 Polytrauma",
        "Emergency Vascular Intervention",
        "Neurotrauma ICU",
        "Massive Transfusion Protocol"
      ]
    },
    {
      "id": "hosp-blr-7",
      "name": "Sanjay Gandhi Institute of Trauma & Orthopaedics (SGITO)",
      "city": "Bengaluru",
      "district": "Bengaluru Urban",
      "state": "Karnataka",
      "zone": "Jayanagar / Byrasandra",
      "address": "1st Block, Byrasandra, Jayanagar East, Bengaluru 560011",
      "lat": 12.9372,
      "lng": 77.5936,
      "emergencyPhone": "+91 80 2656 4516",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 80 2656 2500",
      "whatsapp": "+919845064516",
      "email": "sgito.trauma@karnataka.gov.in",
      "website": "https://sgito.karnataka.gov.in",
      "icuBedsAvailable": 16,
      "attachedBloodBank": "SGITO Blood Bank (On-site 24x7)",
      "specialties": [
        "Apex Accident & Bone Trauma",
        "Spinal Cord Injury Resuscitation",
        "Emergency Reconstructive Orthopedics"
      ]
    },
    {
      "id": "hosp-blr-8",
      "name": "Jayadeva Institute of Cardiovascular Sciences Emergency Unit",
      "city": "Bengaluru",
      "district": "Bengaluru Urban",
      "state": "Karnataka",
      "zone": "Bannerghatta Road / Jayanagar 9th Block",
      "address": "Bannerghatta Main Rd, 9th Block, Jayanagar, Bengaluru 560069",
      "lat": 12.918,
      "lng": 77.5978,
      "emergencyPhone": "+91 80 2297 7400",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 80 2297 7222",
      "whatsapp": "+919845077400",
      "email": "emergency@jayadevacardiology.com",
      "website": "https://jayadevacardiology.com",
      "icuBedsAvailable": 30,
      "attachedBloodBank": "Jayadeva Blood Centre (On-site 24x7)",
      "specialties": [
        "Cardiac Arrest Trauma",
        "Primary Angioplasty / Cath Lab",
        "Emergency Bypass Resuscitation",
        "Platelet Support"
      ]
    },
    {
      "id": "hosp-blr-9",
      "name": "Aster CMI Hospital 24x7 Emergency Trauma Centre",
      "city": "Bengaluru",
      "district": "Bengaluru Urban",
      "state": "Karnataka",
      "zone": "Hebbal / Bellary Road (Airport Corridor)",
      "address": "No. 43/2, New Airport Road, NH 44, Sahakar Nagar, Hebbal, Bengaluru 560092",
      "lat": 13.0583,
      "lng": 77.5922,
      "emergencyPhone": "+91 80 4344 4344",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 80 4344 4111",
      "whatsapp": "+919845044344",
      "email": "emergency.cmi@asterhospital.com",
      "website": "https://asterhospitals.in",
      "icuBedsAvailable": 20,
      "attachedBloodBank": "Aster CMI Blood Bank (On-site 24x7)",
      "specialties": [
        "Highway Accident Polytrauma",
        "Emergency Stroke Resuscitation",
        "Pediatric Trauma ICU",
        "Cardiac Emergency"
      ]
    },
    {
      "id": "hosp-kar-mys-1",
      "name": "K.R. Hospital & MMCRI Accident Trauma Centre (Mysuru)",
      "city": "Mysuru",
      "district": "Mysuru",
      "state": "Karnataka",
      "zone": "Yadavagiri / Sayyaji Rao Road",
      "address": "Sayyaji Rao Rd, Medar Block, Yadavagiri, Mysuru, Karnataka 570001",
      "lat": 12.3168,
      "lng": 76.6508,
      "emergencyPhone": "+91 821 252 0512",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 821 252 0000",
      "whatsapp": "+919845052051",
      "email": "mmcri.emergency@karnataka.gov.in",
      "website": "https://mmcrimysore.in",
      "icuBedsAvailable": 18,
      "attachedBloodBank": "K.R. Hospital Blood Centre (On-site 24x7)",
      "specialties": [
        "Level 1 Government Trauma Centre",
        "Highway Accident Unit",
        "Emergency General Surgery",
        "Transfusion Medicine"
      ]
    },
    {
      "id": "hosp-kar-mys-2",
      "name": "JSS Hospital 24x7 Emergency & Trauma Care (Mysuru)",
      "city": "Mysuru",
      "district": "Mysuru",
      "state": "Karnataka",
      "zone": "Agrahara / Ramanuja Road",
      "address": "M.G. Road, Agrahara, Fort Mohalla, Mysuru, Karnataka 570004",
      "lat": 12.2958,
      "lng": 76.6534,
      "emergencyPhone": "+91 821 233 5555",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 821 233 5108",
      "whatsapp": "+919845055555",
      "email": "emergency@jsshospital.in",
      "website": "https://jsshospital.in",
      "icuBedsAvailable": 25,
      "attachedBloodBank": "JSS Hospital Blood Centre (On-site 24x7)",
      "specialties": [
        "NABH Level 1 Trauma Care",
        "Emergency Cath Lab",
        "Neuro-ICU",
        "Apheresis Unit"
      ]
    },
    {
      "id": "hosp-kar-mng-1",
      "name": "Kasturba Medical College (KMC) Hospital Emergency Centre (Mangaluru)",
      "city": "Mangaluru",
      "district": "Dakshina Kannada",
      "state": "Karnataka",
      "zone": "Ambedkar Circle / Light House Hill",
      "address": "Dr. B. R. Ambedkar Circle, Hampankatta, Mangaluru, Karnataka 575001",
      "lat": 12.8703,
      "lng": 74.8427,
      "emergencyPhone": "+91 824 244 5858",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 824 244 5111",
      "whatsapp": "+919845045858",
      "email": "emergency.kmc@manipal.edu",
      "website": "https://manipalhospitals.com/mangalore",
      "icuBedsAvailable": 20,
      "attachedBloodBank": "KMC Blood Centre (On-site 24x7)",
      "specialties": [
        "Coastal Highway Polytrauma",
        "Emergency Vascular Surgery",
        "Critical Care ICU",
        "Transfusion Medicine"
      ]
    },
    {
      "id": "hosp-kar-mng-2",
      "name": "District Wenlock Government Hospital Casualty (Mangaluru)",
      "city": "Mangaluru",
      "district": "Dakshina Kannada",
      "state": "Karnataka",
      "zone": "Hampankatta",
      "address": "K.S. Rao Road, Hampankatta, Mangaluru, Karnataka 575001",
      "lat": 12.8689,
      "lng": 74.842,
      "emergencyPhone": "+91 824 242 4118",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 824 242 4000",
      "whatsapp": "+919845024118",
      "email": "wenlock.emergency@karnataka.gov.in",
      "website": "https://karnataka.gov.in",
      "icuBedsAvailable": 15,
      "attachedBloodBank": "Wenlock Blood Centre (On-site 24x7)",
      "specialties": [
        "Government Accident & Emergency",
        "Burns ICU",
        "Emergency General Surgery"
      ]
    },
    {
      "id": "hosp-kar-udp-1",
      "name": "Kasturba Hospital Emergency & Trauma Care (Manipal / Udupi)",
      "city": "Udupi",
      "district": "Udupi",
      "state": "Karnataka",
      "zone": "Madhav Nagar / Manipal",
      "address": "Madhav Nagar, Manipal, Udupi, Karnataka 576104",
      "lat": 13.3525,
      "lng": 74.7865,
      "emergencyPhone": "+91 820 292 2332",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 820 292 2108",
      "whatsapp": "+919845022332",
      "email": "emergency.kh@manipal.edu",
      "website": "https://manipalhospitals.com",
      "icuBedsAvailable": 26,
      "attachedBloodBank": "Kasturba Hospital Blood Centre (On-site 24x7)",
      "specialties": [
        "Apex Level 1 Trauma Care",
        "Helipad Medical Evacuation",
        "Neuro-Trauma ICU",
        "Organ Transplant Emergency"
      ]
    },
    {
      "id": "hosp-kar-hub-1",
      "name": "KIMS Regional Apex Emergency & Trauma Centre (Hubballi)",
      "city": "Hubballi",
      "district": "Dharwad",
      "state": "Karnataka",
      "zone": "Vidyanagar",
      "address": "Vidyanagar, Hubballi, Karnataka 580022",
      "lat": 15.3647,
      "lng": 75.124,
      "emergencyPhone": "+91 836 237 0057",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 836 237 0108",
      "whatsapp": "+919845037005",
      "email": "kims.emergency@karnataka.gov.in",
      "website": "https://kimshubballi.karnataka.gov.in",
      "icuBedsAvailable": 24,
      "attachedBloodBank": "KIMS Regional Blood Centre (On-site 24x7)",
      "specialties": [
        "North Karnataka Level 1 Apex Trauma",
        "Severe Highway Collision ICU",
        "Emergency Neuro & Ortho Surgery"
      ]
    },
    {
      "id": "hosp-kar-hub-2",
      "name": "SDM College of Medical Sciences & Hospital (Dharwad)",
      "city": "Hubballi",
      "district": "Dharwad",
      "state": "Karnataka",
      "zone": "Sattur / Dharwad Highway",
      "address": "Manjushree Nagar, Sattur, Dharwad, Karnataka 580009",
      "lat": 15.4215,
      "lng": 75.056,
      "emergencyPhone": "+91 836 247 7777",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 836 247 7108",
      "whatsapp": "+919845077777",
      "email": "emergency@sdmmedicalcollege.org",
      "website": "https://sdmmedicalcollege.org",
      "icuBedsAvailable": 19,
      "attachedBloodBank": "SDM Blood Bank (On-site 24x7)",
      "specialties": [
        "Trauma & Emergency Medicine",
        "Critical Care Unit",
        "Cardiac Emergency Intervention"
      ]
    },
    {
      "id": "hosp-kar-bel-1",
      "name": "KLE Dr. Prabhakar Kore Charitable Hospital Trauma ICU (Belagavi)",
      "city": "Belagavi",
      "district": "Belagavi",
      "state": "Karnataka",
      "zone": "Nehru Nagar",
      "address": "JNMC Campus, Nehru Nagar, Belagavi, Karnataka 590010",
      "lat": 15.8872,
      "lng": 74.5165,
      "emergencyPhone": "+91 831 247 3777",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 831 247 3108",
      "whatsapp": "+919845073777",
      "email": "emergency@klehospital.org",
      "website": "https://klehospital.org",
      "icuBedsAvailable": 28,
      "attachedBloodBank": "KLE Centenary Blood Centre (On-site 24x7)",
      "specialties": [
        "Apex Trauma Center",
        "Highway Emergency Hub (NH 48)",
        "Acute Spine & Neuro Resuscitation"
      ]
    },
    {
      "id": "hosp-kar-dav-1",
      "name": "Bapuji Hospital Emergency Department (Davanagere)",
      "city": "Davanagere",
      "district": "Davanagere",
      "state": "Karnataka",
      "zone": "MCC B Block",
      "address": "Hadadi Road, MCC B Block, Davanagere, Karnataka 577004",
      "lat": 14.4644,
      "lng": 75.9218,
      "emergencyPhone": "+91 8192 231 405",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 8192 231 108",
      "whatsapp": "+919845031405",
      "email": "bapuji.emergency@jjmmc.org",
      "website": "https://jjmmc.org",
      "icuBedsAvailable": 17,
      "attachedBloodBank": "Bapuji Blood Centre (On-site 24x7)",
      "specialties": [
        "Central Karnataka Accident Resuscitation",
        "Orthopedic Polytrauma",
        "Emergency Phlebotomy"
      ]
    },
    {
      "id": "hosp-kar-kal-1",
      "name": "Gulbarga Institute of Medical Sciences (GIMS) Trauma Unit (Kalaburagi)",
      "city": "Kalaburagi",
      "district": "Kalaburagi",
      "state": "Karnataka",
      "zone": "Sedam Road",
      "address": "Sedam Road, Kalaburagi, Karnataka 585105",
      "lat": 17.3297,
      "lng": 76.8343,
      "emergencyPhone": "+91 8472 230 400",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 8472 230 108",
      "whatsapp": "+919845030400",
      "email": "gims.emergency@karnataka.gov.in",
      "website": "https://gims-gulbarga.com",
      "icuBedsAvailable": 20,
      "attachedBloodBank": "GIMS Blood Centre (On-site 24x7)",
      "specialties": [
        "Hyderabad-Karnataka Apex Emergency Hub",
        "Polytrauma & ICU",
        "Emergency Blood Transfusion"
      ]
    },
    {
      "id": "hosp-kar-bal-1",
      "name": "VIMS Emergency Trauma Hospital (Ballari)",
      "city": "Ballari",
      "district": "Ballari",
      "state": "Karnataka",
      "zone": "Cantonment",
      "address": "Cantonment, Ballari, Karnataka 583104",
      "lat": 15.1438,
      "lng": 76.9214,
      "emergencyPhone": "+91 8392 235 200",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 8392 235 108",
      "whatsapp": "+919845035200",
      "email": "vims.emergency@karnataka.gov.in",
      "website": "https://vims.karnataka.gov.in",
      "icuBedsAvailable": 16,
      "attachedBloodBank": "VIMS Blood Bank (On-site 24x7)",
      "specialties": [
        "Mining & Highway Trauma Management",
        "Accident Resuscitation",
        "Emergency General Surgery"
      ]
    },
    {
      "id": "hosp-kar-shm-1",
      "name": "SIMS Emergency Trauma Centre (Shivamogga)",
      "city": "Shivamogga",
      "district": "Shivamogga",
      "state": "Karnataka",
      "zone": "Sagar Road",
      "address": "N.H. 206, Sagar Road, Shivamogga, Karnataka 577201",
      "lat": 13.9299,
      "lng": 75.5681,
      "emergencyPhone": "+91 8182 229 933",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 8182 229 108",
      "whatsapp": "+919845029933",
      "email": "sims.emergency@karnataka.gov.in",
      "website": "https://sims.karnataka.gov.in",
      "icuBedsAvailable": 15,
      "attachedBloodBank": "SIMS Blood Centre (On-site 24x7)",
      "specialties": [
        "Malnad District Accident Care",
        "Emergency ICU",
        "Acute Hemorrhage Management"
      ]
    },
    {
      "id": "hosp-kar-tum-1",
      "name": "District Government Emergency Hospital (Tumakuru)",
      "city": "Tumakuru",
      "district": "Tumakuru",
      "state": "Karnataka",
      "zone": "B.H. Road",
      "address": "B.H. Road, Near Town Hall, Tumakuru, Karnataka 572101",
      "lat": 13.3379,
      "lng": 77.101,
      "emergencyPhone": "+91 816 227 8250",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 816 227 8108",
      "whatsapp": "+919845078250",
      "email": "tumkur.emergency@karnataka.gov.in",
      "website": "https://karnataka.gov.in",
      "icuBedsAvailable": 14,
      "attachedBloodBank": "Tumakuru District Blood Bank (On-site 24x7)",
      "specialties": [
        "NH 48 Highway Accident Resuscitation",
        "Emergency Casualty",
        "Trauma Surgery"
      ]
    },
    {
      "id": "hosp-kar-has-1",
      "name": "HIMS Emergency Hospital (Hassan)",
      "city": "Hassan",
      "district": "Hassan",
      "state": "Karnataka",
      "zone": "BM Road",
      "address": "Near Old Bus Stand, B.M. Road, Hassan, Karnataka 573201",
      "lat": 13.0033,
      "lng": 76.1004,
      "emergencyPhone": "+91 8172 231 699",
      "ambulancePhone": "108",
      "hospitalAmbulance": "+91 8172 231 108",
      "whatsapp": "+919845031699",
      "email": "hims.emergency@karnataka.gov.in",
      "website": "https://hims-hassan.org",
      "icuBedsAvailable": 14,
      "attachedBloodBank": "HIMS Blood Centre (On-site 24x7)",
      "specialties": [
        "Western Ghats / Shiradi Ghat Highway Trauma",
        "Accident ICU",
        "Emergency Resuscitation"
      ]
    }
  ];

  // =========================================================================
  // 3. SEEDED 15+ DONORS ACROSS ALL MAJOR CITIES & BLOOD GROUPS
  // =========================================================================
  const DEFAULT_DONORS = [
    {
      id: 'donor-1',
      name: 'Dr. Arjun K. Rao',
      email: 'arjun.rao@blr-med.org',
      phone: '+919845112233',
      bloodGroup: 'O+',
      city: 'Bengaluru',
      location: 'Indiranagar 100ft Road, Bengaluru',
      lat: 12.9719,
      lng: 77.6412,
      age: 32,
      weight: 72,
      available: true,
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-8921',
      lastDonationDate: '2026-06-10', // > 90 days ago -> fully eligible
      historicalResponseRate: 0.98,
      rating: 5.0,
      donationCount: 14,
      emergencyMedicalOverride: false
    },
    {
      id: 'donor-2',
      name: 'Priyanka Sharma',
      email: 'priyanka.s@gmail.com',
      phone: '+919880223344',
      bloodGroup: 'A+',
      city: 'Bengaluru',
      location: 'Koramangala 4th Block, Bengaluru',
      lat: 12.9345,
      lng: 77.6265,
      age: 27,
      weight: 58,
      available: true,
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-3412',
      lastDonationDate: '2026-05-18', // > 90 days ago -> eligible
      historicalResponseRate: 0.94,
      rating: 4.9,
      donationCount: 8,
      emergencyMedicalOverride: false
    },
    {
      id: 'donor-3',
      name: 'Karthik Venkatesh',
      email: 'karthik.v@techblr.io',
      phone: '+919741334455',
      bloodGroup: 'O-',
      city: 'Bengaluru',
      location: 'Jayanagar 4th T Block, Bengaluru',
      lat: 12.9298,
      lng: 77.5843,
      age: 36,
      weight: 78,
      available: true,
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-6789',
      lastDonationDate: '2026-07-02', // > 90 days -> eligible
      historicalResponseRate: 0.96,
      rating: 5.0,
      donationCount: 19,
      emergencyMedicalOverride: false
    },
    {
      id: 'donor-4',
      name: 'Sneha Nandakumar',
      email: 'sneha.n@outlook.com',
      phone: '+919632445566',
      bloodGroup: 'B+',
      city: 'Bengaluru',
      location: 'Whitefield ITPL Main Rd, Bengaluru',
      lat: 12.9856,
      lng: 77.7289,
      age: 29,
      weight: 54,
      available: false, // Currently on Cooldown!
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-4521',
      lastDonationDate: '2026-09-20', // ~35 days ago -> On 90-day cooldown!
      historicalResponseRate: 0.91,
      rating: 4.8,
      donationCount: 6,
      emergencyMedicalOverride: false
    },
    {
      id: 'donor-5',
      name: 'Rohan Deshmukh',
      email: 'rohan.d@fintech.in',
      phone: '+919513556677',
      bloodGroup: 'AB+',
      city: 'Bengaluru',
      location: 'Malleshwaram 15th Cross, Bengaluru',
      lat: 13.0031,
      lng: 77.5702,
      age: 34,
      weight: 68,
      available: true,
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-9011',
      lastDonationDate: '2026-06-25',
      historicalResponseRate: 0.93,
      rating: 4.9,
      donationCount: 11,
      emergencyMedicalOverride: false
    },
    {
      id: 'donor-6',
      name: 'Ananya Hegde',
      email: 'ananya.h@ecity.org',
      phone: '+919448667788',
      bloodGroup: 'A-',
      city: 'Bengaluru',
      location: 'Electronic City Phase 1, Bengaluru',
      lat: 12.8452,
      lng: 77.6602,
      age: 26,
      weight: 52,
      available: true,
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-1123',
      lastDonationDate: '2026-04-12',
      historicalResponseRate: 0.95,
      rating: 5.0,
      donationCount: 5,
      emergencyMedicalOverride: false
    },
    {
      id: 'donor-7',
      name: 'Vikramaditya Rathore',
      email: 'vikram.rathore@delhi-adv.in',
      phone: '+919810122334',
      bloodGroup: 'B-',
      city: 'New Delhi',
      location: 'Barakhamba Rd, Connaught Place, New Delhi',
      lat: 28.6315,
      lng: 77.2167,
      age: 35,
      weight: 75,
      available: true,
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-4422',
      lastDonationDate: '2026-05-10',
      historicalResponseRate: 0.95,
      rating: 4.95,
      donationCount: 9,
      emergencyMedicalOverride: false
    },
    {
      id: 'donor-8',
      name: 'Meera Iyer',
      email: 'meera.iyer@mumbai-art.org',
      phone: '+919820044556',
      bloodGroup: 'O+',
      city: 'Mumbai',
      location: 'Hill Road, Bandra West, Mumbai',
      lat: 19.0596,
      lng: 72.8295,
      age: 28,
      weight: 60,
      available: true,
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-7788',
      lastDonationDate: '2026-06-01',
      historicalResponseRate: 0.97,
      rating: 5.0,
      donationCount: 7,
      emergencyMedicalOverride: false
    },
    {
      id: 'donor-9',
      name: 'Dr. Aravind Swamy',
      email: 'aravind.swamy@chennai-med.edu',
      phone: '+919840066778',
      bloodGroup: 'AB-',
      city: 'Chennai',
      location: 'Panagal Park, T. Nagar, Chennai',
      lat: 13.0418,
      lng: 80.2341,
      age: 41,
      weight: 82,
      available: true,
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-9911',
      lastDonationDate: '2026-04-20',
      historicalResponseRate: 0.98,
      rating: 5.0,
      donationCount: 16,
      emergencyMedicalOverride: false
    },
    {
      id: 'donor-10',
      name: 'Rajeshwari Patel',
      email: 'rajeshwari.p@ahmedabad-tech.in',
      phone: '+919825088990',
      bloodGroup: 'O-',
      city: 'Ahmedabad',
      location: 'Bodakdev, SG Highway, Ahmedabad',
      lat: 23.0338,
      lng: 72.5126,
      age: 31,
      weight: 62,
      available: true,
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-5533',
      lastDonationDate: '2026-06-18',
      historicalResponseRate: 0.96,
      rating: 4.9,
      donationCount: 12,
      emergencyMedicalOverride: false
    },
    {
      id: 'donor-11',
      name: 'Faizan Ahmed',
      email: 'faizan.a@hyd-eng.in',
      phone: '+919849011223',
      bloodGroup: 'A+',
      city: 'Hyderabad',
      location: 'Banjara Hills Road No 10, Hyderabad',
      lat: 17.4156,
      lng: 78.4356,
      age: 30,
      weight: 70,
      available: true,
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-1144',
      lastDonationDate: '2026-05-30',
      historicalResponseRate: 0.94,
      rating: 4.8,
      donationCount: 8,
      emergencyMedicalOverride: false
    },
    {
      id: 'donor-12',
      name: 'Debojyoti Mukherjee',
      email: 'debojyoti.m@kol-legal.in',
      phone: '+919830088991',
      bloodGroup: 'B+',
      city: 'Kolkata',
      location: 'Salt Lake Sector 5, Kolkata',
      lat: 22.5804,
      lng: 88.4378,
      age: 37,
      weight: 76,
      available: true,
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-8822',
      lastDonationDate: '2026-06-12',
      historicalResponseRate: 0.93,
      rating: 4.9,
      donationCount: 10,
      emergencyMedicalOverride: false
    },
    {
      id: 'donor-13',
      name: 'Tanvi Verma',
      email: 'tanvi.verma@jaipur-des.in',
      phone: '+919829033445',
      bloodGroup: 'O+',
      city: 'Jaipur',
      location: 'C-Scheme, Ashok Nagar, Jaipur',
      lat: 26.9088,
      lng: 75.8052,
      age: 29,
      weight: 56,
      available: true,
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-6611',
      lastDonationDate: '2026-06-20',
      historicalResponseRate: 0.96,
      rating: 5.0,
      donationCount: 7,
      emergencyMedicalOverride: false
    },
    {
      id: 'donor-14',
      name: 'Suresh Menon',
      email: 'suresh.menon@kochi-shipping.in',
      phone: '+919847088992',
      bloodGroup: 'B-',
      city: 'Kochi',
      location: 'Marine Drive, Ernakulam, Kochi',
      lat: 9.9816,
      lng: 76.2762,
      age: 38,
      weight: 80,
      available: true,
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-9933',
      lastDonationDate: '2026-05-25',
      historicalResponseRate: 0.95,
      rating: 4.9,
      donationCount: 13,
      emergencyMedicalOverride: false
    },
    {
      id: 'donor-15',
      name: 'Kavya Reddy',
      email: 'kavya.reddy@hsr-tech.in',
      phone: '+919886011224',
      bloodGroup: 'AB+',
      city: 'Bengaluru',
      location: 'HSR Layout Sector 2, Bengaluru',
      lat: 12.9116,
      lng: 77.6389,
      age: 25,
      weight: 55,
      available: true,
      idVerified: true,
      aadhaarMasked: 'XXXX-XXXX-2255',
      lastDonationDate: '2026-07-01',
      historicalResponseRate: 0.97,
      rating: 5.0,
      donationCount: 6,
      emergencyMedicalOverride: false
    }
  ];

  // =========================================================================
  // 3.5 AI BLOOD DEMAND FORECAST & PREDICTIVE SHORTAGE RADAR DATA
  // =========================================================================
  const DEMAND_FORECAST_DATA = {
    generatedAt: '2026-10-25T08:00:00Z',
    forecastWindow: '7-Day Predictive Horizon',
    riskLevels: {
      'O-': { currentStock: 78, projectedDemand: 132, deficit: 54, status: 'CRITICAL_DEFICIT', urgency: 'High Shortage Risk within 36h', trend: '+42% demand spike (Trauma Protocol)' },
      'Platelets': { currentStock: 240, projectedDemand: 380, deficit: 140, status: 'CRITICAL_DEFICIT', urgency: 'Acute Monsoon Dengue Demand', trend: '+58% demand spike' },
      'A-': { currentStock: 64, projectedDemand: 82, deficit: 18, status: 'MODERATE_RISK', urgency: 'Buffer Below 48h Threshold', trend: '+14% weekly variance' },
      'B-': { currentStock: 52, projectedDemand: 68, deficit: 16, status: 'MODERATE_RISK', urgency: 'Reserve Warning', trend: '+18% weekly variance' },
      'AB-': { currentStock: 38, projectedDemand: 42, deficit: 4, status: 'MODERATE_RISK', urgency: 'Ultra-Rare Group Watchlist', trend: '+5% variance' },
      'O+': { currentStock: 340, projectedDemand: 310, deficit: 0, status: 'STABLE_RESERVE', urgency: 'Healthy Safe Buffer', trend: 'Equilibrium (±2%)' },
      'A+': { currentStock: 280, projectedDemand: 255, deficit: 0, status: 'STABLE_RESERVE', urgency: 'Adequate Municipal Reserve', trend: 'Equilibrium' },
      'B+': { currentStock: 310, projectedDemand: 275, deficit: 0, status: 'STABLE_RESERVE', urgency: 'Adequate Municipal Reserve', trend: 'Equilibrium' },
      'AB+': { currentStock: 160, projectedDemand: 130, deficit: 0, status: 'STABLE_RESERVE', urgency: 'Sufficient Plasma/Whole Blood Stock', trend: 'Equilibrium' }
    }
  };

  // =========================================================================
  // 3.6 AUTONOMOUS MEDICAL DRONE TELEMETRICS SIMULATOR
  // =========================================================================
  const DRONE_TELEMETRY = {
    callsign: 'AEROLIFE-DRONE-X4',
    model: 'Zipline VertiPort Medical Carrier MK-3',
    origin: 'Rotary Bangalore TTK Blood Centre (HAL Hub)',
    destination: 'Victoria Hospital Emergency Trauma Helipad',
    cargo: '2 Units Rare O- Whole Blood (Cold-Chain Insulated Pod)',
    cruisingSpeedKmh: 72,
    currentAltitudeMeters: 120,
    coldChainTempCelsius: 3.8, // Ideal 2 - 6 C
    tempIntegrity: 'STABLE_COLD_CHAIN',
    batteryPct: 84,
    distanceTotalKm: 7.8,
    distanceRemainingKm: 3.2,
    etaMinutes: 3.5,
    greenCorridorId: 'DGCA-MED-BLR-0921',
    waypoints: [
      { lat: 12.9698, lng: 77.6534, name: 'HAL Medical Drone Hub (Takeoff Completed)' },
      { lat: 12.9710, lng: 77.6250, name: 'Indiranagar Airway Waypoint Alpha' },
      { lat: 12.9670, lng: 77.6000, name: 'Corporation Circle Transit Waypoint Beta' },
      { lat: 12.9625, lng: 77.5750, name: 'Victoria Trauma Helipad (Approach Corridor)' }
    ]
  };

  // =========================================================================
  // 3.7 CLINICAL BLOOD COMPATIBILITY & CROSS-MATCHING MATRIX
  // =========================================================================
  const BLOOD_COMPATIBILITY_MATRIX = {
    'O-': {
      rbcCanDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal RBC Donor
      rbcCanReceiveFrom: ['O-'],
      plasmaCanDonateTo: ['O-'],
      plasmaCanReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      antigens: 'None (Zero A or B antigens on RBC surface)',
      antibodies: 'Anti-A, Anti-B in plasma',
      clinicalNote: 'Universal emergency red cell donor. Crucial for Level 1 trauma resuscitation before laboratory cross-matching is available.'
    },
    'O+': {
      rbcCanDonateTo: ['O+', 'A+', 'B+', 'AB+'],
      rbcCanReceiveFrom: ['O+', 'O-'],
      plasmaCanDonateTo: ['O+', 'O-'],
      plasmaCanReceiveFrom: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      antigens: 'Rh(D) factor only',
      antibodies: 'Anti-A, Anti-B in plasma',
      clinicalNote: 'Most frequent blood group in India (~37%). Suitable for all Rh-positive patients.'
    },
    'A-': {
      rbcCanDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
      rbcCanReceiveFrom: ['A-', 'O-'],
      plasmaCanDonateTo: ['A-', 'A+', 'O-', 'O+'],
      plasmaCanReceiveFrom: ['A-', 'A+', 'AB-', 'AB+'],
      antigens: 'A antigen',
      antibodies: 'Anti-B in plasma',
      clinicalNote: 'Rare Rh-negative group (~0.6% prevalence). High clinical priority.'
    },
    'A+': {
      rbcCanDonateTo: ['A+', 'AB+'],
      rbcCanReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
      plasmaCanDonateTo: ['A+', 'A-', 'O+', 'O-'],
      plasmaCanReceiveFrom: ['A+', 'A-', 'AB+', 'AB-'],
      antigens: 'A antigen + Rh(D) factor',
      antibodies: 'Anti-B in plasma',
      clinicalNote: 'Common patient transfusion group (~22% prevalence).'
    },
    'B-': {
      rbcCanDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
      rbcCanReceiveFrom: ['B-', 'O-'],
      plasmaCanDonateTo: ['B-', 'B+', 'O-', 'O+'],
      plasmaCanReceiveFrom: ['B-', 'B+', 'AB-', 'AB+'],
      antigens: 'B antigen',
      antibodies: 'Anti-A in plasma',
      clinicalNote: 'Rare group in traumatic hemorrhage. Requires careful donor matching.'
    },
    'B+': {
      rbcCanDonateTo: ['B+', 'AB+'],
      rbcCanReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
      plasmaCanDonateTo: ['B+', 'B-', 'O+', 'O-'],
      plasmaCanReceiveFrom: ['B+', 'B-', 'AB+', 'AB-'],
      antigens: 'B antigen + Rh(D) factor',
      antibodies: 'Anti-A in plasma',
      clinicalNote: 'Second most common group in India (~32%). High inventory demand.'
    },
    'AB-': {
      rbcCanDonateTo: ['AB-', 'AB+'],
      rbcCanReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
      plasmaCanDonateTo: ['AB-', 'AB+', 'A-', 'A+', 'B-', 'B+', 'O-', 'O+'],
      plasmaCanReceiveFrom: ['AB-'],
      antigens: 'A and B antigens, no Rh(D)',
      antibodies: 'No ABO antibodies in plasma',
      clinicalNote: 'Extremely rare (~0.15% in India). Platelets and plasma universally safe.'
    },
    'AB+': {
      rbcCanDonateTo: ['AB+'],
      rbcCanReceiveFrom: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], // Universal RBC Recipient
      plasmaCanDonateTo: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], // Universal Plasma Donor!
      plasmaCanReceiveFrom: ['AB+'],
      antigens: 'A, B antigens and Rh(D) factor',
      antibodies: 'None (Universal Plasma Donor)',
      clinicalNote: 'Universal Red Cell Recipient and Universal Fresh Frozen Plasma (FFP) Donor. Excellent for apheresis donation.'
    }
  };

  // Seeded Reviews
  const DEFAULT_REVIEWS = [
    {
      id: 'rev-1',
      reviewerName: 'Manipal Hospital ICU Team',
      reviewerRole: 'Hospital Requester',
      donorName: 'Dr. Arjun K. Rao',
      donorId: 'donor-1',
      rating: 5,
      comment: 'Arjun responded within 4 minutes and reached the hospital phlebotomy unit in 18 minutes for an acute bypass surgery. Invaluable life-saver!',
      date: '2026-10-14'
    },
    {
      id: 'rev-2',
      reviewerName: 'Rajesh & Family (Patient)',
      reviewerRole: 'Patient Relative',
      donorName: 'Karthik Venkatesh',
      donorId: 'donor-3',
      rating: 5,
      comment: 'Rare O- negative whole blood was needed for our mother at NIMHANS. Karthik coordinated directly via WhatsApp and arrived without delay.',
      date: '2026-10-02'
    },
    {
      id: 'rev-3',
      reviewerName: 'Sneha Nandakumar',
      reviewerRole: 'Donor',
      donorName: 'Rotary Bangalore TTK Blood Centre',
      donorId: 'bank-blr-5',
      rating: 5,
      comment: 'Very professional, painless donation experience. State-of-the-art sterile apheresis machinery.',
      date: '2026-09-20'
    }
  ];

  // =========================================================================
  // 4. HIGH-SPEED HAVERSINE DISTANCE ENGINE
  // =========================================================================
  function calculateDistance(lat1, lon1, lat2, lon2) {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 99999;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place (e.g., 1.4 km)
  }

  // =========================================================================
  // 5. STORAGE & QUERY INTERFACES (Nearest first!)
  // =========================================================================
  function getBloodBanks() {
    const raw = localStorage.getItem(STORAGE_KEY_BANKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_BANKS, JSON.stringify(DEFAULT_BANKS));
      return DEFAULT_BANKS;
    }
    try {
      const parsed = JSON.parse(raw);
      return (parsed && parsed.length >= DEFAULT_BANKS.length) ? parsed : DEFAULT_BANKS;
    } catch (e) {
      return DEFAULT_BANKS;
    }
  }

  function getNearbyBloodBanks(refLat, refLng, options) {
    options = options || {};
    const banks = getBloodBanks();
    const lat = refLat !== undefined ? refLat : 12.9716;
    const lng = refLng !== undefined ? refLng : 77.5946;

    const mapped = banks.map(b => {
      const distance = calculateDistance(lat, lng, b.lat, b.lng);
      return { ...b, distance };
    });

    // Nearest first!
    mapped.sort((a, b) => a.distance - b.distance);
    return mapped;
  }

  function updateBankStock(bankId, group, delta) {
    const banks = getBloodBanks();
    const bank = banks.find(b => b.id === bankId);
    if (!bank) return null;

    if (!bank.stock) bank.stock = {};
    const current = bank.stock[group] || 0;
    const updated = Math.max(0, current + delta);
    bank.stock[group] = updated;

    localStorage.setItem(STORAGE_KEY_BANKS, JSON.stringify(banks));

    window.dispatchEvent(new CustomEvent('bloodStockUpdated', {
      detail: { bankId, group, newStock: updated, delta }
    }));

    return bank;
  }

  function getHospitals() {
    const raw = localStorage.getItem(STORAGE_KEY_HOSPITALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(DEFAULT_HOSPITALS));
      return DEFAULT_HOSPITALS;
    }
    try {
      const parsed = JSON.parse(raw);
      return (parsed && parsed.length >= DEFAULT_HOSPITALS.length) ? parsed : DEFAULT_HOSPITALS;
    } catch (e) {
      return DEFAULT_HOSPITALS;
    }
  }

  function getNearbyHospitals(refLat, refLng) {
    const hospitals = getHospitals();
    const lat = refLat !== undefined ? refLat : 12.9716;
    const lng = refLng !== undefined ? refLng : 77.5946;

    const mapped = hospitals.map(h => {
      const distance = calculateDistance(lat, lng, h.lat, h.lng);
      return { ...h, distance };
    });

    // Nearest first!
    mapped.sort((a, b) => a.distance - b.distance);
    return mapped;
  }

  function getDonors() {
    const raw = localStorage.getItem(STORAGE_KEY_DONORS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DONORS, JSON.stringify(DEFAULT_DONORS));
      return DEFAULT_DONORS;
    }
    try {
      const parsed = JSON.parse(raw);
      return (parsed && parsed.length >= DEFAULT_DONORS.length) ? parsed : DEFAULT_DONORS;
    } catch (e) {
      return DEFAULT_DONORS;
    }
  }

  function getNearbyDonors(refLat, refLng) {
    const donors = getDonors();
    const lat = refLat !== undefined ? refLat : 12.9716;
    const lng = refLng !== undefined ? refLng : 77.5946;

    const mapped = donors.map(d => {
      const distance = calculateDistance(lat, lng, d.lat, d.lng);
      return { ...d, distance };
    });

    // Nearest first!
    mapped.sort((a, b) => a.distance - b.distance);
    return mapped;
  }

  function saveDonor(donorData) {
    const donors = getDonors();
    const existingIndex = donors.findIndex(d => d.id === donorData.id || d.email === donorData.email);
    if (existingIndex >= 0) {
      donors[existingIndex] = { ...donors[existingIndex], ...donorData };
    } else {
      donorData.id = donorData.id || `donor-${Date.now()}`;
      donors.push(donorData);
    }
    localStorage.setItem(STORAGE_KEY_DONORS, JSON.stringify(donors));
    return donorData;
  }

  function getReviews() {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
      return DEFAULT_REVIEWS;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_REVIEWS;
    }
  }

  function addReview(review) {
    const reviews = getReviews();
    review.id = `rev-${Date.now()}`;
    review.date = review.date || new Date().toISOString().split('T')[0];
    reviews.unshift(review);
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    return review;
  }

  function getActiveEmergencies() {
    const raw = localStorage.getItem(STORAGE_KEY_EMERGENCIES);
    if (!raw) {
      const demo = [
        {
          id: 'emg-101',
          patientName: 'Ramesh Sundaram',
          hospital: 'Victoria Hospital Emergency Trauma ICU, KR Market',
          bloodGroup: 'O+',
          units: 2,
          urgency: 'Critical',
          contact: '+919845011150',
          location: 'KR Market, Bengaluru',
          lat: 12.9625,
          lng: 77.5750,
          status: 'ACTIVE_SEARCH',
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          acceptedDonor: null
        }
      ];
      localStorage.setItem(STORAGE_KEY_EMERGENCIES, JSON.stringify(demo));
      return demo;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  function saveEmergency(emg) {
    const list = getActiveEmergencies();
    emg.id = emg.id || `emg-${Date.now()}`;
    emg.createdAt = emg.createdAt || new Date().toISOString();
    list.unshift(emg);
    localStorage.setItem(STORAGE_KEY_EMERGENCIES, JSON.stringify(list));
    return emg;
  }

  function updateEmergency(id, updates) {
    const list = getActiveEmergencies();
    const item = list.find(e => e.id === id);
    if (item) {
      Object.assign(item, updates);
      localStorage.setItem(STORAGE_KEY_EMERGENCIES, JSON.stringify(list));
    }
    return item;
  }

  return {
    calculateDistance,
    getBloodBanks,
    getNearbyBloodBanks,
    updateBankStock,
    getHospitals,
    getNearbyHospitals,
    getDonors,
    getNearbyDonors,
    saveDonor,
    getReviews,
    addReview,
    getActiveEmergencies,
    saveEmergency,
    updateEmergency,
    getDemandForecast: () => DEMAND_FORECAST_DATA,
    getDroneTelemetry: () => DRONE_TELEMETRY,
    getCompatibilityMatrix: () => BLOOD_COMPATIBILITY_MATRIX
  };
})();

// Provide both interfaces for 100% backward compatibility
if (typeof window !== 'undefined') {
  window.IndiaBloodData = IndiaBloodData;
  window.BangaloreBloodData = IndiaBloodData;
}
