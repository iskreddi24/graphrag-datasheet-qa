# Expected Outputs & Validation Guide

This document defines the expected artifacts, schema contracts, search outputs, and performance metrics across the GraphRAG technical datasheet system.

---

## 1. Indexing Pipeline Artifacts

When `scripts/run_indexing.py` completes, the following artifacts are generated in `graphrag/output/`:

| Artifact File | Format | Record Count | Description |
| :--- | :--- | :--- | :--- |
| `entities.parquet` | Apache Parquet | 61 records | Typed entity dictionary (`COMPONENT`, `MANUFACTURER`, `PROTOCOL`, `CORE_ARCHITECTURE`) with degrees & descriptions |
| `relationships.parquet` | Apache Parquet | 97 records | Directed weighted relational edges with explicit semantic edge types |
| `communities.parquet` | Apache Parquet | 8 clusters | Hierarchical Leiden community membership mappings |
| `community_reports.parquet` | Apache Parquet | 8 reports | Synthesized community findings, summaries, and rating assessments |
| `text_units.parquet` | Apache Parquet | 10 records | Normalized chunk units formatted for indexing |
| `graph_data.json` | JSON | 61 nodes / 97 edges | D3/Web-ready serialized knowledge graph |

---

## 2. Query Engine Expected Outputs

### Scenario A: Local Search (Targeted Component & Pinout Errata)
- **Query**: `"What are the technical specs and companion chips for the ESP32-S3?"`
- **Search Method**: `local`
- **Expected Resolution**:
  - Direct identification of `ESP32-S3-WROOM-1` (Xtensa Dual-Core LX7 @ 240 MHz, 8192 KB Flash, 512 KB SRAM).
  - Explicit multi-hop resolution of companion ICs: `BME688-MEMS` and `ATECC608A-TNGTLS`.
  - Identification of shared buses: `I2C`, `SPI`, `UART`, `USB-OTG`.
  - Recalls critical silicon errata: *"GPIO34 through GPIO39 are input-only and lack internal weak pull-up/pull-down resistors."*
  - Latency: `< 25 ms` (Offline) / `< 1.5s` (Live LLM)

### Scenario B: Global Search (Macro Thematic Synthesis)
- **Query**: `"Compare low-power wireless microcontrollers for battery operation with sleep current under 10 uA."`
- **Search Method**: `global`
- **Expected Resolution**:
  - Traverses pre-computed community reports across wireless clusters.
  - Aggregates `ESP32-S3` (deep sleep 5 µA), `CC2652R` (sleep 0.9 µA), and `STM32U585` (sleep 1.2 µA).
  - Summarizes architectural trade-offs: Cortex-M33 / SimpleLink Cortex-M4F vs Xtensa LX7.
  - Latency: `< 35 ms` (Offline) / `< 2.0s` (Live LLM)

### Scenario C: DRIFT Search (Dynamic Macro-to-Micro Reasoning)
- **Query**: `"What sensors can interface with the BME688 environmental scanner and over which communication buses?"`
- **Search Method**: `drift`
- **Expected Resolution**:
  - Top-down community context identifies the Bio-Telemetry & Low-Power Environmental Sensor cluster.
  - Bottom-up localized traversal identifies `I2C`, `SPI`, and hosts (`ESP32-S3`, `nRF52840`).
  - Follow-up expansion explores VOC/gas sensing dynamics and companion crypto ICs.
  - Latency: `< 30 ms` (Offline) / `< 2.2s` (Live LLM)

---

## 3. Automated Test Suite Metrics
- **Total Test Cases**: 18 tests in `tests/`
- **Coverage Areas**:
  - `test_dataset.py`: Raw CSV validation, column schema, and data types (3 tests)
  - `test_preprocessing.py`: Normalization logic, text unit markdown generation (3 tests)
  - `test_config.py`: Microsoft GraphRAG `settings.yaml` schema compliance (3 tests)
  - `test_artifacts.py`: Parquet columns, row counts, graph JSON structure (4 tests)
  - `test_query_engine.py`: Local, Global, DRIFT, and Basic search accuracy + Hallucination Defense (4 tests)
  - `test_api.py`: HTTP endpoints, status codes, and query contract validation (1 test)
