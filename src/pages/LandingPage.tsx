
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Droplets, LayoutGrid, LineChart } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5DEFF] to-[#D3E4FD]">
      {/* Hero Section */}
      <header className="container mx-auto px-4 pt-10 pb-16">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <Droplets className="h-8 w-8 text-[#7E69AB]" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] bg-clip-text text-transparent">
              AquaMint
            </span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" className="text-gray-700">
              Docs
            </Button>
            <Button variant="ghost" className="text-gray-700">
              About
            </Button>
            <Button className="bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] hover:opacity-90 transition-opacity">
              Connect Wallet
            </Button>
          </div>
        </nav>

        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] bg-clip-text text-transparent">
              Create Liquidity Pools with Ease
            </h1>
            <p className="text-lg text-gray-700 md:pr-12">
              The simplest way to create and manage liquidity pools for your tokens. Boost your DeFi project with AquaMint's intuitive pool creation tools.
            </p>
            <div className="pt-4 flex gap-4">
              <Button 
                asChild
                className="px-6 py-6 text-lg font-medium bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] hover:opacity-90 transition-opacity shadow-md"
              >
                <Link to="/create-pool">
                  Create Pool
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" className="px-6 py-6 text-lg font-medium">
                Learn More
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <Droplets className="h-20 w-20 mx-auto text-[#7E69AB] mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200/70 rounded-full w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200/70 rounded-full w-5/6 mx-auto"></div>
                <div className="h-4 bg-gray-200/70 rounded-full w-4/5 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white/40">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose AquaMint</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 p-6 rounded-xl shadow-md">
              <Droplets className="h-12 w-12 text-[#7E69AB] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Simple Pool Creation</h3>
              <p className="text-gray-600">Create liquidity pools with just a few clicks. No complex setups or hidden fees.</p>
            </div>
            
            <div className="bg-white/80 p-6 rounded-xl shadow-md">
              <LayoutGrid className="h-12 w-12 text-[#33C3F0] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Multiple Pairs Support</h3>
              <p className="text-gray-600">Support for all ERC-20 tokens with automatic pair detection and verification.</p>
            </div>
            
            <div className="bg-white/80 p-6 rounded-xl shadow-md">
              <LineChart className="h-12 w-12 text-[#7E69AB] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Real-time Analytics</h3>
              <p className="text-gray-600">Monitor your pool's performance with detailed analytics and insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] bg-clip-text text-transparent">
            Ready to Create Your First Pool?
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of projects already using AquaMint to provide liquidity for their tokens.
          </p>
          <Button 
            asChild
            className="px-8 py-6 text-lg font-medium bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] hover:opacity-90 transition-opacity shadow-md"
          >
            <Link to="/create-pool">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/30 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Droplets className="h-6 w-6 text-[#7E69AB]" />
              <span className="text-lg font-bold bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] bg-clip-text text-transparent">
                AquaMint
              </span>
            </div>
            <div className="text-sm text-gray-600">
              AquaMint DEX © 2025. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
