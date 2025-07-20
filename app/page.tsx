"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
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
  Github,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Smart Image Management",
    description: "Upload your photos or dive into our vast Pexels library—arrange and layer with ease!",
    color: "from-orange-400 to-orange-600",
  },
  {
    icon: Wand2,
    title: "Professional AI Enhancement",
    description: "One click turns your collage into a polished masterpiece—customize with your vision!",
    color: "from-amber-400 to-amber-600",
  },
  {
    icon: Sparkles,
    title: "Iterative Refinement",
    description: "Refine endlessly with smart suggestions and custom prompts for perfection.",
    color: "from-orange-500 to-amber-500",
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
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center relative">
                <NextImage
                  src="/favicon.png"
                  alt="Easy Assets Logo"
                  width={40}
                  height={40}
                  className="object-contain scale-x-[-1]"
                />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Easy Assets
                </span>
                <div className="text-xs text-gray-500 -mt-1">AI-Powered Creativity</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-gray-600 hover:text-orange-600">
                Features
              </Button>
              <a
                href="https://github.com/KrzysztofStaron/easy-assets"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-gray-600 hover:text-orange-600"
              >
                <Github className="w-5 h-5" />
              </a>
              <Button
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                onClick={() => router.push("/app")}
              >
                Start Creating Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 to-amber-100/20 rounded-3xl"></div>
        <div className="max-w-6xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Transform Your Ideas into Flawless Visuals with AI
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Unleash Your Creativity with
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
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
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              onClick={() => router.push("/app")}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Creating Now – Free!
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-4 relative z-10 overflow-hidden">
              <img
                src="/landing.jpg"
                alt="AI-powered collage transformation showcase"
                className="w-full h-auto rounded-xl"
                style={{ maxHeight: "500px", objectFit: "cover" }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-200/20 to-amber-200/20 rounded-2xl transform rotate-3"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-orange-200/20 rounded-2xl transform -rotate-3"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gray-900">Why Choose </span>
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
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
                className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-orange-200"
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
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl p-12 max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-gray-900">
                  No design skills? <span className="text-orange-600">No problem!</span>
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
                    <useCase.icon className="w-8 h-8 text-orange-500 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">{useCase.title}</h4>
                    <p className="text-sm text-gray-600">{useCase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-amber-600">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Vision with AI?</h2>
            <p className="text-xl text-orange-100 mb-12 max-w-2xl mx-auto">
              Join thousands of creators who've discovered the magic of AI-powered visual creation. Start your journey
              today – completely free!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-50 px-10 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                onClick={() => router.push("/app")}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Creating Now – Free!
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="text-orange-100 text-sm">
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
              <div className="w-10 h-10 flex items-center justify-center relative">
                <NextImage
                  src="/favicon.png"
                  alt="Easy Assets Logo"
                  width={40}
                  height={40}
                  className="object-contain scale-x-[-1]"
                />
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
