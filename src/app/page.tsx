import Hero from "@/components/sections/Hero";
import ScrollStory from "@/components/scene/ScrollStory";
import Stats from "@/components/sections/Stats";
import Work from "@/components/sections/Work";
import About from "@/components/sections/About";
import Toolkit from "@/components/sections/Toolkit";
import AgentSection from "@/components/sections/AgentSection";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <ScrollStory />
      <Stats />
      <Work />
      <About />
      <Toolkit />
      <AgentSection />
      <Contact />
    </main>
  );
}
