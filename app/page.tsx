'use client'

import { CookieBanner } from '@/components/layout/CookieBanner'
import HeroSection from '@/components/landing/HeroSection'
import HowItWorks from '@/components/landing/HowItWorks'
import FeaturesSection from '@/components/landing/FeaturesSection'
import FooterCTA from '@/components/landing/FooterCTA'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#04030e]">
      <CookieBanner />
      <HeroSection />
      <div className="w-10 h-px bg-white/10 mx-auto mb-16" />
      <HowItWorks />
      <FeaturesSection />
      <FooterCTA />
      <div className="text-center py-5 text-[11px] text-white/20">
        MemoireQuest · Thesis OS v1.0
      </div>
    </main>
  )
}
