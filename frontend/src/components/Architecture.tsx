import { Upload, Database, Search, Network } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload",
    description: "PDF extraction & preprocessing",
    code: "upload_document(file)",
  },
  {
    icon: Database,
    title: "Embed",
    description: "Generate vector embeddings",
    code: "embed_chunks(chunks)",
  },
  {
    icon: Search,
    title: "Retrieve",
    description: "Semantic search & ranking",
    code: "retrieve(query, top_k=5)",
  },
  {
    icon: Network,
    title: "Graph & Answer",
    description: "Build graph & synthesize answer",
    code: "build_graph(query, chunks)",
  },
];

const Architecture = () => {
  return (
    <section id="architecture" className="py-20 px-6 bg-gradient-to-b from-transparent to-primary/5">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            Four simple steps from document to insight
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent -z-10" />
              )}
              
              <div className="glass-card rounded-xl p-6 hover-lift h-full">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <step.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                
                <div className="text-sm font-semibold text-accent mb-2">
                  Step {index + 1}
                </div>
                
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <code className="text-xs font-mono text-foreground">{step.code}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Architecture;
