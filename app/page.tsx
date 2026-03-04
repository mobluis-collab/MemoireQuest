'use client'

import { CookieBanner } from '@/components/layout/CookieBanner'
import HeroSection from '@/components/landing/HeroSection'
import HowItWorks from '@/components/landing/HowItWorks'
import FeaturesSection from '@/components/landing/FeaturesSection'
import FooterCTA from '@/components/landing/FooterCTA'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] dark:bg-[#04030e]">
      <CookieBanner />
      <HeroSection />
      <div className="w-10 h-px bg-black/10 dark:bg-white/10 mx-auto mb-8" />
      <HowItWorks />
      <FeaturesSection />
      <FooterCTA />
      <div className="text-center py-5 text-[11px] text-zinc-300 dark:text-white/20">
        maimouarkwest · Thesis OS v1.0
      </div>
    </main>
  )
}
