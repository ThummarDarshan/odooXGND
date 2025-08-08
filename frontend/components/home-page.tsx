"use client"

import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { FeatureCards } from "@/components/feature-cards"
import { PricingSection } from "@/components/pricing-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Footer } from "@/components/footer"

export function HomePage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Content */}
      <div className="relative z-10">
        <Navigation />
        <HeroSection />
        <FeatureCards />
        <PricingSection />
        <TestimonialsSection />
        <Footer />
      </div>
    </div>
  )
}
