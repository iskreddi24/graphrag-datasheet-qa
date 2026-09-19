import os
import csv
import unittest

class TestDataset(unittest.TestCase):
    CSV_PATH = "data/raw/microcontroller_soc_datasheet.csv"
    EXPECTED_COLUMNS = [
        "part_number", "component_name", "category", "manufacturer",
        "core_architecture", "max_clock_mhz", "flash_memory_kb", "sram_kb",
        "operating_voltage_min_v", "operating_voltage_max_v", "active_current_ma",
        "sleep_current_ua", "supported_protocols", "package_type",
        "operating_temp_range_c", "compatible_companion_chips",
        "target_applications", "errata_and_operational_notes"
    ]

    def test_dataset_exists(self):
        self.assertTrue(os.path.exists(self.CSV_PATH), f"Missing {self.CSV_PATH}")
        self.assertGreater(os.path.getsize(self.CSV_PATH), 500)

    def test_dataset_row_count(self):
        with open(self.CSV_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        self.assertEqual(len(rows), 10, "Dataset must contain exactly 10 semiconductor component records")

    def test_dataset_columns_schema(self):
        with open(self.CSV_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            headers = reader.fieldnames or []
        for col in self.EXPECTED_COLUMNS:
            self.assertIn(col, headers, f"Expected column '{col}' missing from datasheet CSV")

if __name__ == "__main__":
    unittest.main()
