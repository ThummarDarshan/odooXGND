"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { GradientBackground } from "@/components/gradient-background"
import { AnimatedDots } from "@/components/animated-dots"
import { ArrowRight, Target, Users, Lightbulb, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const values = [
  {
    icon: Target,
    title: "Innovation First",
    description: "We push the boundaries of what's possible in web development, always staying ahead of the curve.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Our success is built on the strength of our developer community and their feedback.",
  },
  {
    icon: Lightbulb,
    title: "Simplicity",
    description: "Complex problems deserve elegant solutions. We make the complicated simple.",
  },
  {
    icon: Heart,
    title: "Quality Focus",
    description: "Every line of code, every component, every feature is crafted with attention to detail.",
  },
]

const team = [
  {
    name: "Alex Chen",
    role: "Founder & CEO",
    image: "/placeholder-user.jpg",
    description: "10+ years building developer tools",
  },
  {
    name: "Sarah Johnson",
    role: "Head of Design",
    image: "/placeholder-user.jpg",
    description: "Former design lead at top tech companies",
  },
  {
    name: "Mike Rodriguez",
    role: "Lead Engineer",
    image: "/placeholder-user.jpg",
    description: "Full-stack expert with passion for performance",
  },
  {
    name: "Emily Davis",
    role: "Developer Relations",
    image: "/placeholder-user.jpg",
    description: "Connecting developers with amazing tools",
  },
]

const stats = [
  { number: "50K+", label: "Developers" },
  { number: "1M+", label: "Components Built" },
  { number: "99.9%", label: "Uptime" },
  { number: "24/7", label: "Support" },
]

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <GradientBackground />
      <Navigation />

      <div className="relative z-10">
        <AnimatedDots />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-in fade-in-0 slide-in-from-top-4 duration-1000">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="text-foreground">Building the </span>
                <span
                  className="relative inline-block bg-gradient-to-r from-blue-800 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient-flow"
                  style={{ backgroundSize: "200% 200%" }}
                >
                  Future
                </span>
                <br />
                <span className="text-foreground">Together</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                We're on a mission to empower developers with the tools and components they need to build exceptional
                web experiences faster than ever before.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="animate-in fade-in-0 slide-in-from-left-8 duration-1000">
                <h2 className="text-4xl font-bold text-foreground mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  We believe that great software should be accessible to everyone. That's why we're building the most
                  comprehensive library of React components, designed to help developers create beautiful, functional
                  applications without starting from scratch.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  From startups to enterprise companies, our tools are trusted by developers worldwide to deliver
                  exceptional user experiences that drive business results.
                </p>
              </div>

              <div className="animate-in fade-in-0 slide-in-from-right-8 duration-1000 delay-300">
                <Card className="bg-background shadow-lg border-border hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-8">
                      {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                          <div className="text-muted-foreground font-medium">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
              <h2 className="text-4xl font-bold text-foreground mb-6">Our Values</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                These principles guide everything we do, from the code we write to the community we build.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="bg-background shadow-lg border-border hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-8 duration-1000"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                      <value.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
              <h2 className="text-4xl font-bold text-foreground mb-6">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The passionate individuals behind NexaUI, working tirelessly to make development better for everyone.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card
                  key={index}
                  className="bg-background shadow-lg border-border hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-8 duration-1000"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <img
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-blue-100"
                      />
                      <div className="absolute inset-0 w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-blue-400/20 to-purple-600/20 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative max-w-4xl mx-auto text-center px-4">
            <div className="animate-in fade-in-0 slide-in-from-bottom-8 duration-1000">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Build Something Amazing?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of developers who are already building the future with NexaUI. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-background text-blue-600 hover:bg-blue-50 font-medium px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  asChild
                >
                  <a href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-background text-white hover:bg-background hover:text-blue-600 font-medium px-8 py-4 rounded-xl transition-all duration-300 bg-transparent"
                >
                  View Documentation
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
