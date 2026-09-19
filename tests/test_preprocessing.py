import os
import glob
import unittest

class TestPreprocessing(unittest.TestCase):
    INPUT_DIR = "graphrag/input"

    def test_input_text_units_generated(self):
        self.assertTrue(os.path.exists(self.INPUT_DIR), f"Missing {self.INPUT_DIR}")
        txt_files = glob.glob(os.path.join(self.INPUT_DIR, "*.txt"))
        self.assertEqual(len(txt_files), 10, f"Expected 10 preprocessed text unit files, found {len(txt_files)}")

    def test_text_unit_content_structure(self):
        txt_files = glob.glob(os.path.join(self.INPUT_DIR, "*.txt"))
        for tf in txt_files:
            with open(tf, "r", encoding="utf-8") as f:
                content = f.read()
            self.assertIn("# Semiconductor Technical Datasheet:", content)
            self.assertIn("## 1. Product Overview & Identity", content)
            self.assertIn("## 2. Processing Core & Architectural Profile", content)
            self.assertIn("## 3. Electrical & Power Ratings", content)
            self.assertIn("## 4. Hardware Interfaces & Peripheral Buses", content)
            self.assertIn("## 5. System Interoperability & Companion ICs", content)
            self.assertIn("## 6. Critical Silicon Errata & Engineering Guidelines", content)

    def test_numeric_ranges_normalized(self):
        txt_files = glob.glob(os.path.join(self.INPUT_DIR, "*.txt"))
        for tf in txt_files:
            with open(tf, "r", encoding="utf-8") as f:
                content = f.read()
            self.assertIn("MHz", content)
            self.assertIn("Supply Voltage:", content)
            self.assertIn("Operating Current:", content)

if __name__ == "__main__":
    unittest.main()
