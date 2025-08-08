import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [currentStat, setCurrentStat] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const stats = [
    { label: 'RECs Issued', value: '12,772+', suffix: 'VREC' },
    { label: 'Facilities Registered', value: '7+', suffix: 'Active' },
    { label: 'Carbon Offset', value: '15,326+', suffix: 'kg CO2' },
    { label: 'Trees Equivalent', value: '191+', suffix: 'Trees' }
  ]

  const features = [
    {
      icon: '⚡',
      title: 'Carbon Credit Trading',
      description: 'Trade renewable energy certificates instantly on Hedera\'s fast, secure blockchain network.',
      color: 'text-yellow-500'
    },
    {
      icon: '✅',
      title: 'Transparent Verification',
      description: 'All renewable energy facilities are verified and registered with detailed capacity information.',
      color: 'text-green-500'
    },
    {
      icon: '📍',
      title: 'Real-time Tracking',
      description: 'Monitor your environmental impact with real-time carbon offset calculations and reporting.',
      color: 'text-blue-500'
    },
    {
      icon: '🏪',
      title: 'Global Marketplace',
      description: 'Access a worldwide marketplace for renewable energy certificates and carbon credits.',
      color: 'text-purple-500'
    },
    {
      icon: '📜',
      title: 'Smart Contracts',
      description: 'Automated trading and retirement processes powered by secure blockchain smart contracts.',
      color: 'text-indigo-500'
    },
    {
      icon: '🏢',
      title: 'Enterprise Solutions',
      description: 'Scalable solutions for enterprises looking to offset their carbon footprint at scale.',
      color: 'text-pink-500'
    }
  ]

  const testimonials = [
    {
      author: 'Sarah Chen',
      title: 'Energy Manager, GreenTech Corp',
      quote: 'Voltx has revolutionized how we trade renewable energy certificates. The transparency and speed are unmatched.',
      avatar: 'SC'
    },
    {
      author: 'Michael Rodriguez',
      title: 'Sustainability Director, EcoEnergy',
      quote: 'The platform makes it incredibly easy to track and retire our carbon credits. Highly recommended for any green initiative.',
      avatar: 'MR'
    },
    {
      author: 'Jennifer Park',
      title: 'CFO, Solar Dynamics',
      quote: 'Finally, a platform that combines the security of blockchain with the practicality of carbon credit trading.',
      avatar: 'JP'
    }
  ]

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="relative px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">⚡</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Voltx
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Features</a>
            <a href="#about" className="text-gray-600 hover:text-green-600 transition-colors">About</a>
            <a href="#testimonials" className="text-gray-600 hover:text-green-600 transition-colors">Testimonials</a>
            <a 
              href="/dashboard" 
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              Launch App
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Live on Hedera Testnet
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                The Future of{' '}
                <span className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Renewable Energy
                </span>{' '}
                Certificates
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Trade, mint, and retire renewable energy certificates on Hedera's enterprise-grade blockchain. 
                Join the revolution in sustainable energy trading with transparent, secure, and instant transactions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <a 
                  href="/dashboard"
                  className="group bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  Start Trading RECs
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <a 
                  href="https://voltx-app.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-green-500 hover:text-green-600 transition-all duration-300 flex items-center justify-center"
                >
                  View Live Demo
                  <span className="ml-2">▶</span>
                </a>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    className={`text-center transform transition-all duration-500 ${
                      currentStat === index ? 'scale-110' : 'scale-100'
                    }`}
                  >
                    <div className={`text-2xl font-bold ${
                      currentStat === index ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                    <div className="text-xs text-green-500">{stat.suffix}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">⚡</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Solar Farm Certificate</h3>
                        <p className="text-sm text-gray-500">SOLAR-MEGA-001</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">1,500</div>
                      <div className="text-sm text-gray-500">VREC</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium">California, USA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity</span>
                      <span className="font-medium">2,500 MW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CO₂ Offset</span>
                      <span className="font-medium text-green-600">1,800 kg</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300">
                    Trade Certificate
                  </button>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-2xl">☀️</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-xl">💨</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Sustainable Trading
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of renewable energy certificate trading with cutting-edge blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built on Hedera's Enterprise Blockchain
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Voltx leverages Hedera's hashgraph technology to provide fast, secure, and energy-efficient 
                transactions for renewable energy certificates. Our platform ensures transparency, immutability, 
                and scalability for the future of sustainable energy trading.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Near-Instant Transactions</h4>
                    <p className="text-gray-600">Process REC trades in seconds, not minutes or hours</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Energy Efficient</h4>
                    <p className="text-gray-600">Carbon-negative blockchain technology for sustainable trading</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Enterprise Security</h4>
                    <p className="text-gray-600">Bank-grade security with transparent audit trails</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Platform Statistics</h3>
                  <p className="text-gray-600">Real-time network activity</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                    <span className="text-gray-700">Total Supply</span>
                    <span className="font-bold text-green-600">12,772.5 VREC</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                    <span className="text-gray-700">Retired Tokens</span>
                    <span className="font-bold text-blue-600">162.5 VREC</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                    <span className="text-gray-700">Active Facilities</span>
                    <span className="font-bold text-purple-600">7 Facilities</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-xl">
                    <span className="text-gray-700">Network</span>
                    <span className="font-bold text-yellow-600">Hedera Testnet</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600">
              See what our users are saying about Voltx
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                    <p className="text-sm text-gray-600">{testimonial.title}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic leading-relaxed">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Trading Renewable Energy Certificates?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of users already making an impact with sustainable energy trading
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/dashboard"
              className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center"
            >
              Launch Voltx App
              <span className="ml-2">→</span>
            </a>
            <a 
              href="https://github.com/sambitsargam/Voltx"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-green-600 transition-all duration-300 flex items-center justify-center"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">⚡</span>
              </div>
              <span className="text-2xl font-bold text-white">Voltx</span>
            </div>
            
            <div className="flex space-x-6 text-gray-400">
              <a href="https://github.com/sambitsargam/Voltx" className="hover:text-white transition-colors">GitHub</a>
              <a href="https://voltx-app.vercel.app/" className="hover:text-white transition-colors">Demo</a>
              <a href="https://hashscan.io/testnet" className="hover:text-white transition-colors">Explorer</a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Voltx. Built with ❤️ for the Hedera ecosystem and sustainable energy future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
