import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface QueryResult {
  id: number;
  title: string;
  excerpt: string;
  source: string;
  page: number;
  relevance: number;
}

export const useQuery = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const { toast } = useToast();

  const handleQuery = async (documentsCount: number) => {
    if (!query.trim()) {
      toast({
        title: "⚠️ Empty Query",
        description: "Please enter a question to search your documents.",
        variant: "destructive"
      });
      return;
    }

    if (documentsCount === 0) {
      toast({
        title: "📄 No Documents",
        description: "Upload some documents first to start querying!",
        variant: "destructive"
      });
      return;
    }

    setIsQuerying(true);
    toast({
      title: "🔍 Searching...",
      description: "Analyzing your documents for relevant information.",
    });

    // Simulate API call
    setTimeout(() => {
      const mockResults: QueryResult[] = [
        { id: 1, title: 'Neural Networks Definition', excerpt: 'Neural networks are computational models inspired by biological neural networks...', source: 'research-paper.pdf', page: 5, relevance: 95 },
        { id: 2, title: 'Applications in Industry', excerpt: 'Common applications include image recognition, natural language processing...', source: 'ml-guide.pdf', page: 12, relevance: 87 },
        { id: 3, title: 'Training Methodologies', excerpt: 'Backpropagation is the primary algorithm used for training neural networks...', source: 'research-paper.pdf', page: 23, relevance: 82 },
      ];
      
      setResults(mockResults);
      setIsQuerying(false);
      toast({
        title: "✨ Results Found",
        description: `Found ${mockResults.length} relevant results for your query.`,
      });
    }, 2000);
  };

  return {
    query,
    setQuery,
    results,
    isQuerying,
    handleQuery
  };
};