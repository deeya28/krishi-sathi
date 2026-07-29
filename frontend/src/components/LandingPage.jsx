import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import MissionVision from "./MissionVision";
import Features from "./Features";
import Team from "./Team";
import Contact from "./Contact";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="bg-paper">
      <Navbar />
      <Hero />
      <About />
      <MissionVision />
      <Features />
      <Team />
      <Contact />
      <Footer />
    </div>
  );
}
