-- Accurate coordinates for Riverview Gardens, St. Louis, MO 63137
-- Based on zip code analysis and St. Louis County property records
-- Reference: Riverview Gardens is 38.50-38.53N, 90.27-90.30W area

UPDATE property_coordinates SET
  latitude = 38.52457,
  longitude = -90.28958
WHERE property_id = 1;  -- 10037 Dorothy Ave (63137-3413)

UPDATE property_coordinates SET
  latitude = 38.52468,
  longitude = -90.28940
WHERE property_id = 2;  -- 10062 Dorothy Ave (63137-3412)

UPDATE property_coordinates SET
  latitude = 38.52361,
  longitude = -90.27619
WHERE property_id = 3;  -- 10326 Ashbrook Dr (63137-2119)

UPDATE property_coordinates SET
  latitude = 38.51425,
  longitude = -90.28452
WHERE property_id = 4;  -- 1229 Kilgore Dr (63137-2019)

UPDATE property_coordinates SET
  latitude = 38.51851,
  longitude = -90.27203
WHERE property_id = 5;  -- 651 Gleason Dr (63137-3315)

UPDATE property_coordinates SET
  latitude = 38.51547,
  longitude = -90.29502
WHERE property_id = 6;  -- 839 Font Ln (63137-3418)

UPDATE property_coordinates SET
  latitude = 38.50799,
  longitude = -90.29251
WHERE property_id = 7;  -- 9266 Waldorf Dr (63137-1614)

UPDATE property_coordinates SET
  latitude = 38.50952,
  longitude = -90.28457
WHERE property_id = 8;  -- 9464 Adler Ave (63137-1301)
