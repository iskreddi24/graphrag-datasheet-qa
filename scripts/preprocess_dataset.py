#!/usr/bin/env python3
"""
Preprocessing Pipeline for Semiconductor Datasheet Knowledge Graph
Reads data/raw/microcontroller_soc_datasheet.csv and formats cohesive textual
units into graphrag/input/ for Microsoft GraphRAG indexing.
"""

import csv
import os
import sys
import argparse

EXPECTED_COLUMNS = [
    "part_number",
    "component_name",
    "category",
    "manufacturer",
    "core_architecture",
    "max_clock_mhz",
    "flash_memory_kb",
    "sram_kb",
    "operating_voltage_min_v",
    "operating_voltage_max_v",
    "active_current_ma",
    "sleep_current_ua",
    "supported_protocols",
    "package_type",
    "operating_temp_range_c",
    "compatible_companion_chips",
    "target_applications",
    "errata_and_operational_notes"
]

def preprocess(source_path: str, output_dir: str):
    if not os.path.exists(source_path):
        print(f"Error: Source file {source_path} not found.")
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)

    with open(source_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []

        # Validate headers
        missing = [col for col in EXPECTED_COLUMNS if col not in headers]
        if missing:
            print(f"Error: Missing columns in CSV: {missing}")
            sys.exit(1)

        records = list(reader)

    print(f"Loaded {len(records)} datasheet records from {source_path}.")

    processed_count = 0
    for row in records:
        part_no = row["part_number"].strip()
        comp_name = row["component_name"].strip()
        category = row["category"].strip()
        mfg = row["manufacturer"].strip()
        core = row["core_architecture"].strip()
        clock = row["max_clock_mhz"].strip()
        flash = row["flash_memory_kb"].strip()
        sram = row["sram_kb"].strip()
        v_min = row["operating_voltage_min_v"].strip()
        v_max = row["operating_voltage_max_v"].strip()
        active_ma = row["active_current_ma"].strip()
        sleep_ua = row["sleep_current_ua"].strip()
        protocols = row["supported_protocols"].strip()
        pkg = row["package_type"].strip()
        temp = row["operating_temp_range_c"].strip()
        companions = row["compatible_companion_chips"].strip()
        apps = row["target_applications"].strip()
        errata = row["errata_and_operational_notes"].strip()

        text_content = f"""# Semiconductor Technical Datasheet: {part_no}

## 1. Product Overview & Identity
- Part Identifier: {part_no}
- Product Title: {comp_name}
- Semiconductor Classification: {category}
- Original Manufacturer: {mfg}
- Physical Packaging: {pkg}
- Thermal Operating Specification: {temp}

## 2. Processing Core & Architectural Profile
- Core Architecture: {core}
- Peak Operating Clock: {clock} MHz
- Integrated Non-Volatile Flash: {flash} KB
- High-Speed Static RAM (SRAM): {sram} KB

## 3. Electrical & Power Ratings
- Minimum Recommended Supply Voltage: {v_min} V
- Maximum Recommended Supply Voltage: {v_max} V
- Typical Active Operating Current: {active_ma} mA (at nominal clock)
- Low-Power Sleep / Leakage Current: {sleep_ua} uA (deep standby)

## 4. Hardware Interfaces & Peripheral Buses
- Supported Protocols and Busses: {protocols}

## 5. System Interoperability & Companion ICs
- Verified Compatible Companion Devices: {companions}
- Primary Deployment Target Verticals: {apps}

## 6. Critical Silicon Errata & Engineering Guidelines
{errata}
"""
        filename = f"{part_no.replace('/', '_').replace(' ', '_')}.txt"
        file_path = os.path.join(output_dir, filename)

        with open(file_path, "w", encoding="utf-8") as out_f:
            out_f.write(text_content)

        processed_count += 1

    print(f"Successfully generated {processed_count} structured text units in {output_dir}.")
    return processed_count

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Preprocess Semiconductor Datasheet into GraphRAG input text units")
    parser.add_argument("--source", default="data/raw/microcontroller_soc_datasheet.csv", help="Source CSV file path")
    parser.add_argument("--output", default="graphrag/input", help="Destination directory for text units")
    args = parser.parse_args()

    preprocess(args.source, args.output)
