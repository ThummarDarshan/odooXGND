"use client"

import { Check, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for getting started with your first project",
    popular: false,
    features: ["Up to 3 projects", "Basic components library", "Community support", "Basic templates", "1GB storage"],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "Best for professional developers and small teams",
    popular: true,
    features: [
      "Unlimited projects",
      "Premium components",
      "Priority support",
      "Advanced templates",
      "50GB storage",
      "Team collaboration",
      "Custom themes",
      "API access",
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "default" as const,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "For large teams and organizations with advanced needs",
    popular: false,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "24/7 phone support",
      "Custom integrations",
      "Unlimited storage",
      "Advanced analytics",
      "White-label options",
      "Dedicated account manager",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-6 bg-background text-foreground">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200 text-sm font-medium mb-6">
            <Star className="h-4 w-4 mr-2" />
            Simple, Transparent Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl bg-background border transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm hover:shadow-lg ${
                plan.popular ? "border-blue-200 ring-2 ring-blue-100" : "border-slate-200 dark:border-slate-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 dark:bg-blue-400 text-white dark:text-slate-900 px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{plan.name}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{plan.description}</p>

                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{plan.price}</span>
                  {plan.price !== "Free" && <span className="text-slate-500 dark:text-slate-400 ml-2">/{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3 text-slate-600">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.buttonVariant}
                className={`w-full h-12 font-medium ${
                  plan.buttonVariant === "default"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "text-slate-600 hover:text-slate-900 border-slate-300 hover:border-slate-400"
                }`}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
