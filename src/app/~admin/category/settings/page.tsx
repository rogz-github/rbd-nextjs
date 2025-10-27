'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Settings, 
  Check, 
  X, 
  Eye, 
  EyeOff,
  RefreshCw,
  Info,
  Filter,
  Search,
  FileJson,
  Download,
  Copy,
  X as CloseIcon
} from 'lucide-react'
import Image from 'next/image'

interface CategoryOne {
  pcstId: number
  pcstImg: string
  pcstSlug: string
  pcstCat: string
  totalProduct: number
  pcstPosition: number
  banner?: string | null
  imageVector: string
  seoTitle: string
  seoDesc: string
  createdAt: Date
  updatedAt: Date
}

interface CategoryTwo {
  psstId: number
  psstImg: string
  psstPcstCat: string
  psstSlug: string
  psstSubcat: string
  psstTotalProduct: number
  psstPosition: number
  toShow: number
  seoTitle: string
  seoDesc: string
}

interface CategoryThree {
  pssstId: number
  pssstImg: string
  pssstCat: string
  pssstSubcat: string
  pssstSubsubcat: string
  pssstSlug: string
  pssstTotalProduct: number
  pssstPosition: number
  seoTitle: string
  seoDesc: string
}

interface CategoryFour {
  psssstId: number
  psssstImg: string
  psssstCat: string
  psssstSubcat: string
  psssstSubsubcat: string
  psssstSubsubsubcat: string
  psssstSlug: string
  psssstTotalProduct: number
  psssstPosition: number
  seoTitle: string
  seoDesc: string
}

export default function CategoriesSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<'one' | 'two' | 'three' | 'four'>('one')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null)
  const [showJsonModal, setShowJsonModal] = useState(false)
  const [jsonContent, setJsonContent] = useState<string>('')
  
  // Data states
  const [categoryOneData, setCategoryOneData] = useState<CategoryOne[]>([])
  const [categoryTwoData, setCategoryTwoData] = useState<CategoryTwo[]>([])
  const [categoryThreeData, setCategoryThreeData] = useState<CategoryThree[]>([])
  const [categoryFourData, setCategoryFourData] = useState<CategoryFour[]>([])
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterByShow, setFilterByShow] = useState<'all' | 'show' | 'hide'>('all')
  const [filterByProducts, setFilterByProducts] = useState<'all' | 'with' | 'without'>('all')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || !session.user?.isAdmin) {
      router.push('/~admin')
      return
    }

    fetchAllData()
  }, [session, status, router])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [oneRes, twoRes, threeRes, fourRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/category-two'),
        fetch('/api/admin/category-three?limit=1000'),
        fetch('/api/admin/category-four?limit=1000')
      ])
      
      const oneData = await oneRes.json()
      const twoData = await twoRes.json()
      const threeData = await threeRes.json()
      const fourData = await fourRes.json()
      
      setCategoryOneData(Array.isArray(oneData) ? oneData : [])
      setCategoryTwoData(Array.isArray(twoData) ? twoData : [])
      setCategoryThreeData(threeData?.categories || [])
      setCategoryFourData(fourData?.categories || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleShow = async (categoryId: number, currentShow: number, slug: string, categoryType: string) => {
    try {
      const newShow = currentShow === 1 ? 0 : 1
      
      let endpoint = ''
      let updateData = {}
      
      switch (categoryType) {
        case 'two':
          endpoint = `/api/admin/category-two/${slug}`
          updateData = { toShow: newShow }
          setCategoryTwoData(prev => 
            prev.map(cat => cat.psstId === categoryId ? { ...cat, toShow: newShow } : cat)
          )
          break
        default:
          return
      }
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update')
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
      alert('Failed to update category visibility')
    }
  }

  const handleViewJson = async () => {
    try {
      const response = await fetch('/categories.json')
      if (response.ok) {
        const jsonData = await response.text()
        setJsonContent(jsonData)
        setShowJsonModal(true)
      } else {
        alert('categories.json file not found. Please generate it first.')
      }
    } catch (error) {
      console.error('Error loading categories.json:', error)
      alert('Failed to load categories.json file')
    }
  }

  const handleGenerateJSON = async () => {
    setGenerating(true)
    setGenerateSuccess(null)
    
    try {
      const response = await fetch('/api/admin/categories/generate-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setGenerateSuccess(`Generated successfully! ${data.categoriesCount.level1} level 1, ${data.categoriesCount.level2} level 2, ${data.categoriesCount.level3} level 3, ${data.categoriesCount.level4} level 4 categories`)
        
        // Store JSON data and show modal instead of redirecting
        setJsonContent(data.jsonData)
        setShowJsonModal(true)
      } else {
        alert(`Failed to generate categories.json: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error generating categories.json:', error)
      alert('Failed to generate categories.json')
    } finally {
      setGenerating(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setGenerateSuccess(null), 3000)
    }
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonContent)
    alert('JSON copied to clipboard!')
  }

  const handleDownloadJson = () => {
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'categories.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filterCategories = (categories: any[]) => {
    return categories.filter(cat => {
      // Search filter
      const matchesSearch = !searchTerm || 
        (cat.pcstCat || cat.psstSubcat || cat.pssstSubsubcat || cat.psssstSubsubsubcat || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      
      // Show/hide filter (for category two)
      const matchesShow = filterByShow === 'all' || 
        ('toShow' in cat ? 
          (filterByShow === 'show' && cat.toShow === 1) || 
          (filterByShow === 'hide' && cat.toShow === 0)
        : true)
      
      // Products filter
      const productCount = cat.totalProduct || cat.psstTotalProduct || cat.pssstTotalProduct || cat.psssstTotalProduct || 0
      const matchesProducts = filterByProducts === 'all' ||
        (filterByProducts === 'with' && productCount > 0) ||
        (filterByProducts === 'without' && productCount === 0)
      
      return matchesSearch && matchesShow && matchesProducts
    })
  }

  const getImageSrc = (imgPath: string | null | undefined) => {
    if (!imgPath) return '/placeholder-product.jpg'
    return imgPath.startsWith('/') ? imgPath : `/${imgPath}`
  }

  const renderCategoryOne = () => {
    const filtered = filterCategories(categoryOneData)
    
    return (
      <div className="space-y-4">
        {filtered.map((category) => (
          <div key={category.pcstId} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={getImageSrc(category.pcstImg)}
                    alt={category.pcstCat}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">{category.pcstCat}</h3>
                  <p className="text-sm text-gray-500">Slug: {category.pcstSlug}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-600">Products: {category.totalProduct}</span>
                    <span className="text-xs text-gray-600">Position: {category.pcstPosition}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No categories found matching your filters</p>
          </div>
        )}
      </div>
    )
  }

  const renderCategoryTwo = () => {
    const filtered = filterCategories(categoryTwoData)
    
    return (
      <div className="space-y-4">
        {filtered.map((category) => (
          <div key={category.psstId} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={getImageSrc(category.psstImg)}
                    alt={category.psstSubcat}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">{category.psstSubcat}</h3>
                  <p className="text-sm text-gray-500">Parent: {category.psstPcstCat}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-600">Products: {category.psstTotalProduct}</span>
                    <span className="text-xs text-gray-600">Position: {category.psstPosition}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleShow(category.psstId, category.toShow, category.psstSlug, 'two')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    category.toShow === 1
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.toShow === 1 ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No categories found matching your filters</p>
          </div>
        )}
      </div>
    )
  }

  const renderCategoryThree = () => {
    const filtered = filterCategories(categoryThreeData)
    
    return (
      <div className="space-y-4">
        {filtered.map((category) => (
          <div key={category.pssstId} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={getImageSrc(category.pssstImg)}
                    alt={category.pssstSubsubcat}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">{category.pssstSubsubcat}</h3>
                  <p className="text-sm text-gray-500">{category.pssstCat} / {category.pssstSubcat}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-600">Products: {category.pssstTotalProduct}</span>
                    <span className="text-xs text-gray-600">Position: {category.pssstPosition}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No categories found matching your filters</p>
          </div>
        )}
      </div>
    )
  }

  const renderCategoryFour = () => {
    const filtered = filterCategories(categoryFourData)
    
    return (
      <div className="space-y-4">
        {filtered.map((category) => (
          <div key={category.psssstId} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={getImageSrc(category.psssstImg)}
                    alt={category.psssstSubsubsubcat}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">{category.psssstSubsubsubcat}</h3>
                  <p className="text-sm text-gray-500">{category.psssstCat} / {category.psssstSubcat} / {category.psssstSubsubcat}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-600">Products: {category.psssstTotalProduct}</span>
                    <span className="text-xs text-gray-600">Position: {category.psssstPosition}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No categories found matching your filters</p>
          </div>
        )}
      </div>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories settings...</p>
        </div>
      </div>
    )
  }

  if (!session || !session.user?.isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {generateSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            {generateSuccess}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 mr-2" />
              Categories Settings
            </h1>
            <p className="text-gray-600 mt-1">Manage and configure category visibility and display settings</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchAllData}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={() => handleViewJson()}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View JSON</span>
            </button>
            
            <button
              onClick={handleGenerateJSON}
              disabled={generating}
              className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                generating 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <FileJson className="w-4 h-4" />
              <span>{generating ? 'Generating...' : 'Generate JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {(['one', 'two', 'three', 'four'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Category {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'one' ? categoryOneData.length : tab === 'two' ? categoryTwoData.length : tab === 'three' ? categoryThreeData.length : categoryFourData.length})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {activeTab === 'two' && (
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterByShow}
                onChange={(e) => setFilterByShow(e.target.value as 'all' | 'show' | 'hide')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Visibility</option>
                <option value="show">Visible Only</option>
                <option value="hide">Hidden Only</option>
              </select>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterByProducts}
              onChange={(e) => setFilterByProducts(e.target.value as 'all' | 'with' | 'without')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Products</option>
              <option value="with">With Products</option>
              <option value="without">Without Products</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6 min-h-[500px]">
        {activeTab === 'one' && renderCategoryOne()}
        {activeTab === 'two' && renderCategoryTwo()}
        {activeTab === 'three' && renderCategoryThree()}
        {activeTab === 'four' && renderCategoryFour()}
      </div>

      {/* JSON Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Categories JSON</h2>
                <p className="text-sm text-gray-600 mt-1">Generated categories data</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyJson}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <pre className="bg-gray-50 p-4 rounded-lg border overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {jsonContent}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end p-6 border-t">
              <button
                onClick={() => setShowJsonModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
