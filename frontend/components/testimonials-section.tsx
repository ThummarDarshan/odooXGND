"use client"

import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Lead Developer",
    company: "TechCorp",
    avatar: "👩‍💻",
    rating: 5,
    content:
              "GlobeTrotter has completely transformed our development workflow. The components are beautiful, well-documented, and incredibly easy to customize.",
  },
  {
    name: "Marcus Rodriguez",
    role: "Product Manager",
    company: "StartupXYZ",
    avatar: "👨‍💼",
    rating: 5,
    content:
              "The best UI library I've ever used. Our team shipped features 3x faster after switching to GlobeTrotter. The quality is outstanding!",
  },
  {
    name: "Emily Johnson",
    role: "Frontend Architect",
    company: "Enterprise Inc",
    avatar: "👩‍🎨",
    rating: 5,
    content:
      "Outstanding quality and attention to detail. The accessibility features are top-notch, and the performance is incredible.",
  },
  {
    name: "David Kim",
    role: "CTO",
    company: "InnovateLab",
    avatar: "👨‍💻",
    rating: 5,
    content:
              "GlobeTrotter helped us build a world-class product in record time. The component library is comprehensive and the support is fantastic.",
  },
  {
    name: "Lisa Wang",
    role: "UI/UX Designer",
    company: "DesignStudio",
    avatar: "👩‍🎨",
    rating: 5,
    content:
              "As a designer, I love how flexible and customizable GlobeTrotter is. It perfectly bridges the gap between design and development.",
  },
  {
    name: "Alex Thompson",
    role: "Full Stack Developer",
    company: "WebAgency",
    avatar: "👨‍💻",
    rating: 5,
    content:
      "The documentation is excellent and the components just work. I can focus on building features instead of fighting with UI bugs.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 px-6 bg-background text-foreground">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900 dark:text-amber-200 text-sm font-medium mb-6">
            <Star className="h-4 w-4 mr-2" />
            Loved by Developers
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            What Our{" "}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
              Community
            </span>{" "}
            Says
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Join thousands of developers who trust GlobeTrotter for their projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="p-6 rounded-2xl bg-background border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <Quote className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-4" />

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">"{testimonial.content}"</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="text-slate-900 dark:text-slate-100 font-semibold">{testimonial.name}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-slate-200">
          {[
            { label: "Happy Customers", value: "10K+", icon: "😊" },
            { label: "Projects Built", value: "50K+", icon: "🚀" },
            { label: "Countries", value: "120+", icon: "🌍" },
            { label: "Satisfaction", value: "99.9%", icon: "⭐" },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-slate-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
