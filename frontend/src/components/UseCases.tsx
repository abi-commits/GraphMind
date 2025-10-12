import { GraduationCap, Scale, Stethoscope, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const useCases = [
  {
    icon: GraduationCap,
    title: "Research Literature Review",
    description: "Papers → comprehensive lit review",
    link: "#",
  },
  {
    icon: Scale,
    title: "Legal Document Analysis",
    description: "Contracts → relationship graph",
    link: "#",
  },
  {
    icon: Stethoscope,
    title: "Clinical Evidence Summaries",
    description: "Medical papers → comparative models",
    link: "#",
  },
  {
    icon: BookOpen,
    title: "Book Q&A",
    description: "Fiction analysis: characters & relationships",
    link: "#",
  },
];

const UseCases = () => {
  return (
    <section id="use-cases" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Use Cases
          </h2>
          <p className="text-lg text-muted-foreground">
            See GraphMind in action across different domains
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="glass-card rounded-xl p-6 hover-lift flex flex-col"
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <useCase.icon className="h-6 w-6 text-accent" />
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{useCase.description}</p>
              
              <Button variant="ghost" size="sm" className="w-full justify-start p-0 h-auto hover:bg-transparent">
                <span className="text-accent text-sm">Learn more →</span>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
