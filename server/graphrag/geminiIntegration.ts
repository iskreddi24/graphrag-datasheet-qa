import { GoogleGenAI } from '@google/genai';
import { SubgraphContext, CommunityDefinition } from './types.js';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return geminiClient;
}

export async function generateLiveGraphRagAnswer(params: {
  question: string;
  method: 'local' | 'global' | 'drift' | 'basic';
  subgraph?: SubgraphContext;
  communities?: CommunityDefinition[];
  errataWarnings?: string[];
  baselineChunks?: string[];
}): Promise<{ answer: string; model: string }> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please switch to OFFLINE mode or add the key in Settings.');
  }

  const { question, method, subgraph, communities, errataWarnings, baselineChunks } = params;

  let systemPrompt = `You are Microsoft GraphRAG Intelligence Engine for technical semiconductor datasheets.
Your answers must be grounded strictly in the provided Knowledge Graph context and Silicon Errata.
Never hallucinate non-existent specifications or components.
If an entity is absent from the context, explicitly declare that it is not present in the datasheet corpus.
Highlight safety-critical silicon errata, bypass capacitor needs, and voltage limitations.
`;

  let userContext = `### USER QUERY:
${question}

### SEARCH STRATEGY:
${method.toUpperCase()} SEARCH

`;

  if (subgraph && subgraph.nodes.length > 0) {
    userContext += `### GROUNDED KNOWLEDGE GRAPH ENTITIES (${subgraph.nodes.length}):\n`;
    for (const node of subgraph.nodes) {
      userContext += `- [${node.type}] **${node.name}**: ${node.description}\n`;
      if (node.metadata?.errata) {
        userContext += `  * SILICON ERRATA: ${node.metadata.errata}\n`;
      }
    }
    userContext += `\n### GROUNDED TYPED RELATIONSHIPS (${subgraph.edges.length}):\n`;
    for (const edge of subgraph.edges) {
      userContext += `- (${edge.source}) -[${edge.type}]-> (${edge.target}) : ${edge.description}\n`;
    }
    userContext += '\n';
  }

  if (communities && communities.length > 0) {
    userContext += `### LEIDEN COMMUNITY HIERARCHICAL REPORTS (${communities.length}):\n`;
    for (const comm of communities) {
      userContext += `#### Community ${comm.id}: ${comm.title} (Rating: ${comm.rating}/10)\n`;
      userContext += `Summary: ${comm.summary}\n`;
      userContext += `Key Findings:\n${comm.findings.map(f => `  - ${f}`).join('\n')}\n\n`;
    }
  }

  if (errataWarnings && errataWarnings.length > 0) {
    userContext += `### MANDATORY SILICON ERRATA TO HIGHLIGHT:\n`;
    for (const err of errataWarnings) {
      userContext += `- ⚠️ ${err}\n`;
    }
    userContext += '\n';
  }

  if (baselineChunks && baselineChunks.length > 0) {
    userContext += `### RAW TEXT CHUNKS:\n${baselineChunks.join('\n\n')}\n\n`;
  }

  userContext += `Please synthesize a comprehensive, technical, engineering-grade response formatted with markdown headers, bullet points, and explicit electrical ratings.`;

  const targetModels = ['gemini-3.8-flash', 'gemini-3.6-flash'];
  let lastError: any = null;

  for (const modelName of targetModels) {
    try {
      const response = await client.models.generateContent({
        model: modelName,
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userContext}` }] }
        ]
      });

      return {
        answer: response.text || 'No response generated from model.',
        model: modelName
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${modelName} call failed, trying fallback if available:`, err?.message || err);
    }
  }

  console.error('Gemini API execution error across models:', lastError);
  throw new Error(`Gemini Live GraphRAG API failed: ${lastError?.message || String(lastError)}`);
}
