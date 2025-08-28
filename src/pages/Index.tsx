import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LendingDashboard from "@/components/LendingDashboard";
import ScholarshipHub from "@/components/ScholarshipHub";
import CommunitySection from "@/components/CommunitySection";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <LendingDashboard />
      <ScholarshipHub />
      <CommunitySection />
    </main>
  );
};

export default Index;
