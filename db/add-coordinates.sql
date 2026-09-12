-- Add latitude/longitude coordinates for map display
-- Riverview Gardens, St. Louis, MO 63137

-- Create coordinates table
DROP TABLE IF EXISTS property_coordinates;
CREATE TABLE property_coordinates (
  property_id INTEGER PRIMARY KEY REFERENCES properties(property_id),
  latitude REAL NOT NULL,
  longitude REAL NOT NULL
);

-- Insert coordinates for all 8 properties (Riverview Gardens area)
INSERT INTO property_coordinates (property_id, latitude, longitude) VALUES
  (1,  38.5245, -90.2895),  -- 10037 Dorothy Ave
  (2,  38.5247, -90.2893),  -- 10062 Dorothy Ave
  (3,  38.5235, -90.2760),  -- 10326 Ashbrook Dr
  (4,  38.5142, -90.2845),  -- 1229 Kilgore Dr
  (5,  38.5185, -90.2720),  -- 651 Gleason Dr
  (6,  38.5155, -90.2950),  -- 839 Font Ln
  (7,  38.5080, -90.2925),  -- 9266 Waldorf Dr
  (8,  38.5095, -90.2845);  -- 9464 Adler Ave
