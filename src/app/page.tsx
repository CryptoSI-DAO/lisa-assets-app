import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import AgentGrid from "@/components/landing/AgentGrid";
import Pricing from "@/components/landing/Pricing";
import NewsletterCTA from "@/components/landing/NewsletterCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <AgentGrid />
      <Pricing />
      <NewsletterCTA />
    </>
  );
}
