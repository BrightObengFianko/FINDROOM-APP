import Footer from '../components/landing/Footer'
import HeroSection from '../components/landing/HeroSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import LandlordCtaSection from '../components/landing/LandlordCtaSection'
import Navbar from '../components/landing/Navbar'
import PopularAreasSection from '../components/landing/PopularAreasSection'
import SearchBar from '../components/landing/SearchBar'
import TrustIndicators from '../components/landing/TrustIndicators'

function LandingPage() {
  return (
    <main className="mx-auto mt-4 w-full max-w-[1160px] bg-white sm:mt-5 lg:mt-[24px]">
      <Navbar />

      <div className="px-4 pb-5 pt-[68px] sm:px-5 sm:pb-6 sm:pt-[76px] lg:px-[24px] lg:pb-[24px] lg:pt-[69px]">
        <div className="scroll-mt-[84px] sm:scroll-mt-[92px]" id="home">
          <HeroSection />
        </div>
        <SearchBar />
        <TrustIndicators />
        <div className="scroll-mt-[84px] sm:scroll-mt-[92px]" id="about">
          <HowItWorksSection />
        </div>
        <div className="scroll-mt-[84px] sm:scroll-mt-[92px]" id="browse">
          <PopularAreasSection />
        </div>
        <div className="scroll-mt-[84px] sm:scroll-mt-[92px]" id="landlords">
          <LandlordCtaSection />
        </div>
        <div className="scroll-mt-[84px] sm:scroll-mt-[92px]" id="contact">
          <Footer />
        </div>
      </div>
    </main>
  )
}

export default LandingPage
