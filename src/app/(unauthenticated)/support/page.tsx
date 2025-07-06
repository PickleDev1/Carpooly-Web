'use client'

import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Video,
  FileText,
  Users,
  Settings,
  Shield,
  Car,
  MapPin,
  CreditCard,
  Smartphone,
  Globe,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showPhoneModal, setShowPhoneModal] = useState(false)

  const helpCategories = [
    {
      icon: Car,
      title: "Getting Started",
      description: "Learn how to create your first carpool and start sharing rides",
      articles: ["How to create a carpool", "Setting up your profile", "First ride tips"]
    },
    {
      icon: MapPin,
      title: "Location & Navigation",
      description: "Help with location tracking, routes, and navigation features",
      articles: ["Location permissions", "Route optimization", "Real-time tracking", "Address issues"]
    },
    {
      icon: Users,
      title: "Community & Safety",
      description: "Information about user verification, safety features, and community guidelines",
      articles: ["User verification", "Safety features", "Reporting issues", "Community guidelines"]
    },
    {
      icon: Smartphone,
      title: "App & Technical",
      description: "Technical support for app issues, updates, and device compatibility",
      articles: ["Website troubleshooting", "Browser compatibility", "Update issues", "Performance"]
    },
    {
      icon: Settings,
      title: "Account & Settings",
      description: "Manage your account, preferences, and privacy settings",
      articles: ["Account settings", "Privacy controls", "Notification preferences", "Data management"]
    }
  ]

  const faqs = [
    {
      question: "How do I create my first carpool?",
      answer: "Creating a carpool is easy! Simply tap the 'Create Carpool' button, enter your destination, set your departure time, and specify how many seats you need. You can also add pickup locations and any special requirements. Once published, you can share your carpool with people you know."
    },
    {
      question: "Is CarPooly safe to use?",
      answer: "Yes, CarPooly prioritizes safety above all else. All users undergo identity verification, we have real-time location tracking, emergency buttons, and a comprehensive rating system. Our safety team is available 24/7 to address any concerns."
    },
    {
      question: "How do I report a bug?",
      answer: "If you encounter a bug, go to the ride or feature where the issue occurred, click support at the bottom of the page, click on email contact, and describe the bug in detail, and submit. Our team will review and address it promptly."
    },
    {
      question: "Can I use CarPooly for regular commutes?",
      answer: "Absolutely! Many users create regular carpools for daily commutes with people they already know. You can set up recurring rides, save favorite routes, and organize your group easily."
    },
    {
      question: "How do I see live location?",
      answer: "To see live location, open your ride details and tap the 'Live Map' button. You'll see the car's current location and route."
    },
    {
      question: "How do I see my environmental impact?",
      answer: "Go to the Analytics page from your dashboard. There, you'll see your miles saved, trees saved, and other environmental impact metrics based on your carpooling activity."
    }
  ]

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support specialists",
      availability: "Mon-Fri 8AM-8PM EST",
      response: "Immediate assistance",
      action: "Call Now"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      availability: "24/7",
      response: "Response within 24 hours",
      action: "Send Email"
    }
  ]

  const supportResources = [
    {
      icon: BookOpen,
      title: "Help Center",
      description: "Comprehensive guides and tutorials",
      link: "#"
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      link: "#"
    },
    {
      icon: FileText,
      title: "User Manual",
      description: "Complete app documentation",
      link: "#"
    },
    {
      icon: Users,
      title: "Community Forum",
      description: "Connect with other users",
      link: "#"
    }
  ]

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="container-responsive py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            We&apos;re Here to Help
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            How Can We{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              Help You?
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Find answers to your questions, get help with any issues, or connect with our support team. We&apos;re here to make your carpooling experience smooth and enjoyable.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="/support/articles/getting-started/how-to-create-a-carpool">
                <Button variant="outline" className="min-w-[180px]">How to Create a Carpool</Button>
              </a>
              <a href="/support/articles/location-navigation/real-time-tracking">
                <Button variant="outline" className="min-w-[180px]">Live Location</Button>
              </a>
              <a href="/support/articles/community-safety/reporting-issues">
                <Button variant="outline" className="min-w-[180px]">Report a Bug</Button>
              </a>
              <a href="#get-in-touch">
                <Button variant="outline" className="min-w-[180px]">Contact Support</Button>
              </a>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#get-in-touch">
              <Button size="lg" className="btn-primary">
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Support
              </Button>
            </a>
            <a href="#help-categories">
              <Button variant="outline" size="lg">
                <BookOpen className="w-5 h-5 mr-2" />
                Browse Help Center
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section id="help-categories" className="container-responsive py-16 lg:py-24 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Do You Need Help With?
          </h2>
          <p className="text-xl text-gray-600">
            Browse our help categories to find the information you need.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {helpCategories.map((category, index) => {
            const Icon = category.icon
            // Generate category slug
            const categorySlug = category.title.toLowerCase().replace(/\s+\&\s+|\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            return (
              <Card key={index} className="hover-lift cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <CardDescription className="text-base">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {category.articles.map((article, idx) => {
                      // Generate article slug
                      const articleSlug = article.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                      return (
                        <li key={idx}>
                          <a href={`/support/articles/${categorySlug}/${articleSlug}`} className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                            {article}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                  <a href={`/support/articles/${categorySlug}`}>
                    <Button variant="ghost" className="w-full">
                      View All Articles
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Contact Methods */}
      <section id="get-in-touch" className="container-responsive py-16 lg:py-24 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600">
            Choose the best way to reach our support team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {contactMethods.map((method, index) => {
            const Icon = method.icon
            if (method.title === 'Email Support') {
              return (
                <Card key={index} className="hover-lift text-center">
                  <CardContent className="pt-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{method.title}</h3>
                    <p className="text-gray-600 mb-4">{method.description}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {method.availability}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4" />
                        {method.response}
                      </div>
                    </div>
                    <a
                      href="mailto:cidambi.nikhil@gmail.com"
                      className="w-full rounded-lg bg-green-600 text-white font-semibold py-3 text-lg hover:bg-green-700 transition-colors text-center block"
                    >
                      {method.action}
                    </a>
                  </CardContent>
                </Card>
              )
            }
            let buttonProps = {}
            if (method.title === 'Phone Support') {
              buttonProps = {
                onClick: (e: any) => {
                  e.preventDefault();
                  setShowPhoneModal(true);
                }
              }
            }
            return (
              <Card key={index} className="hover-lift text-center">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{method.title}</h3>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {method.availability}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4" />
                      {method.response}
                    </div>
                  </div>
                  <Button className="w-full" {...buttonProps}>
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Phone Modal */}
        {showPhoneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full text-center">
              <h2 className="text-2xl font-bold mb-4">Call Support</h2>
              <p className="mb-6 text-lg">Please call <span className="font-mono text-blue-600">510-270-7810</span> to reach our support team.</p>
              <div className="flex gap-4 justify-center">
                <a href="tel:5102707810" className="btn btn-primary px-4 py-2 rounded bg-blue-600 text-white">Call Now</a>
                <Button variant="outline" onClick={() => setShowPhoneModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section className="container-responsive py-16 lg:py-24 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Find quick answers to the most common questions.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="hover-lift">
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleFaq(index)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>
              {openFaq === index && (
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
} 