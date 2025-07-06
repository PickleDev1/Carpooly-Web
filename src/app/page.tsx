'use client'

import { SignUpButton, useAuth } from "@clerk/nextjs";
import Link from 'next/link'
import Image from "next/image";
import { 
  Car, 
  Users, 
  Leaf, 
  DollarSign, 
  MapPin, 
  Clock, 
  Shield, 
  Star,
  ArrowRight,
  CheckCircle,
  Calendar,
  Route
} from "lucide-react";

export default function HomePage() {
  const { isSignedIn } = useAuth()

  const features = [
    {
      icon: Users,
      title: "Smart Matching",
      description: "Find the perfect carpool partners based on your route, schedule, and preferences."
    },
    {
      icon: MapPin,
      title: "Real-time Tracking",
      description: "Know exactly where your ride is with live location updates and ETA notifications."
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Verified users, background checks, and secure payment processing for peace of mind."
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Set up one-time rides or recurring carpools that fit your lifestyle."
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "Reduce your carbon footprint and contribute to a greener future."
    },
    {
      icon: DollarSign,
      title: "Save Money",
      description: "Split fuel costs and parking fees while enjoying a more affordable commute."
    }
  ]

  const benefits = [
    "Save up to 60% on transportation costs",
    "Reduce your carbon footprint by 50%",
    "Build meaningful connections with neighbors",
    "Never worry about parking again",
    "Flexible scheduling that works for you",
    "24/7 customer support"
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Working Parent",
      content: "CarPooly has been a game-changer for our family. We save money and our kids love riding with their friends!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Daily Commuter",
      content: "I've been using CarPooly for 6 months and it&apos;s made my commute so much more enjoyable and affordable.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Student",
      content: "Perfect for getting to campus! I've met so many great people and we're all helping the environment.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="container-responsive py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              Trusted by 10,000+ families
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Simplify Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                Carpool Routine
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Join thousands of families who are saving money, reducing emissions, and building community through smart carpooling.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {isSignedIn ? (
                <Link 
                  href="/dashboard" 
                  className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <button className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </SignUpButton>
              )}
              
              <Link 
                href="/about" 
                className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4"
              >
                Learn More
              </Link>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Free to join
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <Image
                src="/assets/images/carpool-illustration.png"
                alt="Happy people carpooling together"
                width={600}
                height={600}
                className="w-full h-auto rounded-2xl shadow-2xl"
                priority
              />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-2xl blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-responsive py-16 lg:py-24 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything you need for seamless carpooling
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform combines cutting-edge technology with human-centered design to make carpooling effortless and enjoyable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="card p-8 hover-lift group">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container-responsive py-16 lg:py-24 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Why choose CarPooly?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join the carpooling revolution and experience the benefits that thousands of users already enjoy.
            </p>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Route className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Daily Impact</h3>
                  <p className="text-gray-600">Your contribution to a better world</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">$15</div>
                  <div className="text-sm text-gray-600">Average daily savings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">8.5 lbs</div>
                  <div className="text-sm text-gray-600">CO2 reduced daily</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">45 min</div>
                  <div className="text-sm text-gray-600">Time saved weekly</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">12</div>
                  <div className="text-sm text-gray-600">New connections made</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container-responsive py-16 lg:py-24 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Loved by families everywhere
          </h2>
          <p className="text-xl text-gray-600">
            See what our community has to say about their CarPooly experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">&quot;{testimonial.content}&quot;</p>
              <div>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-responsive py-16 lg:py-24 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to start your carpooling journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of families who are already saving money and helping the environment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSignedIn ? (
              <Link 
                href="/dashboard" 
                className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                  Get Started Free
                </button>
              </SignUpButton>
            )}
          </div>
          
          <p className="text-sm opacity-75 mt-4">
            No credit card required • Free to join • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  )
}

