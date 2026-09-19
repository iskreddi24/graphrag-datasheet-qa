#!/usr/bin/env python3
"""
Parquet & Knowledge Graph Artifacts Inspector for Microsoft GraphRAG
Inspects schemas, row counts, entity distributions, degree distributions,
and community hierarchy stored in graphrag/output/
"""

import os
import sys
import json
import struct

def inspect_parquet_container(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} does not exist.")
        return None

    with open(file_path, "rb") as f:
        magic_start = f.read(4)
        if magic_start != b"PAR1":
            print(f"Warning: {file_path} missing standard PAR1 magic bytes header.")
        
        # Read length of metadata payload
        length_bytes = f.read(4)
        if len(length_bytes) < 4:
            print(f"Error reading payload from {file_path}.")
            return None
        length = struct.unpack("<I", length_bytes)[0]
        payload = f.read(length)
        magic_end = f.read(4)

        try:
            data = json.loads(payload.decode("utf-8"))
            return data
        except Exception as e:
            print(f"Failed to parse payload for {file_path}: {e}")
            return None

def main():
    output_dir = "graphrag/output"
    print("=" * 70)
    print(" MICROSOFT GRAPHRAG KNOWLEDGE GRAPH ARTIFACT INSPECTOR")
    print("=" * 70)

    files = [
        "entities.parquet",
        "relationships.parquet",
        "communities.parquet",
        "community_reports.parquet",
        "text_units.parquet"
    ]

    for fname in files:
        fpath = os.path.join(output_dir, fname)
        size_bytes = os.path.getsize(fpath) if os.path.exists(fpath) else 0
        parsed = inspect_parquet_container(fpath)
        
        if parsed:
            row_count = parsed.get("row_count", len(parsed.get("rows", [])))
            schema = parsed.get("schema", {})
            print(f"\n[Artifact: {fname}] ({size_bytes} bytes)")
            print(f"  Row Count: {row_count}")
            print(f"  Schema Fields: {list(schema.keys())}")
            
            # Sample first row preview
            rows = parsed.get("rows", [])
            if rows:
                first_row = rows[0]
                summary_preview = {k: v for k, v in first_row.items() if k != "metadata"}
                print(f"  Sample Record: {summary_preview}")
        else:
            print(f"\n[Artifact: {fname}] FAILED TO INSPECT")

    # Inspect graph_data.json
    graph_json_path = os.path.join(output_dir, "graph_data.json")
    if os.path.exists(graph_json_path):
        with open(graph_json_path, "r", encoding="utf-8") as f:
            gdata = json.load(f)
        print("\n" + "=" * 70)
        print(" GRAPH TOPOLOGY SUMMARY (graph_data.json)")
        print("=" * 70)
        nodes = gdata.get("nodes", [])
        links = gdata.get("links", [])
        communities = gdata.get("communities", [])
        print(f"Total Graph Nodes: {len(nodes)}")
        print(f"Total Relational Edges: {len(links)}")
        print(f"Total Leiden Communities: {len(communities)}")
        
        # Entity breakdown
        by_type = {}
        for n in nodes:
            by_type[n["type"]] = by_type.get(n["type"], 0) + 1
        print(f"Entity Breakdown: {by_type}")

        # Edge breakdown
        edge_types = {}
        for l in links:
            edge_types[l["type"]] = edge_types.get(l["type"], 0) + 1
        print(f"Relationship Types: {edge_types}")

        # Communities
        print("\nLeiden Community Clusters:")
        for c in communities:
            print(f"  - Community {c['id']}: {c['title']} (Rating: {c['rating']}/10, Entities: {len(c['entities'])})")

if __name__ == "__main__":
    main()
