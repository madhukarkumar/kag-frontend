'use client';

import { useEffect, useState } from 'react';
import { Spinner } from '../../components/Spinner';
import KnowledgeGraph from '../../components/KnowledgeGraph';
import NavHeader from '@/components/NavHeader';
import { api } from '../../utils/api';

interface DocumentStats {
  doc_id: number;
  title: string;
  total_chunks: number;
  total_entities: number;
  total_relationships: number;
  created_at: string;
  file_type: string;
  status: string;
}

interface KBStats {
  total_documents: number;
  total_chunks: number;
  total_entities: number;
  total_relationships: number;
  documents: DocumentStats[];
  last_updated: string;
}

interface KBDataResponse {
  stats: KBStats;
  execution_time: number;
}

export default function KBPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<KBStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.get<KBDataResponse>('kbData');
        setData(result.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!data) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <NavHeader />
      <div className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Knowledge Base Statistics</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Documents</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{data.total_documents}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Chunks</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{data.total_chunks}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Entities</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{data.total_entities}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Relationships</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{data.total_relationships}</p>
            </div>
          </div>
        </section>

        {/* Graph Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Knowledge Graph</h2>
          <div className="bg-gray-50 rounded-xl p-4 h-[800px] overflow-hidden">
            <KnowledgeGraph />
          </div>
        </section>
        
        {/* Documents Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Documents</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chunks
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entities
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Relationships
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.documents.map((doc) => (
                    <tr key={doc.doc_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {doc.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.file_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.total_chunks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.total_entities}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.total_relationships}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="text-sm text-gray-500 text-right">
          Last updated: {new Date(data.last_updated).toLocaleString()}
        </div>
      </div>
    </main>
  );
}
