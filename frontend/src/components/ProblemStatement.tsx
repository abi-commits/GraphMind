import { FileQuestion, SearchX, Clock } from "lucide-react";

const problems = [
  {
    icon: FileQuestion,
    title: "Unstructured knowledge",
    description: "PDFs and papers trap insights in prose, making information hard to extract and connect.",
  },
  {
    icon: SearchX,
    title: "Opaque AI answers",
    description: "Answers lack provenance or relationships, leaving you wondering about the source and connections.",
  },
  {
    icon: Clock,
    title: "Slow discovery",
    description: "Manual literature reviews waste time that could be spent on actual research and analysis.",
  },
];

const ProblemStatement = () => {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-transparent to-card/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Why GraphMind?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Traditional document search fails to capture the complex relationships in knowledge.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {problems.map((problem, index) => (
            <div key={index} className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <problem.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="text-2xl font-semibold">{problem.title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemStatement;
