import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { RAW_DATASHEET_RECORDS } from './server/data/dataset.js';
import { loadKnowledgeGraph, reloadKnowledgeGraph } from './server/graphrag/knowledgeGraph.js';
import { executeQuery, compareRagApproaches } from './server/graphrag/queryEngine.js';
import { runAutomatedTests } from './server/graphrag/testRunner.js';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Knowledge Graph
  loadKnowledgeGraph();

  // -------------------------------------------------------------
  // API ROUTES (MUST COME FIRST BEFORE VITE MIDDLEWARE)
  // -------------------------------------------------------------

  // 1. Health & Pipeline Readiness
  app.get('/api/health', (req, res) => {
    const store = loadKnowledgeGraph();
    res.json({
      status: 'ok',
      pipeline: 'Microsoft GraphRAG Datasheet Intelligence',
      version: '3.1.2',
      live_mode_available: Boolean(process.env.GEMINI_API_KEY || process.env.GRAPHRAG_API_KEY),
      active_mode: (process.env.GEMINI_API_KEY || process.env.GRAPHRAG_API_KEY) ? 'live' : 'offline',
      stats: {
        entities: store.nodes.length,
        relationships: store.links.length,
        communities: store.communities.length,
        text_units: store.textUnits.length || 10
      }
    });
  });

  // 2. Raw Dataset Summary
  app.get('/api/dataset/summary', (req, res) => {
    const records = RAW_DATASHEET_RECORDS;
    const categories: Record<string, number> = {};
    const manufacturers = new Set<string>();

    for (const r of records) {
      categories[r.category] = (categories[r.category] || 0) + 1;
      manufacturers.add(r.manufacturer);
    }

    res.json({
      total_records: records.length,
      columns_count: 18,
      unique_manufacturers: Array.from(manufacturers),
      category_breakdown: categories,
      dataset_file: 'data/raw/microcontroller_soc_datasheet.csv'
    });
  });

  // 3. Raw Datasheet Sample
  app.get('/api/dataset/sample', (req, res) => {
    res.json(RAW_DATASHEET_RECORDS);
  });

  // 4. Graph Summary
  app.get('/api/graph/summary', (req, res) => {
    const store = loadKnowledgeGraph();
    const typeCounts: Record<string, number> = {};
    for (const n of store.nodes) {
      typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
    }

    const relCounts: Record<string, number> = {};
    for (const l of store.links) {
      relCounts[l.type] = (relCounts[l.type] || 0) + 1;
    }

    res.json({
      total_nodes: store.nodes.length,
      total_edges: store.links.length,
      total_communities: store.communities.length,
      node_types: typeCounts,
      edge_types: relCounts,
      density: ((2 * store.links.length) / (store.nodes.length * (store.nodes.length - 1))).toFixed(4)
    });
  });

  // 5. Entities List (with filtering)
  app.get('/api/graph/entities', (req, res) => {
    const store = loadKnowledgeGraph();
    const typeFilter = req.query.type as string;
    const search = (req.query.search as string || '').toLowerCase().trim();

    let list = store.nodes;
    if (typeFilter && typeFilter !== 'ALL') {
      list = list.filter(n => n.type === typeFilter);
    }
    if (search) {
      list = list.filter(n => n.name.toLowerCase().includes(search) || n.description.toLowerCase().includes(search));
    }

    res.json(list);
  });

  // 6. Relationships List
  app.get('/api/graph/relationships', (req, res) => {
    const store = loadKnowledgeGraph();
    const typeFilter = req.query.type as string;
    let list = store.links;
    if (typeFilter && typeFilter !== 'ALL') {
      list = list.filter(l => l.type === typeFilter);
    }
    res.json(list);
  });

  // 7. Communities & Hierarchical Reports
  app.get('/api/graph/communities', (req, res) => {
    const store = loadKnowledgeGraph();
    res.json(store.communities);
  });

  // 8. Full Graph Topology (for D3 visualizer)
  app.get('/api/graph/topology', (req, res) => {
    const store = loadKnowledgeGraph();
    res.json({
      nodes: store.nodes,
      links: store.links,
      communities: store.communities
    });
  });

  // 9. Multi-Strategy Search Execution (Local, Global, DRIFT, Basic)
  app.post('/api/query', async (req, res) => {
    try {
      const response = await executeQuery(req.body);
      res.json(response);
    } catch (err: any) {
      console.error('Query execution error:', err);
      res.status(500).json({
        error: err.message || 'Internal query execution error',
        verified: false
      });
    }
  });

  // 10. Standard RAG vs GraphRAG Side-by-Side Evaluator
  app.post('/api/compare-rag', (req, res) => {
    try {
      const question = req.body.question || 'What are the specs and companion chips for the ESP32-S3?';
      const comparison = compareRagApproaches(question);
      res.json(comparison);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 11. Run Automated Test Suite (18 tests)
  app.get('/api/tests/run', async (req, res) => {
    try {
      const report = await runAutomatedTests();
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 12. Run Indexing Pipeline On-Demand
  app.post('/api/indexing/run', async (req, res) => {
    const mode = req.body.mode === 'live' ? 'live' : 'offline';
    try {
      const { stdout, stderr } = await execPromise(`python3 scripts/run_indexing.py --mode ${mode}`);
      reloadKnowledgeGraph();
      const updatedStore = loadKnowledgeGraph();
      res.json({
        success: true,
        mode,
        stdout,
        stderr,
        nodes_indexed: updatedStore.nodes.length,
        edges_indexed: updatedStore.links.length,
        communities_indexed: updatedStore.communities.length
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
        stdout: err.stdout,
        stderr: err.stderr
      });
    }
  });

  // 13. Artifacts List & Inspection
  app.get('/api/artifacts/list', (req, res) => {
    const outputDir = path.join(process.cwd(), 'graphrag', 'output');
    const files = [
      'entities.parquet',
      'relationships.parquet',
      'communities.parquet',
      'community_reports.parquet',
      'text_units.parquet',
      'graph_data.json'
    ];

    const fileDetails = files.map(f => {
      const p = path.join(outputDir, f);
      const exists = fs.existsSync(p);
      const size = exists ? fs.statSync(p).size : 0;
      return {
        name: f,
        format: f.endsWith('.parquet') ? 'Apache Parquet' : 'JSON',
        exists,
        size_bytes: size,
        size_human: `${(size / 1024).toFixed(1)} KB`
      };
    });

    res.json(fileDetails);
  });

  // -------------------------------------------------------------
  // VITE MIDDLEWARE SETUP
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Microsoft GraphRAG Semiconductor Intelligence Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
