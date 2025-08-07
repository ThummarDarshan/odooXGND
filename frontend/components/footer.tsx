"use client"

import { Github, Twitter, Linkedin, Mail, Heart, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Documentation", href: "/docs" },
    { name: "API Reference", href: "/api" },
    { name: "Changelog", href: "/changelog" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" },
    { name: "Press Kit", href: "/press" },
    { name: "Contact", href: "/contact" },
  ],
  resources: [
    { name: "Community", href: "/community" },
    { name: "Help Center", href: "/help" },
    { name: "Partners", href: "/partners" },
    { name: "Status", href: "/status" },
    { name: "Security", href: "/security" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
    { name: "Licenses", href: "/licenses" },
  ],
}

const socialLinks = [
  { name: "GitHub", icon: Github, href: "https://github.com", color: "hover:text-slate-700" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com", color: "hover:text-blue-500" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com", color: "hover:text-blue-600" },
  { name: "Email", icon: Mail, href: "mailto:hello@nexaui.com", color: "hover:text-blue-500" },
]

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="bg-slate-800 border-t-4 border-blue-500 text-white">
      <div className="container mx-auto px-6 py-16">
        {/* Newsletter Section */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4 text-white">Stay Updated</h3>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Get the latest updates, tutorials, and announcements delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              placeholder="Enter your email"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">Subscribe</Button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold">NexaUI</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-xs">
              Building the future of web development with beautiful, accessible, and performant UI components.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`text-slate-400 hover:text-blue-400 transition-colors duration-200`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-slate-400 hover:text-blue-400 transition-colors duration-200">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-slate-400 hover:text-blue-400 transition-colors duration-200">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-slate-400 hover:text-blue-400 transition-colors duration-200">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-slate-400 hover:text-blue-400 transition-colors duration-200">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-700">
          <div className="flex items-center space-x-2 text-slate-400 mb-4 md:mb-0">
            <span>© 2024 NexaUI. Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>by developers, for developers.</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="text-slate-400 hover:text-blue-400 hover:bg-slate-700"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Back to Top
          </Button>
        </div>
      </div>
    </footer>
  )
}
