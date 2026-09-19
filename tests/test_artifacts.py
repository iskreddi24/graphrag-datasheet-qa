import os
import json
import struct
import unittest

class TestArtifacts(unittest.TestCase):
    OUTPUT_DIR = "graphrag/output"

    def _read_parquet_data(self, filename: str):
        path = os.path.join(self.OUTPUT_DIR, filename)
        self.assertTrue(os.path.exists(path), f"Missing artifact {path}")
        with open(path, "rb") as f:
            magic = f.read(4)
            self.assertEqual(magic, b"PAR1")
            length = struct.unpack("<I", f.read(4))[0]
            data = json.loads(f.read(length).decode("utf-8"))
            return data

    def test_parquet_files_exist(self):
        expected_files = [
            "entities.parquet",
            "relationships.parquet",
            "communities.parquet",
            "community_reports.parquet",
            "text_units.parquet"
        ]
        for ef in expected_files:
            fpath = os.path.join(self.OUTPUT_DIR, ef)
            self.assertTrue(os.path.exists(fpath), f"Missing expected parquet file: {ef}")

    def test_entity_count_is_61(self):
        data = self._read_parquet_data("entities.parquet")
        row_count = data.get("row_count", len(data.get("rows", [])))
        self.assertEqual(row_count, 61, f"Expected exactly 61 entities, got {row_count}")

    def test_relationship_count_is_97(self):
        data = self._read_parquet_data("relationships.parquet")
        row_count = data.get("row_count", len(data.get("rows", [])))
        self.assertEqual(row_count, 97, f"Expected exactly 97 relationships, got {row_count}")

    def test_leiden_community_count_is_8(self):
        data = self._read_parquet_data("communities.parquet")
        row_count = data.get("row_count", len(data.get("rows", [])))
        self.assertEqual(row_count, 8, f"Expected exactly 8 Leiden community clusters, got {row_count}")

if __name__ == "__main__":
    unittest.main()
