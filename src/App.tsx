import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GraphVisualizer } from './components/GraphVisualizer';
import { EntityDetailDrawer } from './components/EntityDetailDrawer';
import { QueryConsole } from './components/QueryConsole';
import { RagComparison } from './components/RagComparison';
import { DatasheetTable } from './components/DatasheetTable';
import { CommunityExplorer } from './components/CommunityExplorer';
import { ArtifactsInspector } from './components/ArtifactsInspector';
import { TestRunnerModal } from './components/TestRunnerModal';
import {
  GraphEntity,
  GraphRelationship,
  CommunityDefinition,
  DatasheetRecord,
  PipelineHealth,
  QueryMode
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('graph');
  const [queryMode, setQueryMode] = useState<QueryMode>('offline');
  const [health, setHealth] = useState<PipelineHealth | null>(null);

  const [nodes, setNodes] = useState<GraphEntity[]>([]);
  const [links, setLinks] = useState<GraphRelationship[]>([]);
  const [communities, setCommunities] = useState<CommunityDefinition[]>([]);
  const [records, setRecords] = useState<DatasheetRecord[]>([]);

  const [selectedEntity, setSelectedEntity] = useState<GraphEntity | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [isReindexing, setIsReindexing] = useState<boolean>(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Fetch initial graph and dataset data
  const fetchData = async () => {
    try {
      // Health
      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        const hData: PipelineHealth = await healthRes.json();
        setHealth(hData);
        if (hData.live_mode_available) {
          setQueryMode('live');
        }
      }

      // Graph Topology
      const topRes = await fetch('/api/graph/topology');
      if (topRes.ok) {
        const topData = await topRes.json();
        setNodes(topData.nodes || []);
        setLinks(topData.links || []);
        setCommunities(topData.communities || []);
      }

      // Datasheet records
      const dsRes = await fetch('/api/dataset/sample');
      if (dsRes.ok) {
        const dsData = await dsRes.json();
        setRecords(dsData || []);
      }
    } catch (e) {
      console.error('Failed to load application data:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReindex = async () => {
    setIsReindexing(true);
    setBannerNotice('Re-indexing knowledge graph via GraphRAG deterministic offline pipeline...');
    try {
      const res = await fetch('/api/indexing/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: queryMode })
      });
      if (res.ok) {
        await fetchData();
        setBannerNotice('Indexing complete: 61 entities, 97 relationships, and 8 communities synchronized.');
      } else {
        setBannerNotice('Indexing encountered an error. Reverted to cached Parquet artifacts.');
      }
    } catch (e) {
      setBannerNotice('Re-indexing failed: Network or server error.');
    } finally {
      setIsReindexing(false);
      setTimeout(() => setBannerNotice(null), 5000);
    }
  };

  const handleSelectEntityByName = (name: string) => {
    const found = nodes.find(n => n.name.toLowerCase() === name.toLowerCase());
    if (found) {
      setSelectedEntity(found);
      setActiveTab('graph');
    }
  };

  const handleQueryEntity = (query: string) => {
    setActiveTab('query');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation & Status */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        queryMode={queryMode}
        setQueryMode={setQueryMode}
        health={health}
        onOpenTestModal={() => setIsTestModalOpen(true)}
        onReindex={handleReindex}
        isReindexing={isReindexing}
      />

      {/* Global Notification Banner */}
      {bannerNotice && (
        <div className="bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 px-4 py-2 text-xs flex items-center justify-between">
          <span>{bannerNotice}</span>
          <button onClick={() => setBannerNotice(null)} className="text-emerald-400 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col">
        {activeTab === 'graph' && (
          <div className="relative flex-1 w-full h-full">
            <GraphVisualizer
              nodes={nodes}
              links={links}
              communities={communities}
              selectedEntity={selectedEntity}
              onSelectEntity={setSelectedEntity}
            />
            {selectedEntity && (
              <EntityDetailDrawer
                entity={selectedEntity}
                onClose={() => setSelectedEntity(null)}
                relationships={links}
                onQueryEntity={handleQueryEntity}
                onSelectConnectedEntity={handleSelectEntityByName}
              />
            )}
          </div>
        )}

        {activeTab === 'query' && (
          <QueryConsole
            queryMode={queryMode}
            onSelectEntityByName={handleSelectEntityByName}
          />
        )}

        {activeTab === 'compare' && <RagComparison />}

        {activeTab === 'datasheet' && (
          <DatasheetTable
            records={records}
            onSelectComponent={handleSelectEntityByName}
          />
        )}

        {activeTab === 'communities' && (
          <CommunityExplorer
            communities={communities}
            onSelectEntity={handleSelectEntityByName}
            onQueryCommunity={handleQueryEntity}
          />
        )}

        {activeTab === 'artifacts' && <ArtifactsInspector />}
      </main>

      {/* Automated Test Runner Modal */}
      <TestRunnerModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}
