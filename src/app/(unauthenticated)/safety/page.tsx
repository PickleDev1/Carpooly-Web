'use client'

import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Users, 
  Car, 
  Star,
  Lock,
  Eye,
  Heart,
  Award,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SafetyPage() {
  const safetyFeatures = [
    {
      icon: Shield,
      title: "User Verification",
      description: "All users must verify their email and phone number to join carpools.",
      features: ["Email confirmation", "Phone number verification"]
    },
    {
      icon: Lock,
      title: "Secure Communication",
      description: "Your contact information is private and only shared with your carpool group.",
      features: ["Emergency contacts", "Location sharing", "Ride tracking"]
    },
    {
      icon: Eye,
      title: "Real-time Tracking",
      description: "Live location sharing and ride tracking for peace of mind.",
      features: ["Live GPS tracking", "Route monitoring", "Arrival notifications"]
    },
    {
      icon: Users,
      title: "Community Reviews",
      description: "Transparent rating and review system to build trust within the community.",
      features: ["User ratings", "Detailed reviews", "Community feedback"]
    }
  ]

  const safetyTips = [
    {
      category: "Before Your Carpool",
      tips: [
        "Coordinate pickup times and locations with your group in advance.",
        "Make sure everyone has each other's contact information.",
        "Agree on driving and cost-sharing arrangements ahead of time.",
        "Share your planned route with all carpool members."
      ]
    },
    {
      category: "During Your Carpool",
      tips: [
        "Be punctual and communicate if you're running late.",
        "Wear seatbelts and encourage others to do the same.",
        "Respect each other's preferences for music, conversation, and temperature.",
        "Drive safely and follow all traffic laws."
      ]
    },
    {
      category: "Group Safety Best Practices",
      tips: [
        "Keep emergency contact info up to date for all group members.",
        "Discuss and agree on safety expectations as a group.",
        "If someone feels unwell or unsafe, adjust plans as needed.",
        "Support a positive, respectful, and inclusive carpool environment."
      ]
    }
  ]

  const emergencyProcedures = [
    {
      title: "Emergency Button",
      description: "Accessible 24/7 emergency assistance with one tap",
      action: "Tap the emergency button in the app to connect with our safety team"
    },
    {
      title: "911 Integration",
      description: "Direct connection to emergency services when needed",
      action: "Your location and ride details are automatically shared with emergency responders"
    },
    {
      title: "Safety Team",
      description: "Dedicated safety specialists available around the clock",
      action: "Our team responds within 30 seconds to all safety concerns"
    }
  ]

  const trustFeatures = [
    {
      icon: Star,
      title: "Verified Users",
      description: "All community members are verified through multiple identity checks"
    },
    {
      icon: Award,
      title: "Safety Certifications",
      description: "Our platform meets industry safety standards and regulations"
    },
    {
      icon: Heart,
      title: "Community Trust",
      description: "Built on transparency, honesty, and mutual respect"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="container-responsive py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Safety First
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Your Safety is Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              Top Priority
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            We've built comprehensive safety features into every aspect of CarPooly to ensure you have a secure and comfortable carpooling experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/support/articles/community-safety/safety-features">
              <Button size="lg" className="btn-primary">
                <Shield className="w-5 h-5 mr-2" />
                Learn About Safety Features
              </Button>
            </a>
            <a href="mailto:cidambi.nikhil@gmail.com" className="w-full sm:w-auto">
              <Button size="lg" className="bg-green-600 text-white font-semibold py-3 text-lg hover:bg-green-700 transition-colors">
                <Phone className="w-5 h-5 mr-2" />
                Contact Safety Team
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="container-responsive py-16 lg:py-24 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Safety Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our multi-layered safety approach ensures you can carpool with confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {safetyFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="hover-lift">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Safety Tips */}
      <section className="container-responsive py-16 lg:py-24 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Safety Tips for Carpooling with People You Know
          </h2>
          <p className="text-xl text-gray-600">
            CarPooly is designed for organizing carpools with friends, coworkers, and family. Use these tips to keep your group safe, organized, and happy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {safetyTips.map((category, index) => (
            <Card key={index} className="hover-lift">
              <CardHeader>
                <CardTitle className="text-lg">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {category.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust Features */}
      <section className="container-responsive py-16 lg:py-24 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Building Trust in Our Community
          </h2>
          <p className="text-xl text-gray-600">
            We're committed to creating a safe, trustworthy carpooling community.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {trustFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="text-center hover-lift">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
} 