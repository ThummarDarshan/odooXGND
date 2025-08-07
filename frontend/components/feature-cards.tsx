"use client"

import { Zap, Shield, Rocket, Palette, Code, Globe } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance with 60fps animations and minimal bundle size for the best user experience.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "Built with security, accessibility, and scalability in mind for production applications.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    icon: Rocket,
    title: "Modern Stack",
    description: "Built on React, TypeScript, and the latest web technologies with best practices.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    icon: Palette,
    title: "Fully Customizable",
    description: "Easily themeable with CSS variables and design tokens to match your brand.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    icon: Code,
    title: "Developer First",
    description: "Excellent developer experience with TypeScript support and comprehensive documentation.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  {
    icon: Globe,
    title: "Global Scale",
    description: "Internationalization support with RTL languages and accessibility features included.",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
  },
]

export function FeatureCards() {
  return (
    <section id="features" className="py-20 px-6 bg-background text-foreground">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200 text-sm font-medium mb-6">
            <Zap className="h-4 w-4 mr-2" />
            Powerful Features
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Why Choose <span className="text-blue-600">NexaUI</span>
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Everything you need to build modern, beautiful, and performant web applications with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group p-8 rounded-2xl ${feature.bgColor} border ${feature.borderColor} dark:bg-slate-800 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} ${feature.borderColor} dark:bg-slate-900 dark:border-slate-700 border mb-6`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">{feature.title}</h3>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
