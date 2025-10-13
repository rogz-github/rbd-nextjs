'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut, getSession } from 'next-auth/react'
import { useCart } from '@/context/cart-context'
import { Search, ShoppingCart, User, Heart, Car, Menu, X, Facebook, Twitter, Instagram, LogOut } from 'lucide-react'
import RbdLogo from '@/components/RbdLogo'
import { toast } from 'react-hot-toast'

export function UserHeader() {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('MENU')
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)
  const [accountDropdownTimeout, setAccountDropdownTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { data: session, status } = useSession()
  const { state, clearCart } = useCart()

  // Logout handler
  const handleLogout = async () => {
    try {
      // Call custom logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        // Show logout success message
        toast.success('Logged out successfully')
      }
      
      // Use NextAuth signOut with redirect
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
      
    } catch (error) {
      // Fallback: force page reload
      window.location.href = '/'
    }
  }

  // Force session refresh on component mount
  useEffect(() => {
    const refreshSession = async () => {
      await getSession()
    }
    refreshSession()
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (accountDropdownTimeout) {
        clearTimeout(accountDropdownTimeout)
      }
    }
  }, [accountDropdownTimeout])

  const categories = [
    'HOME, GARDEN & TOOLS',
    'OUTDOOR',
    'BEAUTY & HEALTH',
    'ELECTRONICS',
    'AUTOMOTIVE',
    'INDUSTRIAL',
    'CLOTHING, SHOES & JEWELRY',
    'ALL'
  ]

  const megaMenuData = {
    'HOME, GARDEN & TOOLS': {
      sections: [
        {
          title: 'HOME IMPROVEMENT',
          items: [
            'BUILDING SUPPLIES',
            'EVENT & PARTY SUPPLIES',
            'HEATING & COOLING',
            'HOME DECOR',
            'KITCHEN & BATH FIXTURES',
            'LAWN & GARDEN EQUIPMENT',
            'LIGHTING & CEILING FANS',
            'POWER & HAND TOOLS',
            'SAFETY & SECURITY',
            'STORAGE & HOME ORGANIZATION',
            'CLEANING SUPPLIES',
            'HARDWARE',
            'HEATING, COOLING & AIR QUALITY',
            'IRONS & STEAMERS',
            'KIDS\' HOME STORE',
            'LIGHT BULBS',
            'PAINTING SUPPLIES & WALL TREATMENTS',
            'ROUGH PLUMBING',
            'SEASONAL DECOR',
            'STORAGE & ORGANIZATION'
          ]
        },
        {
          title: 'FURNITURE',
          items: [
            'BEDROOM',
            'ACCENT FURNITURE',
            'BATHROOM FURNITURE',
            'FURNITURE',
            'HOME ENTERTAINMENT',
            'KIDS\' FURNITURE',
            'NURSERY FURNITURE',
            'REPLACEMENT PARTS',
            'CAMPING FURNITURE'
          ]
        },
        {
          title: 'KITCHEN & DINING',
          items: [
            'BAKEWARE',
            'COMFORT ZONE',
            'KITCHEN & DINING ROOM',
            'ENTRYWAY FURNITURE',
            'GAME & RECREATION ROOM',
            'HOME OFFICE FURNITURE',
            'LIVING ROOM',
            'PATIO FURNITURE',
            'RUGS',
            'COFFEE, TEA & ESPRESSO'
          ]
        }
      ],
      promotionalImage: {
        title: 'UPTO 70% OFF',
        description: 'Modern Shed Collection'
      }
    },
    'OUTDOOR': {
      sections: [
        {
          title: 'OUTDOOR FURNITURE',
          items: [
            'PATIO FURNITURE',
            'GARDEN FURNITURE',
            'OUTDOOR DINING SETS',
            'OUTDOOR SEATING',
            'UMBRELLAS & SHADES',
            'OUTDOOR STORAGE',
            'GARDEN DECOR'
          ]
        },
        {
          title: 'GARDEN & LANDSCAPING',
          items: [
            'GARDEN TOOLS',
            'PLANTING SUPPLIES',
            'SOIL & FERTILIZERS',
            'GARDEN HOSES',
            'SPRINKLERS',
            'GARDEN LIGHTING',
            'LANDSCAPING MATERIALS'
          ]
        },
        {
          title: 'OUTDOOR ACTIVITIES',
          items: [
            'CAMPING GEAR',
            'HIKING EQUIPMENT',
            'OUTDOOR COOKING',
            'SPORTS EQUIPMENT',
            'OUTDOOR GAMES',
            'WATER SPORTS',
            'WINTER SPORTS'
          ]
        }
      ],
      promotionalImage: {
        title: 'SUMMER SALE',
        description: 'Outdoor Collection'
      }
    },
    'BEAUTY & HEALTH': {
      sections: [
        {
          title: 'SKINCARE',
          items: [
            'FACIAL CLEANSERS',
            'MOISTURIZERS',
            'SERUMS & TREATMENTS',
            'SUNSCREEN',
            'ANTI-AGING',
            'ACNE TREATMENT',
            'EYE CARE',
            'LIP CARE'
          ]
        },
        {
          title: 'MAKEUP',
          items: [
            'FACE MAKEUP',
            'EYE MAKEUP',
            'LIP PRODUCTS',
            'NAIL CARE',
            'MAKEUP TOOLS',
            'BRUSHES & APPLICATORS',
            'MAKEUP REMOVERS'
          ]
        },
        {
          title: 'HEALTH & WELLNESS',
          items: [
            'VITAMINS & SUPPLEMENTS',
            'FITNESS EQUIPMENT',
            'WEIGHT MANAGEMENT',
            'HEALTH MONITORS',
            'MEDICAL SUPPLIES',
            'PERSONAL CARE',
            'ORAL CARE'
          ]
        }
      ],
      promotionalImage: {
        title: 'BEAUTY DEALS',
        description: 'Health & Beauty'
      }
    },
    'ELECTRONICS': {
      sections: [
        {
          title: 'COMPUTERS & TABLETS',
          items: [
            'LAPTOPS',
            'DESKTOPS',
            'TABLETS',
            'COMPUTER ACCESSORIES',
            'MONITORS',
            'KEYBOARDS & MICE',
            'STORAGE DEVICES'
          ]
        },
        {
          title: 'MOBILE & ACCESSORIES',
          items: [
            'SMARTPHONES',
            'PHONE CASES',
            'CHARGERS & CABLES',
            'HEADPHONES',
            'BLUETOOTH SPEAKERS',
            'MOBILE ACCESSORIES'
          ]
        },
        {
          title: 'HOME ELECTRONICS',
          items: [
            'TVS & DISPLAYS',
            'AUDIO SYSTEMS',
            'SMART HOME',
            'CAMERAS & PHOTOGRAPHY',
            'GAMING CONSOLES',
            'SMALL APPLIANCES'
          ]
        }
      ],
      promotionalImage: {
        title: 'TECH SALE',
        description: 'Latest Electronics'
      }
    },
    'AUTOMOTIVE': {
      sections: [
        {
          title: 'AUTO PARTS',
          items: [
            'ENGINE PARTS',
            'BRAKE COMPONENTS',
            'FILTERS & FLUIDS',
            'ELECTRICAL PARTS',
            'SUSPENSION PARTS',
            'EXHAUST SYSTEMS',
            'COOLING SYSTEM'
          ]
        },
        {
          title: 'AUTO ACCESSORIES',
          items: [
            'INTERIOR ACCESSORIES',
            'EXTERIOR ACCESSORIES',
            'CAR ELECTRONICS',
            'LIGHTING',
            'TOOLS & EQUIPMENT',
            'CLEANING SUPPLIES'
          ]
        },
        {
          title: 'MOTORCYCLE & ATV',
          items: [
            'MOTORCYCLE PARTS',
            'ATV ACCESSORIES',
            'RIDING GEAR',
            'HELMETS',
            'MAINTENANCE SUPPLIES'
          ]
        }
      ],
      promotionalImage: {
        title: 'AUTO DEALS',
        description: 'Car Accessories'
      }
    },
    'INDUSTRIAL': {
      sections: [
        {
          title: 'INDUSTRIAL EQUIPMENT',
          items: [
            'POWER TOOLS',
            'HAND TOOLS',
            'MEASURING TOOLS',
            'SAFETY EQUIPMENT',
            'WORKSHOP SUPPLIES',
            'MATERIAL HANDLING'
          ]
        },
        {
          title: 'CONSTRUCTION SUPPLIES',
          items: [
            'BUILDING MATERIALS',
            'HARDWARE',
            'FASTENERS',
            'ELECTRICAL SUPPLIES',
            'PLUMBING SUPPLIES',
            'INSULATION'
          ]
        },
        {
          title: 'MANUFACTURING',
          items: [
            'MACHINERY',
            'PRODUCTION EQUIPMENT',
            'QUALITY CONTROL',
            'PACKAGING SUPPLIES',
            'INDUSTRIAL CHEMICALS'
          ]
        }
      ],
      promotionalImage: {
        title: 'INDUSTRIAL SALE',
        description: 'Professional Tools'
      }
    },
    'CLOTHING, SHOES & JEWELRY': {
      sections: [
        {
          title: 'WOMEN\'S FASHION',
          items: [
            'DRESSES',
            'TOPS & BLOUSES',
            'BOTTOMS',
            'OUTERWEAR',
            'ACTIVEWEAR',
            'LINGERIE',
            'ACCESSORIES'
          ]
        },
        {
          title: 'MEN\'S FASHION',
          items: [
            'SHIRTS & POLOS',
            'PANTS & SHORTS',
            'SUITS & BLAZERS',
            'OUTERWEAR',
            'ACTIVEWEAR',
            'UNDERWEAR',
            'ACCESSORIES'
          ]
        },
        {
          title: 'SHOES & JEWELRY',
          items: [
            'WOMEN\'S SHOES',
            'MEN\'S SHOES',
            'KIDS\' SHOES',
            'WATCHES',
            'JEWELRY',
            'BAGS & WALLETS',
            'SUNGLASSES'
          ]
        }
      ],
      promotionalImage: {
        title: 'FASHION SALE',
        description: 'Latest Trends'
      }
    }
  }

  return (
    <div className="bg-white">
      {/* Top Banner */}
      <div className="bg-red-600 text-white text-center py-2 text-sm">
        <div className="container flex items-center justify-center space-x-2">
          <Car className="w-4 h-4" />
          <span>Free Shipping no minimum spend. Shop now and stay up to date on our latest products, deals, and tips!</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b relative">
        <div className="container relative">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <RbdLogo className="h-12 md:h-16" priority />
            </Link>

            {/* Search Bar - Hidden on Mobile */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4 sm:mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base bg-gray-50"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-pink-500 text-white p-2 rounded-lg hover:bg-pink-600 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4 sm:space-x-8">
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-8">
                {/* Account Dropdown */}
                <div 
                  className="relative group"
                  onMouseEnter={() => {
                    if (accountDropdownTimeout) {
                      clearTimeout(accountDropdownTimeout)
                      setAccountDropdownTimeout(null)
                    }
                    setIsAccountDropdownOpen(true)
                  }}
                  onMouseLeave={() => {
                    const timeout = setTimeout(() => {
                      setIsAccountDropdownOpen(false)
                    }, 150)
                    setAccountDropdownTimeout(timeout)
                  }}
                >
                  <div className="flex flex-col items-center space-y-1 text-gray-700 hover:text-pink-500 transition-colors cursor-pointer">
                    <User className="w-6 h-6" />
                    <span className="text-sm font-medium">
                      {status === 'loading' ? 'Loading...' : session ? 'My Account' : 'Login'}
                    </span>
              
                  </div>
                  
                  {/* Dropdown Menu */}
                  {isAccountDropdownOpen && (
                    <div className="absolute right-0 top-full w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50" style={{ zIndex: 9999 }}>
                      {status === 'loading' ? (
                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                          Loading...
                        </div>
                      ) : session ? (
                        <>
                          <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <User className="w-4 h-4 mr-3" />
                            My Profile
                          </Link>
                          <Link href="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <ShoppingCart className="w-4 h-4 mr-3" />
                            My Orders
                          </Link>
                          <hr className="my-2" />
                          <button
                            onClick={() => {
                              setIsAccountDropdownOpen(false)
                              setShowLogoutConfirm(true)
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href="/auth/signin" className="block px-4 py-3 text-center bg-pink-500 text-white font-medium rounded-md mx-2 mb-2 hover:bg-pink-600 transition-colors">
                            Log In
                          </Link>
                          <Link href="/auth/signup" className="block px-4 py-3 text-center bg-blue-500 text-white font-medium rounded-md mx-2 mb-2 hover:bg-blue-600 transition-colors">
                            Register
                          </Link>
                          <hr className="my-2" />
                          <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <User className="w-4 h-4 mr-3" />
                            My Profile
                          </Link>
                          <Link href="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <ShoppingCart className="w-4 h-4 mr-3" />
                            My Orders
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Wishlist */}
                <Link href="/wishlist" className="flex flex-col items-center space-y-1 text-gray-700 hover:text-pink-500 transition-colors">
                  <Heart className="w-6 h-6" />
                  <span className="text-sm font-medium">Wishlist</span>
                </Link>

                {/* Cart */}
                <Link href="/cart" className="flex flex-col items-center space-y-1 text-gray-700 hover:text-pink-500 transition-colors relative">
                  <div className="relative">
                    <ShoppingCart className="w-6 h-6" />
                    {state.itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {state.itemCount}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">Cart</span>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-700 hover:text-pink-500 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Desktop Only */}
      <div className="bg-white border-b relative hidden md:block">
        <div className="container">
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8 flex-wrap justify-center">
              {categories.map((category) => (
                <div
                  key={category}
                  className="relative"
                  onMouseEnter={() => {
                    if (megaMenuData[category as keyof typeof megaMenuData]) {
                      setIsMegaMenuOpen(true)
                      setActiveCategory(category)
                    }
                  }}
                  onMouseLeave={() => {
                    // Add a small delay to prevent immediate hiding when moving to submenu
                    setTimeout(() => {
                      if (!isMegaMenuOpen) {
                        setActiveCategory('')
                      }
                    }, 100)
                  }}
                >
                  <Link
                    href={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      activeCategory === category
                        ? 'text-pink-500 border-b-2 border-pink-500'
                        : 'text-gray-700 hover:text-pink-500'
                    }`}
                  >
                    {category}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        {isMegaMenuOpen && activeCategory && megaMenuData[activeCategory as keyof typeof megaMenuData] && (
          <div 
            className="absolute left-0 right-0 bg-white border-b shadow-lg z-50"
            onMouseEnter={() => {
              setIsMegaMenuOpen(true)
              setActiveCategory(activeCategory)
            }}
            onMouseLeave={() => {
              setIsMegaMenuOpen(false)
              setActiveCategory('')
            }}
          >
            <div className="container py-6 sm:py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {/* Promotional Image Column */}
                <div className="space-y-4 order-1 sm:order-1">
                  <div className="relative">
                    <div className="w-full h-32 sm:h-40 lg:h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gray-400 rounded"></div>
                        </div>
                        <span className="text-xs text-gray-600">Modern Shed</span>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                      {megaMenuData[activeCategory as keyof typeof megaMenuData].promotionalImage.title}
                    </div>
                  </div>
                </div>

                {/* Menu Sections */}
                {megaMenuData[activeCategory as keyof typeof megaMenuData].sections.map((section, index) => (
                  <div key={index} className="space-y-3 sm:space-y-4 order-2 sm:order-2">
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 bg-gray-100 px-2 sm:px-3 py-1 sm:py-2 rounded text-sm sm:text-base">
                      {section.title}
                    </h3>
                    <div className="space-y-1 sm:space-y-2">
                      {section.items.map((item) => (
                        <Link
                          key={item}
                          href={`/category/${item.toLowerCase().replace(/\s+/g, '-')}`}
                          className="block text-xs sm:text-sm text-gray-600 hover:text-pink-500 transition-colors"
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Promotional Strip */}
      <div className="bg-gray-100 text-center py-2 text-sm">
        <div className="container">
          <span className="text-gray-700">
            Extra Discount, 10% off using this coupon code sis2025 limited time only, shop now!
          </span>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>


            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('MENU')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'MENU'
                    ? 'text-pink-500 border-b-2 border-pink-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                MENU
              </button>
              <button
                onClick={() => setActiveTab('ACCOUNT')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'ACCOUNT'
                    ? 'text-pink-500 border-b-2 border-pink-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ACCOUNT
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'MENU' && (
                <div className="p-4">
                  <nav className="space-y-2">
                    {categories.map((category) => (
                      <Link
                        key={category}
                        href={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block py-3 px-2 text-gray-700 hover:text-pink-500 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category}
                      </Link>
                    ))}
                  </nav>
                </div>
              )}

              {activeTab === 'ACCOUNT' && (
                <div className="p-4">
                  <nav className="space-y-2">
                    {status === 'loading' ? (
                      <div className="px-2 py-3 text-sm text-gray-500 text-center">
                        Loading...
                      </div>
                    ) : session ? (
                      <>
                        <div className="px-2 py-3 text-sm text-gray-500 border-b border-gray-200 mb-4">
                          Welcome, {session.user?.name || session.user?.email}
                        </div>
                        <Link
                          href="/profile"
                          className="block py-3 px-2 text-gray-700 hover:text-pink-500 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href="/orders"
                          className="block py-3 px-2 text-gray-700 hover:text-pink-500 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          className="block py-3 px-2 text-gray-700 hover:text-pink-500 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Wishlist
                        </Link>
                        <Link
                          href="/cart"
                          className="block py-3 px-2 text-gray-700 hover:text-pink-500 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Cart
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false)
                            setShowLogoutConfirm(true)
                          }}
                          className="block w-full text-left py-3 px-2 text-gray-700 hover:text-pink-500 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/signin"
                          className="block py-3 px-2 text-gray-700 hover:text-pink-500 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/auth/signup"
                          className="block py-3 px-2 text-gray-700 hover:text-pink-500 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Sign Up
                        </Link>
                        <Link
                          href="/cart"
                          className="block py-3 px-2 text-gray-700 hover:text-pink-500 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Cart
                        </Link>
                      </>
                    )}
                  </nav>
                </div>
              )}
            </div>

            {/* Social Media Icons */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-center space-x-4">
                <a href="#" className="p-2 text-gray-500 hover:text-pink-500 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 text-gray-500 hover:text-pink-500 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 text-gray-500 hover:text-pink-500 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 h-screen w-screen z-[10000] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-auto transform transition-all duration-300 ease-out">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <LogOut className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mt-4 mb-2">
                ⚠️ SIGN OUT CONFIRMATION
              </h3>
              <p className="text-sm text-gray-600 text-center leading-relaxed mb-4">
                <strong>Are you sure you want to sign out?</strong> You will need to sign in again to access your profile, orders, and saved items.
              </p>
            </div>
            
            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false)
                  handleLogout()
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
