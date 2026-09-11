-- ============================================================
-- ARS St. Louis Portfolio - seed data (8 properties)
-- Source: CoreLogic Property Details + STL REALTORS Listing Contracts
--
-- NOTE ON LIST PRICES: The listing price on each contract is a
-- handwritten fill-in that does not extract from the PDF text.
-- list_price is left NULL until confirmed with the owner/agent.
-- ============================================================

PRAGMA foreign_keys = ON;

-- Clear existing rows (re-runnable)
DELETE FROM sale_history;
DELETE FROM features;
DELETE FROM valuations;
DELETE FROM descriptions;
DELETE FROM contracts;
DELETE FROM properties;
DELETE FROM owners;

-- ------------------------------------------------------------
-- Owners
-- ------------------------------------------------------------
INSERT INTO owners (owner_id, name, billing_address, billing_city, billing_state, billing_zip) VALUES
    (1, 'TDM Rentals, LLC',        '400 Sunset View Ct', 'Whitefish',  'MT', '59937'),
    (2, 'Tod & Donna Martin',      '547 E 6th Ave',      'Escondido',  'CA', '92025');

-- ------------------------------------------------------------
-- Properties
-- beds, full_baths, half_baths, living_sqft, lot_sqft, year_built
-- ------------------------------------------------------------
INSERT INTO properties
    (property_id, address, zip, owner_id, apn, clip, property_type,
     beds, full_baths, half_baths, living_sqft, lot_sqft, year_built,
     legal_description, mls_area, fire_district) VALUES
    (1, '10037 Dorothy Ave', '63137-3413', 1, '11E-23-0491', '7171865448', 'SFR',
     2, 1, 0, 720,   9500, 1940, 'COBURG LANDS LOT 25 SUBD OF LOT PT 5 N PART BLOCK 2', '31 - Riverview Gardens', 'North Cnty F & Rescue'),
    (2, '10062 Dorothy Ave', '63137-3412', 2, '11E-23-0611', '8507189653', 'SFR',
     2, 1, 0, 720,   9500, 1942, 'COBURG LANDS LOT 25 SUBD OF LOT PTS 17 & 18 BLOCK 1', '31 - Riverview Gardens', 'North Cnty F & Rescue'),
    (3, '10326 Ashbrook Dr', '63137-2119', 1, '11E-43-1131', '2320919691', 'SFR',
     2, 1, 0, 792,   7501, 1953, 'BISSELL HILLS PLAT 4 LOT 7 BLOCK 63', '31 - Riverview Gardens', 'North Cnty F & Rescue'),
    (4, '1229 Kilgore Dr',   '63137-2019', 2, '11F-62-0754', '3238060872', 'SFR',
     2, 1, 0, 792,   6839, 1952, 'BISSELL HILLS PLAT 3 LOT 18 BLOCK 17', '31 - Riverview Gardens', 'North Cnty F & Rescue'),
    (5, '651 Gleason Dr',    '63137-3315', 1, '11E-21-0417', '8474474498', 'SFR',
     2, 1, 0, 851,   8468, 1956, 'BISSELL HILLS PLAT 14 LOT 224', '31 - Riverview Gardens', 'North Cnty F & Rescue'),
    (6, '839 Font Ln',       '63137-3418', 1, '11E-53-0492', '5563277069', 'SFR',
     3, 1, 1, 1276,  7497, 1965, 'BELLA HILLS LOT 45', '31 - Riverview Gardens', 'North Cnty F & Rescue'),
    (7, '9266 Waldorf Dr',   '63137-1614', 2, '13F-63-1044', '8843274239', 'SFR',
     2, 2, 0, 957,   7876, 1950, 'HATHAWAY HILLS NO 2 LOT 137', '31 - Riverview Gardens', 'North Cnty F & Rescue'),
    (8, '9464 Adler Ave',    '63137-1301', 1, '12F-33-0427', '2310683914', 'SFR',
     3, 1, 0, 1046,  6264, 1954, 'HATHAWAY HILLS NO 1 LOT (see report)', '31 - Riverview Gardens', 'North Cnty F & Rescue');

-- ------------------------------------------------------------
-- Contracts (6% commission, term to 2027-03-01, list price TBD)
-- ------------------------------------------------------------
INSERT INTO contracts (contract_id, property_id, commission_pct, commission_flat, list_price, expiration_date, status) VALUES
    (1, 1, 6.0, NULL, 85000, '2027-03-01', 'Listed at $85,000'),
    (2, 2, 6.0, NULL, NULL, '2027-03-01', 'Listing agreement signed; list price to confirm'),
    (3, 3, 6.0, NULL, NULL, '2027-03-01', 'Listing agreement signed; list price to confirm'),
    (4, 4, 6.0, NULL, NULL, '2027-03-01', 'Listing agreement signed; list price to confirm'),
    (5, 5, 6.0, NULL, NULL, '2027-03-01', 'Listing agreement signed; list price to confirm'),
    (6, 6, 6.0, NULL, NULL, '2027-03-01', 'Listing agreement signed; list price to confirm'),
    (7, 7, 6.0, NULL, NULL, '2027-03-01', 'Listing agreement signed; list price to confirm'),
    (8, 8, 6.0, NULL, NULL, '2027-03-01', 'Listing agreement signed; list price to confirm');

-- ------------------------------------------------------------
-- Valuations: county assessment/market, tax, and CoreLogic RealAVM
-- market_total and total_tax are the 2023/2024/2025 county values.
-- RealAVM (with low/high range) is recorded on the 2025 row.
-- ------------------------------------------------------------
-- 10037 Dorothy (no RealAVM in report)
INSERT INTO valuations (property_id, year, assessed_total, market_total, total_tax, realavm, realavm_low, realavm_high) VALUES
    (1, 2023, 10790, 56800, 1136, NULL, NULL, NULL),
    (1, 2024, 10790, 56800, 1151, NULL, NULL, NULL),
    (1, 2025, 12540, 66000, 1221, NULL, NULL, NULL);
-- 10062 Dorothy
INSERT INTO valuations (property_id, year, assessed_total, market_total, total_tax, realavm, realavm_low, realavm_high) VALUES
    (2, 2023, 12480, 65700, 1309, NULL, NULL, NULL),
    (2, 2024, 12480, 65700, 1327, NULL, NULL, NULL),
    (2, 2025, 14100, 74200, 1369, 88500, 69900, 107100);
-- 10326 Ashbrook
INSERT INTO valuations (property_id, year, assessed_total, market_total, total_tax, realavm, realavm_low, realavm_high) VALUES
    (3, 2023, 13240, 69700, 1512, NULL, NULL, NULL),
    (3, 2024, 13240, 69700, 1531, NULL, NULL, NULL),
    (3, 2025, 14420, 75900, 1533, 100400, 83700, 117100);
-- 1229 Kilgore
INSERT INTO valuations (property_id, year, assessed_total, market_total, total_tax, realavm, realavm_low, realavm_high) VALUES
    (4, 2023, NULL, 71200, 1545, NULL, NULL, NULL),
    (4, 2024, NULL, 78400, 1564, NULL, NULL, NULL),
    (4, 2025, NULL, 78400, 1583, 92800, 77600, 108100);
-- 651 Gleason
INSERT INTO valuations (property_id, year, assessed_total, market_total, total_tax, realavm, realavm_low, realavm_high) VALUES
    (5, 2023, NULL, 79400, 1719, NULL, NULL, NULL),
    (5, 2024, NULL, 79400, 1741, NULL, NULL, NULL),
    (5, 2025, NULL, 79300, 1601, 97600, 77000, 118100);
-- 839 Font
INSERT INTO valuations (property_id, year, assessed_total, market_total, total_tax, realavm, realavm_low, realavm_high) VALUES
    (6, 2023, NULL, 88300, 1908, NULL, NULL, NULL),
    (6, 2024, NULL, 88300, 1931, NULL, NULL, NULL),
    (6, 2025, NULL, 114900, 2308, 138200, 122900, 153400);
-- 9266 Waldorf
INSERT INTO valuations (property_id, year, assessed_total, market_total, total_tax, realavm, realavm_low, realavm_high) VALUES
    (7, 2023, NULL, 75900, 1644, NULL, NULL, NULL),
    (7, 2024, NULL, 75900, 1665, NULL, NULL, NULL),
    (7, 2025, NULL, 123200, 2471, 108100, 90100, 126100);
-- 9464 Adler
INSERT INTO valuations (property_id, year, assessed_total, market_total, total_tax, realavm, realavm_low, realavm_high) VALUES
    (8, 2023, 15900, 83700, 1810, NULL, NULL, NULL),
    (8, 2024, 15900, 83700, 1832, NULL, NULL, NULL),
    (8, 2025, NULL, 98800, 1987, 107500, 91600, 123400);

-- ------------------------------------------------------------
-- Features (building components from tax report)
-- ------------------------------------------------------------
INSERT INTO features (property_id, feature_type, size_sqft) VALUES
    (1, 'Main Dwelling', 720), (1, 'Detached Frame Garage', 416), (1, 'Open Frame Porch', 20),
    (2, 'Main Dwelling', 720), (2, 'Detached Frame Garage', 576), (2, 'Unfinished Basement', 80), (2, 'Open Frame Porch', 32),
    (3, 'Main Dwelling', 792), (3, 'Frame Garage', 200), (3, 'Enclosed Frame Porch', 77),
    (4, 'Main Dwelling', 792), (4, 'Frame Garage', 220),
    (5, 'Main Dwelling', 840), (5, 'Frame Garage', 240), (5, 'Enclosed Frame Porch', 96),
    (6, 'Main Dwelling', 988), (6, 'Frame Garage', 312),
    (7, 'Main Dwelling', 957), (7, 'Masonry/Brick Garage', 220), (7, 'Concrete/Masonry Patio', 350), (7, 'Open Frame Porch', 40),
    (8, 'Main Dwelling', 1026), (8, 'Masonry/Brick Garage', 264), (8, 'Open Frame Porch', 75), (8, 'Concrete/Masonry Patio', 316);

-- ------------------------------------------------------------
-- Sale history (most recent recorded sale flagged is_last_sale=1)
-- ------------------------------------------------------------
INSERT INTO sale_history (property_id, sale_date, sale_price, buyer_name, seller_name, deed_type, is_last_sale) VALUES
    (1, '2022-05-31', 24900, 'TDM Rentals LLC', 'STL Homebuyers LLC',     'Warranty Deed', 1),
    (2, '2021-12-14', 52000, 'Tod & Donna Martin', 'Wince Launders & Joyce', 'Warranty Deed', 1),
    (3, '2022-07-20', 72000, 'TDM Rentals LLC', NULL,                     'Warranty Deed', 1),
    (4, '2022-04-07', 60000, 'TDM Rentals LLC', 'Taylor Michelle',        'Warranty Deed', 1),
    (5, '2022-07-29', 75000, 'TDM Rentals LLC', 'Ihms Wayne T',           'Warranty Deed', 1),
    (6, '2022-06-06', 46000, 'TDM Rentals LLC', 'Rocklin Group LLC',      'Warranty Deed', 1),
    (7, '2021-01-25', 60000, 'Tod & Donna Martin', 'Wince Launders & Joyce', 'Warranty Deed', 1),
    (8, '2022-03-02', 75000, 'TDM Rentals LLC', 'Nuha Brian & Sharyn',    'Warranty Deed', 1);

-- ------------------------------------------------------------
-- Descriptions (MLS, retail, investor tones)
-- ------------------------------------------------------------
INSERT INTO descriptions (property_id, mls_description, retail_description, investor_description) VALUES
    (1,
     'Charming 2 bedroom, 1 bathroom home in Riverview Gardens. Built in 1940, this 720-square-foot residence offers solid bones and great potential. Nestled in a quiet, established neighborhood, this property is ready for new ownership. Perfect for owner-occupants or investors seeking value and opportunity.',
     'Welcome home! This delightful 2-bed, 1-bath Riverview Gardens gem offers 720 sq ft of comfortable living space. Built in 1940, this classic home features the character and charm of mid-century residential architecture. Situated in a peaceful, tight-knit community, this is your canvas to create lasting memories. Ideal for buyers looking to establish roots in an affordable, friendly neighborhood.',
     '2BR/1BA SFR in Riverview Gardens. 720 sf. Built 1940. Stable rental market area with established tenant demand. Well-positioned for rental income or renovation/resale play. Strong fundamentals: solid construction, manageable footprint, proven resilience in local market. Excellent value-add opportunity for disciplined investors. Held or repositioned.'),
    (2,
     'Charming 2 bedroom, 1 bathroom home in Riverview Gardens. Built in 1942, this 720-square-foot residence offers solid bones and great potential. Nestled in a quiet, established neighborhood, this property is ready for new ownership. Perfect for owner-occupants or investors seeking value and opportunity.',
     'Welcome home! This delightful 2-bed, 1-bath Riverview Gardens gem offers 720 sq ft of comfortable living space. Built in 1942, this classic home features the character and charm of mid-century residential architecture. Situated in a peaceful, tight-knit community, this is your canvas to create lasting memories. Ideal for buyers looking to establish roots in an affordable, friendly neighborhood.',
     '2BR/1BA SFR in Riverview Gardens. 720 sf. Built 1942. Stable rental market area with established tenant demand. Well-positioned for rental income or renovation/resale play. Strong fundamentals: solid construction, manageable footprint, proven resilience in local market. Excellent value-add opportunity for disciplined investors. Held or repositioned.'),
    (3,
     'Charming 2 bedroom, 1 bathroom home in Riverview Gardens. Built in 1953, this 792-square-foot residence offers solid bones and great potential. Nestled in a quiet, established neighborhood, this property is ready for new ownership. Perfect for owner-occupants or investors seeking value and opportunity.',
     'Welcome home! This delightful 2-bed, 1-bath Riverview Gardens gem offers 792 sq ft of comfortable living space. Built in 1953, this classic home features the character and charm of mid-century residential architecture. Situated in a peaceful, tight-knit community, this is your canvas to create lasting memories. Ideal for buyers looking to establish roots in an affordable, friendly neighborhood.',
     '2BR/1BA SFR in Riverview Gardens. 792 sf. Built 1953. Stable rental market area with established tenant demand. Well-positioned for rental income or renovation/resale play. Strong fundamentals: solid construction, manageable footprint, proven resilience in local market. Excellent value-add opportunity for disciplined investors. Held or repositioned.'),
    (4,
     'Charming 2 bedroom, 1 bathroom home in Riverview Gardens. Built in 1952, this 792-square-foot residence offers solid bones and great potential. Nestled in a quiet, established neighborhood, this property is ready for new ownership. Perfect for owner-occupants or investors seeking value and opportunity.',
     'Welcome home! This delightful 2-bed, 1-bath Riverview Gardens gem offers 792 sq ft of comfortable living space. Built in 1952, this classic home features the character and charm of mid-century residential architecture. Situated in a peaceful, tight-knit community, this is your canvas to create lasting memories. Ideal for buyers looking to establish roots in an affordable, friendly neighborhood.',
     '2BR/1BA SFR in Riverview Gardens. 792 sf. Built 1952. Stable rental market area with established tenant demand. Well-positioned for rental income or renovation/resale play. Strong fundamentals: solid construction, manageable footprint, proven resilience in local market. Excellent value-add opportunity for disciplined investors. Held or repositioned.'),
    (5,
     'Charming 2 bedroom, 1 bathroom home in Riverview Gardens. Built in 1956, this 851-square-foot residence offers solid bones and great potential. Nestled in a quiet, established neighborhood, this property is ready for new ownership. Perfect for owner-occupants or investors seeking value and opportunity.',
     'Welcome home! This delightful 2-bed, 1-bath Riverview Gardens gem offers 851 sq ft of comfortable living space. Built in 1956, this classic home features the character and charm of mid-century residential architecture. Situated in a peaceful, tight-knit community, this is your canvas to create lasting memories. Ideal for buyers looking to establish roots in an affordable, friendly neighborhood.',
     '2BR/1BA SFR in Riverview Gardens. 851 sf. Built 1956. Stable rental market area with established tenant demand. Well-positioned for rental income or renovation/resale play. Strong fundamentals: solid construction, manageable footprint, proven resilience in local market. Excellent value-add opportunity for disciplined investors. Held or repositioned.'),
    (6,
     'Charming 3 bedroom, 1 bathroom home in Riverview Gardens. Built in 1965, this 1276-square-foot residence offers solid bones and great potential. Nestled in a quiet, established neighborhood, this property is ready for new ownership. Perfect for owner-occupants or investors seeking value and opportunity.',
     'Welcome home! This delightful 3-bed, 1-bath Riverview Gardens gem offers 1276 sq ft of comfortable living space. Built in 1965, this classic home features the character and charm of mid-century residential architecture. Situated in a peaceful, tight-knit community, this is your canvas to create lasting memories. Ideal for buyers looking to establish roots in an affordable, friendly neighborhood.',
     '3BR/1BA SFR in Riverview Gardens. 1276 sf. Built 1965. Stable rental market area with established tenant demand. Well-positioned for rental income or renovation/resale play. Strong fundamentals: solid construction, manageable footprint, proven resilience in local market. Excellent value-add opportunity for disciplined investors. Held or repositioned.'),
    (7,
     'Charming 2 bedroom, 2 bathroom home in Riverview Gardens. Built in 1950, this 957-square-foot residence offers solid bones and great potential. Nestled in a quiet, established neighborhood, this property is ready for new ownership. Perfect for owner-occupants or investors seeking value and opportunity.',
     'Welcome home! This delightful 2-bed, 2-bath Riverview Gardens gem offers 957 sq ft of comfortable living space. Built in 1950, this classic home features the character and charm of mid-century residential architecture. Situated in a peaceful, tight-knit community, this is your canvas to create lasting memories. Ideal for buyers looking to establish roots in an affordable, friendly neighborhood.',
     '2BR/2BA SFR in Riverview Gardens. 957 sf. Built 1950. Stable rental market area with established tenant demand. Well-positioned for rental income or renovation/resale play. Strong fundamentals: solid construction, manageable footprint, proven resilience in local market. Excellent value-add opportunity for disciplined investors. Held or repositioned.'),
    (8,
     'Charming 3 bedroom, 1 bathroom home in Riverview Gardens. Built in 1954, this 1046-square-foot residence offers solid bones and great potential. Nestled in a quiet, established neighborhood, this property is ready for new ownership. Perfect for owner-occupants or investors seeking value and opportunity.',
     'Welcome home! This delightful 3-bed, 1-bath Riverview Gardens gem offers 1046 sq ft of comfortable living space. Built in 1954, this classic home features the character and charm of mid-century residential architecture. Situated in a peaceful, tight-knit community, this is your canvas to create lasting memories. Ideal for buyers looking to establish roots in an affordable, friendly neighborhood.',
     '3BR/1BA SFR in Riverview Gardens. 1046 sf. Built 1954. Stable rental market area with established tenant demand. Well-positioned for rental income or renovation/resale play. Strong fundamentals: solid construction, manageable footprint, proven resilience in local market. Excellent value-add opportunity for disciplined investors. Held or repositioned.');
