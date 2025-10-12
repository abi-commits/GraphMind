import { useState } from 'react';
import { Upload as UploadIcon, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      toast({
        title: "Documents processed!",
        description: `Successfully indexed ${files.length} document(s)`,
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <Button variant="outline" className="glass glass-hover border-white/20">
            View Docs
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-glow">Upload Documents</h1>
            <p className="text-lg text-white/60">
              Drop your files to start building your knowledge graph
            </p>
          </div>

          {!isComplete ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative glass rounded-2xl p-12 border-2 border-dashed transition-all duration-300
                ${isDragging ? 'border-white/60 bg-white/10 scale-105' : 'border-white/20'}
                ${isProcessing ? 'pointer-events-none' : 'cursor-pointer hover:border-white/40 hover:bg-white/5'}
              `}
            >
              {isProcessing ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 relative">
                    <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Processing Documents</h3>
                  <p className="text-white/60">
                    Chunking, embedding, and indexing your content...
                  </p>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 glass rounded-full flex items-center justify-center">
                      <UploadIcon className="w-10 h-10" />
                    </div>
                    
                    <h3 className="text-2xl font-semibold mb-2">
                      Drop files here or click to browse
                    </h3>
                    <p className="text-white/60 mb-6">
                      Supports PDF, DOC, DOCX, and TXT files
                    </p>

                    <div className="flex items-center justify-center gap-4 text-sm text-white/40">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Up to 10MB</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-white/40" />
                      <span>Multiple files supported</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center glass rounded-2xl p-12 animate-scale-in">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Upload Complete!</h3>
              <p className="text-white/60 mb-8">
                Your documents are ready to query
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button 
                  size="lg"
                  className="bg-white text-black hover:bg-white/90"
                  onClick={() => window.location.href = '/query'}
                >
                  Start Querying
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="glass glass-hover border-white/20"
                  onClick={() => setIsComplete(false)}
                >
                  Upload More
                </Button>
              </div>
            </div>
          )}

          {/* Quick stats */}
          {!isComplete && !isProcessing && (
            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { label: 'Avg. Processing', value: '2-3s' },
                { label: 'Max File Size', value: '10MB' },
                { label: 'Formats', value: '4+' },
              ].map((stat, i) => (
                <div key={i} className="text-center glass rounded-lg p-4">
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Upload;
