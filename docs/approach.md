# GraphRAG Datasheet Intelligence: Technical Approach

## 1. Executive Summary
This project implements an end-to-end **Retrieval-Augmented Generation (RAG)** pipeline powered by **Microsoft GraphRAG** on an industrial technical datasheet covering microcontrollers (MCUs), wireless Systems-on-Chip (SoCs), MEMS environmental sensors, and hardware cryptographic companions.

Unlike generic text corpora, technical semiconductor datasheets require:
1. **High Electrical Precision**: Zero tolerance for hallucinating operating voltage ratings, maximum clock frequencies, and pinouts.
2. **Multi-Hop Relational Traversal**: A microcontroller (e.g., `ESP32-S3`) links to companion environmental sensors (`BME688-MEMS`) and secure elements (`ATECC608A-TNGTLS`) via shared hardware communication buses (`I2C`, `SPI`, `UART`).
3. **Safety-Critical Silicon Errata Recall**: Hardware quirks, pin limitations (e.g., lack of internal pull-up resistors on GPIO34..39), and decoupling capacitor recommendations must never be omitted.

Traditional chunk-and-vector RAG fails on these requirements due to semantic chunk boundaries and lack of explicit relational topology. GraphRAG overcomes these limits by converting the datasheet into an explicit entity-relationship knowledge graph with hierarchical Leiden community clustering.

---

## 2. Datasheet Schema & Domain Identification
The provided ground-truth dataset (`data/raw/microcontroller_soc_datasheet.csv`) contains 10 semiconductor parts spanning 18 attributes:
- **Part Identifiers**: `part_number`, `component_name`, `manufacturer`
- **Core Processing Architecture**: `core_architecture`, `max_clock_mhz`
- **Memory Subsystems**: `flash_memory_kb`, `sram_kb`
- **Electrical & Power Characteristics**: `operating_voltage_min_v`, `operating_voltage_max_v`, `active_current_ma`, `sleep_current_ua`, `operating_temp_range_c`
- **Interfaces & Footprints**: `supported_protocols`, `package_type`, `pin_count`
- **System Integration**: `compatible_companion_chips`, `errata_and_operational_notes`, `target_applications`

---

## 3. The 4-Stage GraphRAG Pipeline

```
[Datasheet CSV] ──> [Normalization & Preprocessing]
                          │
                          ▼
            [Text Units & Graph Extraction]
                          │
                          ▼
             [Entity-Relationship Graph]
       (61 Entities, 97 Typed Edges, 4 Core Types)
                          │
                          ▼
       [Hierarchical Leiden Community Detection]
               (8 Cohesive System Clusters)
                          │
                          ▼
            [Hierarchical Community Reports]
                          │
    ┌─────────────────────┴─────────────────────┐
    ▼                                           ▼
[Local Search]                             [Global Search]
(Focal Entity + 1-Hop Neighbors)         (Map-Reduce over Communities)
```

### Stage 1: Preprocessing & Text Unit Generation
- Deduplication, numeric casting, whitespace stripping, and canonical protocol normalization.
- Generation of deterministic text units formatted with explicit technical metadata headers for indexing in `graphrag/input/`.

### Stage 2: Entity & Relationship Extraction
- Entities: `COMPONENT`, `MANUFACTURER`, `PROTOCOL`, `CORE_ARCHITECTURE`
- Typed Edges: `MANUFACTURED_BY`, `POWERED_BY_CORE`, `COMMUNICATES_VIA`, `COMPATIBLE_WITH`
- Node degree and frequency computation.

### Stage 3: Community Detection & Hierarchical Summarization
- Network partition via modularity maximization (Leiden/Louvain algorithm).
- Generates 8 distinct architectural clusters (e.g., Wireless SoCs & Edge AI, Bio-Telemetry & Low-Power Sensors, High-Performance Control).
- Each community generates an executive report with findings, ranks, and rating explanations.

### Stage 4: Dual-Perspective Query Engines
- **Local Search**: Answers targeted component queries (e.g., "What are ESP32-S3's power ratings and companion chips?") by traversing the immediate 1-hop and 2-hop graph neighborhood.
- **Global Search**: Answers macro-level architectural questions (e.g., "What wireless architectures in the dataset support battery operation under 10 uA?") by synthesizing across community reports.
- **DRIFT Search**: Combines top-down macro context with localized entity hops and follow-up exploratory reasoning branches.
- **Basic Search**: Classical vector chunk retrieval baseline used to demonstrate GraphRAG's superiority in multi-hop accuracy and errata preservation.
