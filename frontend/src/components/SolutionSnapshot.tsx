import { Search, Network, Shield, Zap } from "lucide-react";

const benefits = [
  {
    icon: Search,
    title: "Hybrid retrieval",
    description: "Vector search + LLM reasoning for precision",
  },
  {
    icon: Network,
    title: "Ephemeral knowledge graphs",
    description: "Query-specific reasoning graphs on demand",
  },
  {
    icon: Shield,
    title: "Explainability",
    description: "Citations + evidence for every claim",
  },
  {
    icon: Zap,
    title: "Lightweight & self-hostable",
    description: "HuggingFace embeddings + Chroma",
  },
];

const SolutionSnapshot = () => {
  return (
    <section className="py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            What GraphMind does
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Combine vector search with LLM reasoning to build dynamic knowledge graphs from your documents.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="border border-border rounded-lg p-8 hover:border-muted-foreground/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center mb-6">
                <benefit.icon className="h-4 w-4 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSnapshot;
