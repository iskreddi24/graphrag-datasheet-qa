# Microsoft GraphRAG Semiconductor Datasheet Intelligence

A production-grade, end-to-end **Retrieval-Augmented Generation (RAG)** pipeline utilizing **Microsoft GraphRAG** to extract, index, and query technical semiconductor datasheets covering microcontrollers (MCUs), wireless SoCs, MEMS sensors, and hardware security elements.

---

## Key Capabilities

1. **Grounded Entity-Relationship Knowledge Graph**:
   - 61 Entities: Components, Manufacturers, Hardware Communication Protocols, Core Architectures.
   - 97 Typed Relational Edges: `MANUFACTURED_BY`, `POWERED_BY_CORE`, `COMMUNICATES_VIA`, `COMPATIBLE_WITH`.
   - 8 Leiden Community Clusters with synthesized hierarchical reports.
2. **Multi-Strategy Search Pipeline**:
   - **Local Search**: 1-hop and 2-hop neighborhood exploration for targeted component pinouts, clock speeds, and silicon errata.
   - **Global Search**: Hierarchical community map-reduce across subsystem clusters for comparative analysis.
   - **DRIFT Search**: Top-down macro context combined with localized graph hops and exploratory reasoning.
   - **Basic Search**: Classical vector chunk matching baseline for evaluation.
3. **Interactive D3 Force-Directed Graph Visualizer**:
   - Real-time physics canvas, node filtering, drag-and-zoom, degree sizing, and detailed entity inspection drawer.
4. **Verified Parquet Artifact Storage**:
   - Fully compatible with Microsoft GraphRAG 3.x schema (`entities.parquet`, `relationships.parquet`, `communities.parquet`, `community_reports.parquet`).
5. **Comprehensive Automated Test Suite**:
   - 18 passing tests spanning dataset normalization, GraphRAG configuration, Parquet schema verification, search engine retrieval, and HTTP endpoints.

---

## Quickstart

### 1. Preprocessing Datasheet
```bash
python3 scripts/preprocess_dataset.py --source data/raw/microcontroller_soc_datasheet.csv
```

### 2. Building GraphRAG Index
```bash
python3 scripts/run_indexing.py --mode offline
```
*(To run live with LLM credentials, export `GRAPHRAG_API_KEY=your_key` and run `--mode live`)*

### 3. Inspecting Parquet Graph Artifacts
```bash
python3 scripts/inspect_graph.py
```

### 4. Running Automated Tests
```bash
python3 -m unittest discover tests
# or
python3 scripts/test_pipeline.py
```

### 5. Starting Backend & UI
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## Technical Documentation
- **[Technical Approach](docs/approach.md)**
- **[System Architecture](docs/architecture.md)**
- **[Expected Outputs](docs/expected-output.md)**
- **[Interview Defense Guide](docs/interview-guide.md)**
- **[Live vs Offline Architecture](docs/live-vs-offline.md)**
- **[Datasheet Analysis Report](DATASET_ANALYSIS.md)**
