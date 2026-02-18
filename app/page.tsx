'use client'

import { CookieBanner } from '@/components/layout/CookieBanner'
import HeroSection from '@/components/landing/HeroSection'
import HowItWorks from '@/components/landing/HowItWorks'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <CookieBanner />
      <HeroSection />
      <HowItWorks />
    </main>
  )
}
