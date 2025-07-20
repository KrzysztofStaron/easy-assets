"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Upload,
  Wand2,
  Share2,
  ArrowRight,
  Play,
  Star,
  Users,
  Palette,
  Image,
  Download,
  Heart,
  CheckCircle,
  ChevronRight,
  Camera,
  Layers,
  MagnetIcon as Magic,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Smart Image Management",
    description: "Upload your photos or dive into our vast Pexels library—arrange and layer with ease!",
    color: "from-sky-400 to-sky-600",
  },
  {
    icon: Wand2,
    title: "Professional AI Enhancement",
    description: "One click turns your collage into a polished masterpiece—customize with your vision!",
    color: "from-purple-400 to-purple-600",
  },
  {
    icon: Sparkles,
    title: "Iterative Refinement",
    description: "Refine endlessly with smart suggestions and custom prompts for perfection.",
    color: "from-sky-500 to-purple-500",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Social Media Manager",
    content: "Easy Assets transformed my workflow! I create stunning posts in minutes instead of hours.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Mike Rodriguez",
    role: "Small Business Owner",
    content: "No design skills? No problem! Easy Assets makes me look like a pro designer.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Emma Thompson",
    role: "Content Creator",
    content: "The AI suggestions are incredible. It's like having a creative partner that never runs out of ideas.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

const useCases = [
  { icon: Share2, title: "Social Media Posts", description: "Eye-catching content for all platforms" },
  { icon: Palette, title: "Marketing Materials", description: "Professional designs for campaigns" },
  { icon: Heart, title: "Personal Projects", description: "Beautiful memories and celebrations" },
  { icon: Users, title: "Team Presentations", description: "Engaging visuals for meetings" },
];

export default function EasyAssetsLanding() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-sky-400 to-purple-500 rounded-xl flex items-center justify-center relative">
                <div className="text-white font-bold text-lg">EA</div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-purple-500" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
                  Easy Assets
                </span>
                <div className="text-xs text-gray-500 -mt-1">AI-Powered Creativity</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-gray-600 hover:text-sky-600">
                Features
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-sky-600">
                Pricing
              </Button>
              <Button className="bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white">
                Start Creating Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-100/20 to-purple-100/20 rounded-3xl"></div>
        <div className="max-w-6xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-100 to-purple-100 border border-sky-200 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
              Transform Your Ideas into Flawless Visuals with AI
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Unleash Your Creativity with
            </span>
            <br />
            <span className="bg-gradient-to-r from-sky-500 to-purple-500 bg-clip-text text-transparent">
              AI-Powered Collage Magic!
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your ideas into stunning, professional visuals in just minutes.
            <span className="font-semibold text-gray-800">
              {" "}
              Upload, enhance, and share professional visuals effortlessly.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Creating Now – Free!
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-2 border-sky-200 hover:bg-sky-50 text-sky-600 bg-white/80 backdrop-blur-sm"
            >
              <Play className="w-5 h-5 mr-2" />
              Explore AI Enhancements
            </Button>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="aspect-square bg-gradient-to-br from-sky-100 to-sky-200 rounded-lg flex items-center justify-center">
                  <Image className="w-8 h-8 text-sky-600" />
                </div>
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                  <Camera className="w-8 h-8 text-purple-600" />
                </div>
                <div className="aspect-square bg-gradient-to-br from-sky-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <Layers className="w-8 h-8 text-sky-600" />
                </div>
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-sky-100 rounded-lg flex items-center justify-center">
                  <Magic className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-sky-50 to-purple-50 rounded-lg">
                <Wand2 className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700 font-medium">AI Enhancement Complete!</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-sky-200/20 to-purple-200/20 rounded-2xl transform rotate-3"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 to-sky-200/20 rounded-2xl transform -rotate-3"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gray-900">Why Choose </span>
              <span className="bg-gradient-to-r from-sky-500 to-purple-500 bg-clip-text text-transparent">
                Easy Assets
              </span>
              <span className="text-gray-900">?</span>
            </h2>
            <p className="text-xl text-gray-600">
              Empowering creators of all levels to craft professional-quality digital assets effortlessly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-sky-200"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <CardContent className="p-0">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-sky-50 to-purple-50 rounded-3xl p-12 max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-gray-900">
                  No design skills? <span className="text-sky-600">No problem!</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Easy Assets makes you a pro with AI-driven tools</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Save time and impress with ready-to-share, high-quality visuals</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">
                      From social posts to marketing materials, create anything with confidence
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {useCases.map((useCase, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                    <useCase.icon className="w-8 h-8 text-sky-500 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">{useCase.title}</h4>
                    <p className="text-sm text-gray-600">{useCase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-br from-sky-50 to-purple-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Join thousands of creators turning ideas into art with Easy Assets!
            </h2>
            <div className="flex items-center justify-center gap-2 text-sky-600 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current" />
              ))}
              <span className="ml-2 text-gray-700 font-medium">4.9/5 from 2,847 creators</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm border border-sky-100">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sky-600 to-purple-600">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Vision with AI?</h2>
            <p className="text-xl text-sky-100 mb-12 max-w-2xl mx-auto">
              Join thousands of creators who've discovered the magic of AI-powered visual creation. Start your journey
              today – completely free!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                size="lg"
                className="bg-white text-sky-600 hover:bg-gray-50 px-10 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Creating Now – Free!
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg border-2 border-white/30 hover:bg-white/10 text-white bg-transparent backdrop-blur-sm"
              >
                <Download className="w-5 h-5 mr-2" />
                Explore AI Enhancements
              </Button>
            </div>

            <div className="text-sky-100 text-sm">
              ✓ No credit card required • ✓ Start creating instantly • ✓ Professional results guaranteed
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-sky-400 to-purple-500 rounded-xl flex items-center justify-center relative">
                <div className="text-white font-bold text-lg">EA</div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-purple-500" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold">Easy Assets</span>
                <div className="text-xs text-gray-400 -mt-1">Transform Your Vision with AI</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 Easy Assets | Transform Your Vision with AI | Terms | Privacy | Contact
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
