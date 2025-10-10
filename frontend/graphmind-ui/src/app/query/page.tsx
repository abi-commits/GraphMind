'use client';

import { QueryInterface } from '@/components/query/QueryInterface';
import { KnowledgeGraphVisualization } from '@/components/knowledge-graph/KnowledgeGraphVisualization';
import { useQuery } from '@/hooks/useQuery';
import { Network } from 'lucide-react';

export default function QueryPage() {
  const { data } = useQuery();

  return (
    <div className="py-12 px-4 sm:px-8 lg:px-16 2xl:px-0 max-w-[1600px] mx-auto">
      <section className="max-w-7xl mx-auto mb-16">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold gradient-text drop-shadow-glow mb-4">Query Your Knowledge Base</h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            Ask questions and explore the knowledge graph extracted from your documents.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Query Interface */}
          <div className="relative z-10">
            <QueryInterface />
          </div>
          {/* Right Column - Knowledge Graph Visualization */}
          <div className="relative z-10">
            {data?.visualization_data ? (
              <KnowledgeGraphVisualization data={data.visualization_data} />
            ) : (
              <div className="bg-card/80 rounded-2xl border border-border p-10 text-center shadow-glow-lg flex flex-col items-center justify-center min-h-[400px]">
                <div className="bg-gradient-to-br from-primary-500/20 to-secondary-500/10 p-6 rounded-full w-20 h-20 mb-6 flex items-center justify-center animate-float">
                  <Network className="h-10 w-10 text-primary drop-shadow-glow" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2 gradient-text drop-shadow-glow">
                  No Graph to Display
                </h3>
                <p className="text-base text-muted-foreground font-medium">
                  Submit a query to see the knowledge graph visualization.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}