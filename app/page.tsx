import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Box,
  Truck,
  ShieldCheck,
  LineChart,
  Building2,
} from "lucide-react";

const HomePage = () => {
  const features = [
    {
      icon: <Box className="w-12 h-12 text-blue-600" />,
      title: "Product Tracking",
      description:
        "Real-time tracking of products through every stage of the supply chain with blockchain verification",
    },
    {
      icon: <Truck className="w-12 h-12 text-blue-600" />,
      title: "Transport Monitoring",
      description:
        "Monitor transport conditions including temperature, humidity, and delivery timelines",
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-blue-600" />,
      title: "Blockchain Security",
      description:
        "Immutable records of every transaction secured by blockchain technology",
    },
    {
      icon: <LineChart className="w-12 h-12 text-blue-600" />,
      title: "Analytics Dashboard",
      description:
        "Comprehensive analytics and reporting for supply chain optimization",
    },
    {
      icon: <MapPin className="w-12 h-12 text-blue-600" />,
      title: "Location Tracking",
      description:
        "Track product locations and manage multiple warehouses and distribution centers",
    },
    {
      icon: <Building2 className="w-12 h-12 text-blue-600" />,
      title: "Multi-Organization Support",
      description:
        "Manage multiple organizations with role-based access control",
    },
  ];

  const stages = [
    { name: "Production", color: "bg-green-500" },
    { name: "Transport", color: "bg-blue-500" },
    { name: "Storage", color: "bg-purple-500" },
    { name: "Delivery", color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Blockchain-Powered Supply Chain Tracking
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Secure, transparent, and efficient supply chain management with
              real-time tracking and blockchain verification
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Get Started
              </button>
              <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Supply Chain Stages */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Track Every Stage of Your Supply Chain
          </h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {stages.map((stage, index) => (
              <div key={stage.name} className="flex items-center">
                <div className={`${stage.color} w-4 h-4 rounded-full`} />
                <span className="ml-2 text-gray-700">{stage.name}</span>
                {index < stages.length - 1 && (
                  <div className="mx-4 h-0.5 w-8 bg-gray-300 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Supply Chain?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join organizations worldwide using our platform to ensure
            transparency and efficiency in their supply chains
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Start Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
