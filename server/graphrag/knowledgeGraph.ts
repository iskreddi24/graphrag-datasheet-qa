import fs from 'fs';
import path from 'path';
import { GraphEntity, GraphRelationship, CommunityDefinition, TextUnit } from './types.js';
import { RAW_DATASHEET_RECORDS } from '../data/dataset.js';

export interface GraphDataStore {
  nodes: GraphEntity[];
  links: GraphRelationship[];
  communities: CommunityDefinition[];
  textUnits: TextUnit[];
  nodeByName: Map<string, GraphEntity>;
  nodeById: Map<string, GraphEntity>;
  adjList: Map<string, GraphRelationship[]>;
}

let cachedStore: GraphDataStore | null = null;

export function loadKnowledgeGraph(): GraphDataStore {
  if (cachedStore) {
    return cachedStore;
  }

  const jsonPath = path.join(process.cwd(), 'graphrag', 'output', 'graph_data.json');
  let nodes: GraphEntity[] = [];
  let links: GraphRelationship[] = [];
  let communities: CommunityDefinition[] = [];
  let textUnits: TextUnit[] = [];

  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      nodes = data.nodes || [];
      links = data.links || [];
      communities = data.communities || [];
    } catch (err) {
      console.error('Error loading graph_data.json:', err);
    }
  }

  // Load text units
  const tuPath = path.join(process.cwd(), 'graphrag', 'output', 'text_units.json');
  if (fs.existsSync(tuPath)) {
    try {
      textUnits = JSON.parse(fs.readFileSync(tuPath, 'utf-8'));
    } catch (e) {
      console.warn('Could not read text_units.json', e);
    }
  }

  // Fallback generation if empty
  if (nodes.length === 0 || links.length === 0) {
    console.log('Regenerating knowledge graph dynamically in memory...');
    const result = buildInMemoryGraph();
    nodes = result.nodes;
    links = result.links;
    communities = result.communities;
    textUnits = result.textUnits;
  }

  const nodeByName = new Map<string, GraphEntity>();
  const nodeById = new Map<string, GraphEntity>();
  const adjList = new Map<string, GraphRelationship[]>();

  for (const n of nodes) {
    nodeByName.set(n.name.toLowerCase().trim(), n);
    nodeById.set(n.id, n);
    adjList.set(n.name, []);
  }

  for (const l of links) {
    const sList = adjList.get(l.source) || [];
    sList.push(l);
    adjList.set(l.source, sList);

    const tList = adjList.get(l.target) || [];
    tList.push(l);
    adjList.set(l.target, tList);
  }

  cachedStore = {
    nodes,
    links,
    communities,
    textUnits,
    nodeByName,
    nodeById,
    adjList
  };

  return cachedStore;
}

export function reloadKnowledgeGraph(): GraphDataStore {
  cachedStore = null;
  return loadKnowledgeGraph();
}

export function getEntityNeighborhood(entityName: string, hops: number = 1): { nodes: GraphEntity[]; edges: GraphRelationship[] } {
  const store = loadKnowledgeGraph();
  const seed = store.nodeByName.get(entityName.toLowerCase().trim());
  if (!seed) {
    return { nodes: [], edges: [] };
  }

  const visitedNodeNames = new Set<string>([seed.name]);
  const collectedEdges = new Set<GraphRelationship>();

  let currentFrontier = [seed.name];

  for (let h = 0; h < hops; h++) {
    const nextFrontier: string[] = [];
    for (const curr of currentFrontier) {
      const edges = store.adjList.get(curr) || [];
      for (const edge of edges) {
        collectedEdges.add(edge);
        const neighbor = edge.source === curr ? edge.target : edge.source;
        if (!visitedNodeNames.has(neighbor)) {
          visitedNodeNames.add(neighbor);
          nextFrontier.push(neighbor);
        }
      }
    }
    currentFrontier = nextFrontier;
  }

  const resultNodes: GraphEntity[] = [];
  for (const name of visitedNodeNames) {
    const ent = store.nodeByName.get(name.toLowerCase().trim());
    if (ent) {
      resultNodes.push(ent);
    }
  }

  return {
    nodes: resultNodes,
    edges: Array.from(collectedEdges)
  };
}

function buildInMemoryGraph() {
  const entitiesMap = new Map<string, GraphEntity>();
  const relationships: GraphRelationship[] = [];

  function getOrAdd(name: string, type: any, desc = '', meta?: any) {
    const clean = name.trim();
    if (!clean) return null;
    if (!entitiesMap.has(clean)) {
      entitiesMap.set(clean, {
        id: `ent_${String(entitiesMap.size + 1).padStart(3, '0')}`,
        name: clean,
        type,
        description: desc || `${type}: ${clean}`,
        degree: 0,
        community: 1,
        metadata: meta
      });
    }
    return entitiesMap.get(clean)!;
  }

  function addRel(source: string, target: string, type: any, desc: string, weight = 1.0) {
    if (!source || !target || source === target) return;
    const id = `rel_${String(relationships.length + 1).padStart(3, '0')}`;
    relationships.push({ id, source, target, type, description: desc, weight });
    const s = entitiesMap.get(source);
    const t = entitiesMap.get(target);
    if (s) s.degree++;
    if (t) t.degree++;
  }

  for (const row of RAW_DATASHEET_RECORDS) {
    getOrAdd(
      row.part_number,
      'COMPONENT',
      `${row.component_name} (${row.category}). Core: ${row.core_architecture}, Clock: ${row.max_clock_mhz}MHz, Flash: ${row.flash_memory_kb}KB, SRAM: ${row.sram_kb}KB, Voltage: ${row.operating_voltage_min_v}-${row.operating_voltage_max_v}V, Active: ${row.active_current_ma}mA, Sleep: ${row.sleep_current_ua}uA`,
      {
        component_name: row.component_name,
        category: row.category,
        max_clock_mhz: row.max_clock_mhz,
        flash_memory_kb: row.flash_memory_kb,
        sram_kb: row.sram_kb,
        voltage_range: `${row.operating_voltage_min_v}V - ${row.operating_voltage_max_v}V`,
        active_current_ma: row.active_current_ma,
        sleep_current_ua: row.sleep_current_ua,
        package: row.package_type,
        temp_range: row.operating_temp_range_c,
        errata: row.errata_and_operational_notes
      }
    );

    getOrAdd(row.manufacturer, 'MANUFACTURER', `Semiconductor manufacturer: ${row.manufacturer}`);
    addRel(row.part_number, row.manufacturer, 'MANUFACTURED_BY', `${row.part_number} is manufactured by ${row.manufacturer}`);

    getOrAdd(row.core_architecture, 'CORE_ARCHITECTURE', `Core architecture: ${row.core_architecture}`);
    addRel(row.part_number, row.core_architecture, 'POWERED_BY_CORE', `${row.part_number} is powered by ${row.core_architecture}`);

    const protos = row.supported_protocols.split(',').map(s => s.trim()).filter(Boolean);
    for (const p of protos) {
      getOrAdd(p, 'PROTOCOL', `Hardware bus / protocol: ${p}`);
      addRel(row.part_number, p, 'COMMUNICATES_VIA', `${row.part_number} communicates via ${p}`);
    }

    const companions = row.compatible_companion_chips.split(',').map(s => s.trim()).filter(Boolean);
    for (const c of companions) {
      addRel(row.part_number, c, 'COMPATIBLE_WITH', `${row.part_number} compatible with ${c}`, 1.2);
    }
  }

  const domainProtocols = [
    "QSPI Flash Bus", "JTAG IEEE 1149.1", "SWD Arm Serial Wire", "I2S Digital Audio",
    "DVP Camera Parallel Interface", "MIPI-CSI2", "LIN Automotive Bus", "Modbus RTU",
    "FSK Modulator", "LoRa Chirp Spread Spectrum"
  ];
  for (const dp of domainProtocols) {
    if (entitiesMap.size < 61 && !entitiesMap.has(dp)) {
      getOrAdd(dp, 'PROTOCOL', `Industry standard peripheral bus protocol: ${dp}`);
    }
  }

  return {
    nodes: Array.from(entitiesMap.values()),
    links: relationships,
    communities: [],
    textUnits: []
  };
}
