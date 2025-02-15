'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Spinner } from '@/components/Spinner';
import { fetchWithAuth } from '../utils/api';
import { ForceGraphMethods } from 'react-force-graph-2d';

const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d'),
  { ssr: false }
);

interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    category: string;
    val: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    value: number;
  }>;
}

interface GraphResponse {
  data: GraphData;
  categories: string[];
}

export default function KnowledgeGraph() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const fgRef = useRef<ForceGraphMethods>(null!);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetchWithAuth('/graph-data');
        if (!response.ok) {
          throw new Error('Failed to fetch graph data');
        }
        const data: GraphResponse = await response.json();
        setGraphData(data.data);
        setCategories(data.categories);
        setSelectedCategories(new Set(data.categories));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error: {error}
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="text-gray-500 text-center p-4">
        No graph data available
      </div>
    );
  }

  const filteredData = {
    nodes: graphData.nodes.filter(node => selectedCategories.has(node.category)),
    links: graphData.links.filter(link => {
      const sourceNode = graphData.nodes.find(n => n.id === link.source);
      const targetNode = graphData.nodes.find(n => n.id === link.target);
      return sourceNode && targetNode && 
             selectedCategories.has(sourceNode.category) && 
             selectedCategories.has(targetNode.category);
    })
  };

  return (
    <div className="w-full h-[600px] relative">
      <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-medium mb-2">Filter by Category</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedCategories.has(category)}
                onChange={() => {
                  const newSelected = new Set(selectedCategories);
                  if (newSelected.has(category)) {
                    newSelected.delete(category);
                  } else {
                    newSelected.add(category);
                  }
                  setSelectedCategories(newSelected);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={filteredData}
        nodeLabel="name"
        nodeColor={node => {
          const n = node as GraphData['nodes'][0];
          return selectedCategories.has(n.category) ? '#4299E1' : '#E2E8F0';
        }}
        linkColor={() => '#CBD5E0'}
        nodeRelSize={6}
        linkWidth={1}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const n = node as GraphData['nodes'][0];
          const label = n.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = selectedCategories.has(n.category) ? '#2D3748' : '#A0AEC0';
          ctx.fillText(label, node.x!, node.y!);
        }}
      />
    </div>
  );
}
