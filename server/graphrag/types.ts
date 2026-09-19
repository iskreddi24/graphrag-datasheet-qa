export type EntityType = 'COMPONENT' | 'MANUFACTURER' | 'PROTOCOL' | 'CORE_ARCHITECTURE';

export interface EntityMetadata {
  component_name?: string;
  category?: string;
  max_clock_mhz?: number;
  flash_memory_kb?: number;
  sram_kb?: number;
  voltage_range?: string;
  active_current_ma?: number;
  sleep_current_ua?: number;
  package?: string;
  temp_range?: string;
  errata?: string;
  [key: string]: any;
}

export interface GraphEntity {
  id: string;
  name: string;
  type: EntityType;
  description: string;
  degree: number;
  community: number;
  metadata?: EntityMetadata;
}

export type RelationshipType = 'MANUFACTURED_BY' | 'POWERED_BY_CORE' | 'COMMUNICATES_VIA' | 'COMPATIBLE_WITH';

export interface GraphRelationship {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  description: string;
  weight: number;
}

export interface CommunityDefinition {
  id: number;
  title: string;
  entities: string[];
  summary: string;
  findings: string[];
  rating: number;
  rating_explanation: string;
}

export interface TextUnit {
  id: string;
  text: string;
  entity_ids: string[];
  document_id: string;
}

export type QuerySearchMethod = 'local' | 'global' | 'drift' | 'basic';
export type QueryMode = 'live' | 'offline';

export interface SubgraphContext {
  nodes: GraphEntity[];
  edges: GraphRelationship[];
}

export interface QueryRequest {
  question: string;
  method?: QuerySearchMethod;
  mode?: QueryMode;
}

export interface QueryResponse {
  answer: string;
  mode: QueryMode;
  method: QuerySearchMethod;
  verified: boolean;
  latency_ms: number;
  grounding_confidence: number;
  subgraph: SubgraphContext;
  community_reports_cited: number[];
  errata_warnings: string[];
  reasoning_trace?: string[];
  tokens_evaluated?: number;
}

export interface RagComparisonResult {
  question: string;
  standard_rag: {
    answer: string;
    retrieved_chunks: string[];
    multi_hop_captured: boolean;
    errata_recalled: boolean;
    latency_ms: number;
    limitations: string[];
  };
  graph_rag: {
    answer: string;
    subgraph: SubgraphContext;
    communities_mapped: string[];
    multi_hop_captured: boolean;
    errata_recalled: boolean;
    latency_ms: number;
    advantages: string[];
  };
}

export interface DatasheetRecord {
  part_number: string;
  component_name: string;
  category: string;
  manufacturer: string;
  core_architecture: string;
  max_clock_mhz: number;
  flash_memory_kb: number;
  sram_kb: number;
  operating_voltage_min_v: number;
  operating_voltage_max_v: number;
  active_current_ma: number;
  sleep_current_ua: number;
  supported_protocols: string;
  package_type: string;
  operating_temp_range_c: string;
  compatible_companion_chips: string;
  target_applications: string;
  errata_and_operational_notes: string;
}
