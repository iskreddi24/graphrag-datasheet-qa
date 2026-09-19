import os
import unittest

class TestConfig(unittest.TestCase):
    CONFIG_PATH = "graphrag/settings.yaml"

    def test_settings_yaml_exists(self):
        self.assertTrue(os.path.exists(self.CONFIG_PATH), f"Missing {self.CONFIG_PATH}")
        with open(self.CONFIG_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("version: 3.1.2", content)
        self.assertIn("encoding_model:", content)

    def test_entity_types_configured(self):
        with open(self.CONFIG_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        expected_types = ["COMPONENT", "MANUFACTURER", "PROTOCOL", "CORE_ARCHITECTURE"]
        for et in expected_types:
            self.assertIn(et, content, f"Entity type '{et}' not defined in settings.yaml")

    def test_search_modes_configured(self):
        with open(self.CONFIG_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("local_search:", content)
        self.assertIn("global_search:", content)
        self.assertIn("drift_search:", content)

if __name__ == "__main__":
    unittest.main()
