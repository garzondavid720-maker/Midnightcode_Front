import Navbar        from "../../components/layout/Navbar"
import Hero          from "../../components/sections/Hero"
import StatsSection  from "../../components/sections/StatsSection"
import Experience    from "../../components/sections/Experience"
import WhyJoin       from "../../components/sections/WhyJoin"
import MenuPreview   from "../../components/sections/MenuPreview"
import LiveActs      from "../../components/sections/LiveActs"
import Testimonials  from "../../components/sections/Testimonials"
import VipGallery    from "../../components/sections/VipGallery"
import Location      from "../../components/sections/Location"
import CTA           from "../../components/sections/CTA"
import Footer        from "../../components/layout/Footer"
import WelcomeModal  from "../../components/ui/WelcomeModal"

export default function HomePage() {
  return (
    <div className="bg-background-dark text-white font-display">
      <WelcomeModal />
      <Navbar />
      <Hero />
      <StatsSection />
      <Experience />
      <WhyJoin />
      <MenuPreview />
      <LiveActs />
      <Testimonials />
      <VipGallery />
      <Location />
      <CTA />
      <Footer />
    </div>
  );
}
