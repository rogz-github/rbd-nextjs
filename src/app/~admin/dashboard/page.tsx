'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Share2,
  MoreVertical
} from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalUsers: number
}

interface RecentOrder {
  id: number
  customer: string
  total: number
  status: string
  date: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'
    const isAdminByProperty = (session?.user as any)?.isAdmin

    if (!session || (!isAdmin && !isAdminByProperty)) {
      router.push('/~admin')
      return
    }
    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      // For now, use mock data since API endpoints don't exist yet
      // TODO: Replace with actual API calls when endpoints are implemented
      const mockProducts = [
        { id: 1, name: 'Sample Product 1', price: 29.99 },
        { id: 2, name: 'Sample Product 2', price: 49.99 },
        { id: 3, name: 'Sample Product 3', price: 19.99 }
      ]

      const mockOrders = [
        { id: 1, customer: 'John Doe', total: 79.98, status: 'completed', date: '2024-01-15' },
        { id: 2, customer: 'Jane Smith', total: 129.97, status: 'pending', date: '2024-01-14' },
        { id: 3, customer: 'Bob Johnson', total: 59.99, status: 'shipped', date: '2024-01-13' },
        { id: 4, customer: 'Alice Brown', total: 89.99, status: 'completed', date: '2024-01-12' },
        { id: 5, customer: 'Charlie Wilson', total: 199.99, status: 'pending', date: '2024-01-11' }
      ]

      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'USER' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'USER' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'USER' }
      ]

      setStats({
        totalProducts: mockProducts.length,
        totalOrders: mockOrders.length,
        totalRevenue: mockOrders.reduce((sum: number, order: any) => sum + Number(order.total), 0),
        totalUsers: mockUsers.length
      })

      setRecentOrders(mockOrders.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set default values on error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0
      })
      setRecentOrders([])
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 lg:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold mb-2">Congratulations Norris! 🎉</h1>
            <p className="text-blue-100">Best seller of the month</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl lg:text-3xl font-bold">$42.8k</div>
            <div className="text-blue-100">78% of target 🚀</div>
            <button className="mt-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              View Sales
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Sales Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex space-x-1">
              <button className="p-1 hover:bg-gray-100 rounded">
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Share2 className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Sales</h3>
            <div className="text-2xl font-bold text-gray-900">245k</div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +12.5%
            </div>
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex space-x-1">
              <button className="p-1 hover:bg-gray-100 rounded">
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Share2 className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Customers</h3>
            <div className="text-2xl font-bold text-gray-900">12.5k</div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +8.2%
            </div>
          </div>
        </div>

        {/* Product Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex space-x-1">
              <button className="p-1 hover:bg-gray-100 rounded">
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Share2 className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Product</h3>
            <div className="text-2xl font-bold text-gray-900">1.54k</div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +2.1%
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex space-x-1">
              <button className="p-1 hover:bg-gray-100 rounded">
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Share2 className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
            <div className="text-2xl font-bold text-gray-900">$88k</div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +15.3%
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Weekly Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Overview</h3>
            <div className="flex space-x-1">
              <button className="p-1 hover:bg-gray-100 rounded">
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Share2 className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <span className="text-sm text-gray-500">45%</span>
              <span className="text-sm text-gray-900">Your sales performance is 45% 😎 better compared to last month</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <div className="text-right">
              <button className="text-sm text-blue-600 hover:text-blue-700">Details</button>
            </div>
          </div>
        </div>

        {/* Total Earning */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">Total Earning</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Last 28 Days</button>
              <button className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-full">Last Month</button>
              <button className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-full">Last Year</button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-2xl lg:text-3xl font-bold text-gray-900">$24,895</div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">10% Compared to $84,325 last year</span>
              <span className="sm:hidden">+10%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="hidden sm:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order, index) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-700">
                          {order.customer.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                        <div className="text-sm text-gray-500 sm:hidden">@{order.customer.toLowerCase().replace(' ', '')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer.toLowerCase().replace(' ', '')}@gmail.com
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index % 2 === 0 ? 'Admin' : 'Editor'}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status === 'completed' ? 'Active' : order.status === 'pending' ? 'Pending' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}