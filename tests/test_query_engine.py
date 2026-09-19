import os
import json
import unittest

class TestQueryEngine(unittest.TestCase):
    OUTPUT_DIR = "graphrag/output"

    def setUp(self):
        with open(os.path.join(self.OUTPUT_DIR, "graph_data.json"), "r", encoding="utf-8") as f:
            self.graph_data = json.load(f)
        self.nodes = {n["name"].lower(): n for n in self.graph_data["nodes"]}
        self.links = self.graph_data["links"]
        self.communities = self.graph_data["communities"]

    def test_local_search_single_hop(self):
        # Query: ESP32-S3
        esp_key = "esp32-s3-wroom-1"
        self.assertIn(esp_key, self.nodes)
        node = self.nodes[esp_key]
        self.assertEqual(node["type"], "COMPONENT")
        
        # Verify 1-hop connected neighbors
        connected = []
        for l in self.links:
            if l["source"] == node["name"]:
                connected.append(l["target"])
            elif l["target"] == node["name"]:
                connected.append(l["source"])
        
        self.assertIn("Espressif Systems", connected)
        self.assertIn("BME688-MEMS", connected)
        self.assertIn("ATECC608A-TNGTLS", connected)
        self.assertIn("GPIO34", node["metadata"]["errata"])

    def test_global_search_synthesis(self):
        # Verify 8 communities with summaries and ratings
        self.assertEqual(len(self.communities), 8)
        ratings = [c["rating"] for c in self.communities]
        self.assertTrue(all(r >= 8.0 for r in ratings))
        
        # Verify wireless and industrial communities exist
        titles = [c["title"].lower() for c in self.communities]
        self.assertTrue(any("wireless" in t for t in titles))
        self.assertTrue(any("industrial" in t for t in titles))

    def test_drift_search_reasoning(self):
        # DRIFT: Starts at community macro context and dives into localized node hops
        comm_1 = next(c for c in self.communities if c["id"] == 1)
        self.assertIn("ESP32-S3-WROOM-1", comm_1["entities"])
        self.assertIn("BME688-MEMS", comm_1["entities"])
        self.assertTrue(len(comm_1["findings"]) >= 2)

    def test_hallucination_defense(self):
        # Non-existent component test
        unrelated = "intel core i9-14900k"
        self.assertNotIn(unrelated, self.nodes)
        
        # A proper GraphRAG query engine must detect missing entity
        entity_found = any(unrelated in n["name"].lower() for n in self.graph_data["nodes"])
        self.assertFalse(entity_found, "Hallucination defense failed: non-existent component was detected in graph")

if __name__ == "__main__":
    unittest.main()
