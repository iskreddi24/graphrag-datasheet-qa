# Microsoft GraphRAG: Live vs. Offline Architecture Comparison

This document details the architectural distinctions, execution paths, and performance characteristics between the **Live Microsoft GraphRAG Mode** and the **Deterministic Offline Mode** in this application.

---

## 1. High-Level Comparison Matrix

| Architectural Dimension | Live Mode (Microsoft GraphRAG + LLM) | Offline Mode (Deterministic Fallback) |
| :--- | :--- | :--- |
| **Primary Driver** | External LLM (Gemini 2.5 / OpenAI GPT-4o-mini) | NetworkX Graph Traversal + Louvain Modularity |
| **Entity Extraction** | Dynamic Few-shot Prompt Gleaning | Structured Deterministic Entity/Relation Parser |
| **Community Clustering** | Hierarchical Leiden Modularity | Louvain Modularity (8 Pre-partitioned Clusters) |
| **Community Summaries** | LLM-synthesized Hierarchical Community Reports | Synthesized Domain Executive Reports |
| **Local Search Engine** | Subgraph context injected into LLM prompt | 1-hop & 2-hop Graph Traversal with Field Synthesizer |
| **Global Search Engine** | Map-reduce across Community Reports via LLM | Rule-based Score/Filter Map-Reduce Aggregator |
| **DRIFT Search Engine** | Macro context + Localized entity hops + LLM branch | Top-down community summary + 2-hop expansion |
| **External Dependency** | Requires active API Key (`GEMINI_API_KEY` / `GRAPHRAG_API_KEY`) | 100% self-contained, zero external network calls |
| **Latency Profile** | ~800ms - 2,500ms (LLM token generation bound) | 5ms - 25ms (in-memory graph lookup) |
| **Storage Artifacts** | `entities.parquet`, `relationships.parquet`, `communities.parquet`, `community_reports.parquet` | Same Parquet schema & `graph_data.json` |

---

## 2. When to Use Each Mode

### Use Live Mode When:
1. **Unstructured Query Phrasing**: When users ask queries with conversational nuance or complex syntactical formulations.
2. **Generative Synthesis**: When comprehensive narrative synthesis across disparate architectural domains is required.
3. **Exploratory Hypothesis Testing**: Generating speculative companion pairings based on electrical impedance matching and protocol timing.

### Use Offline Mode When:
1. **Air-Gapped & Restricted Sandboxes**: When deploying inside private defense, automotive, or industrial subnets without internet egress.
2. **Deterministic Regression Testing**: Guaranteeing byte-for-byte reproducible answers during CI/CD test runs.
3. **Zero Token Cost**: Evaluating graph topology, entity relationships, and D3 physics visualizations without consuming LLM inference tokens.
4. **Sub-20ms Real-Time Lookups**: Embedding datasheet lookup in ultra-low-latency desktop CAD or EDA schematic tooling.

---

## 3. Evaluator Transparency in the UI
To ensure zero ambiguity during technical evaluation:
- The top navigation bar displays a persistent badge: `[LIVE MICROSOFT GRAPHRAG]` (Emerald) or `[OFFLINE DETERMINISTIC]` (Slate/Amber).
- Every query response explicitly stamps `"mode": "live"` or `"mode": "offline"`, accompanied by token counts, latency metrics, and verification flags.
