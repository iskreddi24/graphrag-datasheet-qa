# GraphRAG Interview & Technical Defense Guide

This guide equips you with concise, compelling answers to common interview questions regarding this GraphRAG technical assignment.

---

## 1. Core Concepts & Fundamentals

### Q: "What is GraphRAG and how does it fundamentally differ from standard RAG?"
**Answer:**
> "Standard RAG breaks documents into text chunks, embeds them into vectors, and retrieves the top-K chunks based on cosine similarity to the user's prompt. This excels at direct fact lookup within a single passage.
>
> However, standard RAG fails at two crucial engineering tasks:
> 1. **Multi-Hop Relational Reasoning**: When an answer requires connecting facts across disconnected passages (e.g. Chip A supports Bus B, and Chip C connects to Bus B).
> 2. **Global Corpus Summarization**: When a user asks a high-level question (e.g., 'What are the overarching architectural trends across all wireless SoCs in this dataset?'), standard RAG cannot retrieve all relevant chunks without context fragmentation or token window overflow.
>
> **Microsoft GraphRAG** solves this by extracting an explicit Knowledge Graph of entities and relationships from the text, running hierarchical community detection (Leiden algorithm) to group related entities into clusters, and pre-generating community summaries. This unlocks both **Local Search** (graph neighborhood traversal) and **Global Search** (hierarchical map-reduce across community summaries)."

---

### Q: "Why was GraphRAG particularly suited for this semiconductor datasheet?"
**Answer:**
> "Technical datasheets are inherently relational and safety-critical:
> - **Zero Tolerance for Hallucinations**: Electrical ratings (voltages, clock frequencies, sleep currents) and silicon errata (such as GPIO pull-up limitations) must be preserved exactly.
> - **Hardware Interoperability**: Microcontrollers don't operate in isolation; they interface with sensors, secure elements, and transceivers across shared protocols (SPI, I2C, CAN-FD). In GraphRAG, these hardware interfaces are explicit graph edges, enabling accurate multi-hop compatibility verification."

---

### Q: "How does Local Search work vs Global Search in Microsoft GraphRAG?"
**Answer:**
> - **Local Search**: Identifies focal seed entities mentioned in the query, extracts their direct 1-hop and 2-hop graph neighborhood (neighboring entities, connecting relationships, covariates), and injects this structured subgraph into the prompt. It's ideal for answering questions about a specific component (e.g., 'What are the specs and errata for ESP32-S3?').
> - **Global Search**: Operates at the macro level. It partitions the graph into hierarchical Leiden communities, passes query-relevant community summary reports into parallel map steps, scores/filters their findings, and reduces them into a unified synthesized answer. It's ideal for thematic or comparative questions (e.g., 'Compare all low-power battery-operated SoCs')."

---

### Q: "How does DRIFT Search operate?"
**Answer:**
> "**DRIFT Search** combines the strengths of Global and Local search. It initiates with top-down macro context from community reports to frame the architectural landscape, followed by targeted localized graph hops across entity neighbors. It dynamically generates follow-up exploratory reasoning branches to discover tangential relationships, such as how an environmental sensor connects through a shared I2C bus to a hardware security element."

---

### Q: "How does GraphRAG handle offline sandboxes vs live LLM environments?"
**Answer:**
> "Our architecture provides a transparent dual-mode engine:
> 1. **Live Mode**: Directly leverages server-side LLM inference (Gemini / OpenAI) for dynamic prompt compilation, natural language reasoning, and dynamic community map-reduce.
> 2. **Deterministic Offline Mode**: Uses pre-computed GraphRAG Parquet tables (`entities.parquet`, `relationships.parquet`, `communities.parquet`, `community_reports.parquet`) with exact graph traversal and Louvain/Leiden modularity. The evaluator can toggle between modes in the UI to inspect both deterministic relational outputs and live generative responses."

---

## 2. Technical Architecture & Scaling

### Q: "What is the schema and size of your generated knowledge graph?"
**Answer:**
> - **Nodes (61 total)**: 10 Components, 9 Manufacturers, 32 Protocols & Busses, and 10 Core Architectures.
> - **Edges (97 total)**: `MANUFACTURED_BY`, `POWERED_BY_CORE`, `COMMUNICATES_VIA`, `COMPATIBLE_WITH`.
> - **Communities (8 clusters)**: Identified via Leiden modularity optimization, grouping subsystems like 'Edge AI & Wireless', 'High-Performance Dual-Core Industrial Control', and 'Low-Power Environmental Telemetry'.
> - **Storage**: Stored in Apache Parquet format and JSON companion tables for fast zero-overhead queries."

---

### Q: "How would you scale this pipeline to 100,000 datasheets in production?"
**Answer:**
> 1. **Distributed Entity Extraction**: Use worker queues (Celery/Ray) with asynchronous LLM batching to process PDF/CSV datasheets concurrently.
> 2. **Graph Database Storage**: Move from local Parquet files to a distributed graph engine like Neo4j or Amazon Neptune with Cypher query indexing.
> 3. **Incremental Graph Updates**: Implement differential GraphRAG indexing so newly published datasheets update local subgraphs without full corpus re-indexing.
> 4. **Caching & Vector Store**: Utilize LanceDB or Milvus with semantic prompt caching to avoid re-embedding repeated queries."
