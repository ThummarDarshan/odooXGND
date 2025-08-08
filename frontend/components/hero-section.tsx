"use client"

import { ArrowRight, Play, Zap, Rocket, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { GradientBackground } from "@/components/gradient-background"
import { AnimatedDots } from "@/components/animated-dots"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative py-24 px-6 min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <GradientBackground />
        <AnimatedDots />
      </div>

      {/* Subtle geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full blur-xl animate-gentle-float" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-purple-200/20 to-pink-200/20 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full blur-xl animate-gentle-float animation-delay-1000" />
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-full blur-xl animate-gentle-float animation-delay-2000" />
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full blur-xl animate-gentle-float animation-delay-1500" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/40 rounded-full animate-float-slow" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-indigo-400/40 rounded-full animate-float-slow animation-delay-500" />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-float-slow animation-delay-1000" />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-cyan-400/40 rounded-full animate-float-slow animation-delay-1500" />
      </div>

      <div className="container mx-auto max-w-5xl text-center relative z-10">
        {/* Badge */}
        <div
          className={`inline-flex items-center px-6 py-3 rounded-full bg-white/90 backdrop-blur-sm border border-blue-200/50 text-blue-700 text-sm font-medium mb-8 shadow-lg transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <Sparkles className="h-4 w-4 mr-2 text-blue-500 animate-pulse" />
          Now in Beta - Join Early Access
          <Zap className="h-4 w-4 ml-2 text-amber-500 animate-bounce" />
        </div>

        {/* Main heading with better contrast */}
        <h1
          className={`text-5xl md:text-7xl font-bold mb-8 transition-all duration-1000 delay-300 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <span className="text-slate-900 dark:text-slate-100">Build the </span>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Future</span>
          <br />
          <span className="text-slate-900 dark:text-slate-100">of Web Development</span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed transition-all duration-1000 delay-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          Create beautiful, accessible, and performant web applications with our modern UI component library. Designed
          for developers who care about quality and user experience.
        </p>

        {/* CTA Buttons with enhanced effects */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-1000 delay-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <Button
            size="lg"
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg font-medium overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform skew-x-12 -translate-x-full group-hover:translate-x-full" />
            <Rocket className="h-5 w-5 mr-2 group-hover:animate-bounce relative z-10" />
            <span className="relative z-10">Get Started Free</span>
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="group px-8 py-4 border-slate-300 text-slate-700 hover:text-slate-900 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 hover:scale-105 text-lg font-medium bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
          >
            <Play className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            Watch Demo
          </Button>
        </div>

        {/* Enhanced Stats */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {[
            { label: "Active Users", value: "50K+", icon: "👥", gradient: "from-blue-500 to-cyan-500" },
            { label: "Components", value: "200+", icon: "🧩", gradient: "from-indigo-500 to-purple-500" },
            { label: "Satisfaction", value: "99%", icon: "⭐", gradient: "from-purple-500 to-pink-500" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="group relative p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 hover:border-blue-200 hover:bg-white/90 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
              />
              <div className="text-4xl mb-3 animate-gentle-float" style={{ animationDelay: `${index * 300}ms` }}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors duration-300">
                {stat.value}
              </div>
              <div className="text-slate-600 text-sm uppercase tracking-wider font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
