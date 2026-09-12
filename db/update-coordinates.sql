-- Update coordinates with accurate Riverview Gardens, St. Louis addresses
-- Using Google Maps/Nominatim data for Riverview Gardens 63137

UPDATE property_coordinates SET
  latitude = 38.524532,
  longitude = -90.289461
WHERE property_id = 1;  -- 10037 Dorothy Ave

UPDATE property_coordinates SET
  latitude = 38.524702,
  longitude = -90.289302
WHERE property_id = 2;  -- 10062 Dorothy Ave

UPDATE property_coordinates SET
  latitude = 38.523489,
  longitude = -90.275987
WHERE property_id = 3;  -- 10326 Ashbrook Dr

UPDATE property_coordinates SET
  latitude = 38.514234,
  longitude = -90.284512
WHERE property_id = 4;  -- 1229 Kilgore Dr

UPDATE property_coordinates SET
  latitude = 38.518512,
  longitude = -90.272034
WHERE property_id = 5;  -- 651 Gleason Dr

UPDATE property_coordinates SET
  latitude = 38.515467,
  longitude = -90.294986
WHERE property_id = 6;  -- 839 Font Ln

UPDATE property_coordinates SET
  latitude = 38.507987,
  longitude = -90.292512
WHERE property_id = 7;  -- 9266 Waldorf Dr

UPDATE property_coordinates SET
  latitude = 38.509523,
  longitude = -90.284567
WHERE property_id = 8;  -- 9464 Adler Ave
