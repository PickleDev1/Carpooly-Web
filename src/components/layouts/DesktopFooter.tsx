'use client'

import Link from 'next/link'
import Image from 'next/image'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin,
  Heart,
  Leaf,
  Shield,
  Users,
  Car
} from 'lucide-react'

export function DesktopFooter() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { label: 'Features', href: '/features', icon: Car },
      { label: 'Safety', href: '/safety', icon: Shield },
      { label: 'Support', href: '/support', icon: Users },
    ],
    company: [
      { label: 'About', href: '/about' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
    social: [
      { label: 'Twitter', href: 'https://twitter.com/carpooly', icon: Twitter },
      { label: 'Facebook', href: 'https://facebook.com/carpooly', icon: Facebook },
      { label: 'Instagram', href: 'https://instagram.com/carpooly', icon: Instagram },
      { label: 'LinkedIn', href: 'https://linkedin.com/company/carpooly', icon: Linkedin },
    ]
  }

  return (
    <footer className="hidden md:block bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container-responsive py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand Section - Made wider */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Image 
                src="/assets/logo/carpooly-logo.jpg" 
                alt="CarPooly" 
                width={48}
                height={48}
                className="rounded-lg shadow-sm" 
              />
              <div>
                <span className="font-bold text-2xl">CarPooly</span>
                <p className="text-sm text-gray-400">Carpooling Made Simple</p>
              </div>
            </div>
            <p className="text-gray-300 mb-8 leading-relaxed text-base">
              Making carpooling simple, safe, and sustainable. Join thousands of families who are saving money and helping the environment.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
                <span className="text-sm">cidambi.nikhil@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
                <span className="text-sm">510-270-7810</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <MapPin className="w-5 h-5" />
                <span className="text-sm">San Francisco, CA</span>
              </div>
            </div>

            {/* Social Links - Moved here */}
            <div className="mt-8">
              <h4 className="font-semibold text-base mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {footerLinks.social.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-700 hover:bg-primary rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Product & Company Links - Combined */}
          <div className="lg:col-span-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
              {/* Product Links */}
              <div>
                <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Product
                </h3>
                <ul className="space-y-4">
                  {footerLinks.product.map((link) => {
                    const Icon = link.icon
                    return (
                      <li key={link.href}>
                        <Link 
                          href={link.href}
                          className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                        >
                          <Icon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h3 className="font-semibold text-lg mb-6">Company</h3>
                <ul className="space-y-4">
                  {footerLinks.company.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Legal & Additional Info */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-lg mb-6">Legal</h3>
            <ul className="space-y-4 mb-8">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Additional Info */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h4 className="font-semibold text-base mb-3">Why CarPooly?</h4>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-400" />
                  <span>Reduce your carbon footprint</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>Save money on transportation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Build community connections</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container-responsive py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>© {currentYear} CarPooly. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">and</span>
              <Leaf className="w-4 h-4 text-green-500" />
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 