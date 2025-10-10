import { DocumentUpload } from '@/components/document/DocumentUpload';
import { Card, CardContent } from '@/components/ui/Card';
import { Globe } from 'lucide-react';
import GraphPreview from '@/components/GraphPreview';
import { AnimatedUploadIcon, AnimatedQueryIcon, AnimatedGraphIcon } from '@/components/ui/AnimatedFeatureIcons';

export default function Home() {
  const features = [
    {
      icon: AnimatedUploadIcon,
      title: 'Upload Documents',
      description: 'Upload PDFs and process them into searchable knowledge',
      gradient: 'from-primary-500 to-primary-600',
    },
    {
      icon: AnimatedQueryIcon,
      title: 'Intelligent Query',
      description: 'Ask questions and get AI-powered summaries and insights',
      gradient: 'from-secondary-500 to-secondary-600',
    },
    {
      icon: AnimatedGraphIcon,
      title: 'Knowledge Graphs',
      description: 'Visualize relationships and connections between concepts',
      gradient: 'from-accent-500 to-accent-600',
    },
  ];

  return (
    <div className="py-12 px-4 sm:px-8 lg:px-16 2xl:px-0 max-w-[1600px] mx-auto">
      {/* Hero Section - Split Layout */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 mb-24 md:mb-32">
        {/* Left: Text */}
        <div className="flex-1 text-center md:text-left space-y-6 md:space-y-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-4 drop-shadow-xl hero-heading">
            Transform Documents
            <span className="block gradient-text text-6xl sm:text-7xl lg:text-8xl mt-2 font-black drop-shadow-glow">into Knowledge Graphs</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium max-w-xl md:max-w-2xl mx-auto md:mx-0 leading-relaxed mb-2">
            <span className="font-semibold text-foreground">AI-powered platform</span> to upload, query, and visualize your documents as interactive knowledge graphs. <span className="hidden md:inline">Reveal hidden connections and gain deeper insights from your content.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-6">
            <a href="#get-started" className="btn-primary text-lg px-8 py-3 shadow-glow hover:scale-105 focus-visible">Get Started</a>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Powered by OpenAI GPT-4 • NetworkX • LangChain</span>
            </div>
          </div>
        </div>
        {/* Right: Visual */}
        <div className="flex-1 flex items-center justify-center relative min-h-[320px] md:min-h-[400px]">
          <GraphPreview />
          {/* Animated mesh/gradient background */}
          <div className="absolute inset-0 z-0 mesh-bg rounded-3xl blur-2xl" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto mb-24">
        <h2 className="text-4xl font-extrabold text-center mb-14 tracking-tight feature-heading drop-shadow-glow">
          <span className="gradient-text">Powerful Features</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`text-center group interactive-hover feature-card border-2 border-transparent hover:border-${feature.gradient.split(' ')[1]} shadow-knowledge`}
              hover
              glow
            >
              <CardContent className="p-10 flex flex-col items-center">
                <div className={`bg-gradient-to-br ${feature.gradient} p-5 rounded-full w-20 h-20 flex items-center justify-center shadow-glow-lg mb-7 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-glow`}> 
                  <feature.icon className="h-10 w-10 text-white drop-shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2 feature-title drop-shadow-glow">
                  {feature.title}
                </h3>
                <p className="text-base text-muted-foreground font-medium leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Document Upload Section */}
      <section id="get-started" className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 gradient-text drop-shadow-glow">Get Started</h2>
          <p className="text-lg text-muted-foreground font-medium">
            Upload your first document and start building your knowledge graph
          </p>
        </div>
        <DocumentUpload />
      </section>
    </div>
  );
}