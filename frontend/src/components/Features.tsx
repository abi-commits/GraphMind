import { Upload, Search, Network, Workflow, Server } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Ingest & Index",
    description: "Robust PDF extraction, chunking, and embedding — built for long documents.",
    visual: "Chunked text + metadata pane",
  },
  {
    icon: Search,
    title: "Retrieval + LLM",
    description: "High-precision retrieval with LLM-guided synthesis and provenance.",
    visual: "query → ranked chunks → highlighted evidence",
  },
  {
    icon: Network,
    title: "Ephemeral Knowledge Graph",
    description: "Create query-specific graphs that reveal relationships, causes, and influence.",
    visual: "Dynamic force-directed node graph",
  },
  {
    icon: Workflow,
    title: "Agentic Workflow",
    description: "Compose Summarizer, Graph Builder, and Analyst agents with LangGraph / Inngest.",
    visual: "Mini flowchart",
  },
  {
    icon: Server,
    title: "Deploy & Scale",
    description: "Docker-ready, Inngest orchestration, Pinecone/Chroma compatibility.",
    visual: "Infra diagram snippet",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="space-y-24">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-12 items-center`}
            >
              <div className="flex-1 space-y-4">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-3xl font-bold">{feature.title}</h3>
                <p className="text-lg text-muted-foreground">{feature.description}</p>
              </div>
              
              <div className="flex-1 glass-card rounded-2xl p-8 hover-lift">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary-variant/10 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground font-mono">{feature.visual}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
