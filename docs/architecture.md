# System Architecture: GraphRAG Technical Datasheet Intelligence

## 1. Architectural Overview

```
+-------------------------------------------------------------------------------+
|                             CLIENT / BROWSER                                  |
|  - Q&A Query Console (Local, Global, DRIFT, Basic Search)                     |
|  - Interactive D3 Force-Directed Knowledge Graph Visualizer                   |
|  - Datasheet Grid & Silicon Errata Inspector                                  |
|  - Standard RAG vs GraphRAG Side-by-Side Architectural Evaluator              |
|  - Leiden Community Cluster Explorer & Executive Findings                     |
|  - Artifact Inspector & 18-Test Automated Test Suite Runner                   |
+---------------------------------------┬---------------------------------------+
                                        │ HTTP / JSON
                                        ▼
+-------------------------------------------------------------------------------+
|                     EXPRESS & VITE INGRESS LAYER (:3000)                      |
|  - Serves compiled SPA assets and routes API requests                         |
|  - Full-stack TypeScript architecture with real-time GraphRAG query engine    |
|  - Dual-mode execution engine: LIVE (LLM-grounded) vs OFFLINE (Deterministic) |
+---------------------------------------┬---------------------------------------+
                                        │
                                        ▼
+-------------------------------------------------------------------------------+
|                          GRAPHRAG BACKEND SERVICE                             |
|  Endpoints:                                                                   |
|   GET  /api/health            - Pipeline readiness & table status             |
|   GET  /api/dataset/summary   - Schema breakdown & vendor counts              |
|   GET  /api/dataset/sample    - Normalized component records                  |
|   GET  /api/graph/summary     - Node, edge, community counts & density       |
|   GET  /api/graph/entities    - Filterable entity dictionary                  |
|   GET  /api/graph/relationships - Interconnect edge tables                     |
|   GET  /api/graph/communities - Leiden community hierarchy & reports          |
|   POST /api/query             - Dual-mode multi-strategy query execution      |
|   POST /api/indexing/run      - On-demand index generator with stage telemetry|
|   GET  /api/tests/run         - Executes all 18 automated test suites         |
|   GET  /api/artifacts/list    - Lists Parquet and JSON files                  |
+---------------------------------------┬---------------------------------------+
                                        │
                                        ▼
+-------------------------------------------------------------------------------+
|                      GRAPHRAG KNOWLEDGE GRAPH ARTIFACTS                       |
|  Storage: graphrag/output/*.parquet & graph_data.json                         |
|   - entities.parquet          (61 Nodes: Component, Protocol, Arch, Mfg)     |
|   - relationships.parquet     (97 Edges: Manufactured_By, Compatible_With)    |
|   - communities.parquet       (8 Leiden clusters)                             |
|   - community_reports.parquet (Macro executive summaries & key findings)      |
|   - text_units.parquet        (Preprocessed chunk units)                      |
+-------------------------------------------------------------------------------+
```

## 2. Component Design & Responsibilities

### Ingestion & Normalization (`scripts/preprocess_dataset.py`)
- Reads raw CSV `data/raw/microcontroller_soc_datasheet.csv`.
- Normalizes voltage ranges, currents, frequencies, and pin counts.
- Generates structured text units with explicit metadata headings in `graphrag/input/`.

### GraphRAG Indexing Engine (`scripts/run_indexing.py`)
- Dual-mode architecture:
  - **Live Mode**: Executes Microsoft GraphRAG CLI or server-side LLM extraction when credentials are configured.
  - **Offline/Deterministic Mode**: Executes entity-relationship graph synthesis and Louvain/Leiden modularity clustering, generating valid, typed Parquet tables matching Microsoft GraphRAG 3.x schema.

### Query Engine (`server/graphrag/queryEngine.ts`)
- **Local Search**: Identifies focal seed entities from user query, traverses 1-hop and 2-hop edges (e.g. companion chips and protocol buses), and formats entity-grounded answers with errata warnings.
- **Global Search**: Traverses pre-computed community reports, aggregating macro architectural themes via hierarchical map-reduce.
- **DRIFT Search**: Combines top-down community summaries with bottom-up localized graph traversal.
- **Basic Search**: Direct text unit matching without graph traversal (baseline comparison).

### Parquet Artifact Inspector (`scripts/inspect_graph.py`)
- Reads and verifies Parquet files, providing statistical summaries of nodes, degrees, edge weights, and community reports.
