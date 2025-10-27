'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Save, Trash2, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SiteSetting {
  id: number
  key: string
  value: string
  description?: string | null
  updatedAt: Date
}

export default function SiteSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteKey, setDeleteKey] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Form fields
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    location: 'body' as 'head' | 'body',
    description: ''
  })

  useEffect(() => {
    if (status === 'loading') return

    // Only super admins can access site settings
    if (!session?.user?.isSuperAdmin) {
      router.push('/~admin')
      return
    }

    fetchSettings()
  }, [session, status, router])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/site-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || [])
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: formData.key,
          value: formData.value,
          location: formData.location,
          description: formData.description
        }),
      })

      if (response.ok) {
        toast.success('Settings saved successfully')
        setFormData({ key: '', value: '', location: 'body', description: '' })
        fetchSettings()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (key: string) => {
    try {
      const response = await fetch(`/api/admin/site-settings?key=${key}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Setting deleted successfully')
        fetchSettings()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete setting')
      }
    } catch (error) {
      console.error('Error deleting setting:', error)
      toast.error('Failed to delete setting')
    } finally {
      setShowDeleteConfirm(false)
      setDeleteKey(null)
    }
  }

  const openDeleteConfirm = (key: string) => {
    setDeleteKey(key)
    setShowDeleteConfirm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session?.user?.isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Only super admins can access site settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
        <p className="mt-2 text-gray-600">Manage custom code that appears on all pages</p>
      </div>

      {/* Security Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
        <div className="text-sm text-red-800">
          <p className="font-semibold mb-1">⚠️ Security Warning:</p>
          <p className="mb-2">Code injected here will execute on ALL pages for ALL users. This feature is restricted to super admins only.</p>
          <p className="mb-2">Use this responsibly for trusted tracking scripts (e.g., Google Analytics, Tealium).</p>
          <p className="font-semibold">Never paste untrusted or malicious code.</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">How it works:</p>
          <p>Choose where to inject your code: <strong>Head Tag</strong> (for meta tags, analytics scripts) or <strong>Body Tag</strong> (for tracking scripts, widgets).</p>
          <p className="mt-1">The code you add will be injected into all pages on your site.</p>
        </div>
      </div>

      {/* Add New Setting Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Custom Code</h2>
          <p className="text-sm text-gray-600 mt-1">Add tracking scripts, analytics, or other global code (Choose head or body tag injection)</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
                Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., analytics_code, tracking_script"
                required
              />
              <p className="text-xs text-gray-500 mt-1">A unique identifier for this code snippet</p>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Injection Location <span className="text-red-500">*</span>
              </label>
              <select
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value as 'head' | 'body' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="body">Body Tag</option>
                <option value="head">Head Tag</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Where to inject this code</p>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Google Analytics tracking"
            />
          </div>

          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
              Code <span className="text-red-500">*</span>
            </label>
            <textarea
              id="value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              rows={8}
              placeholder='<div><script type="text/javascript">...</script></div>'
              required
            />
            <p className="text-xs text-gray-500 mt-1">Paste your HTML/JavaScript code here</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Existing Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Existing Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your saved code snippets</p>
        </div>

        <div className="divide-y divide-gray-200">
          {settings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No settings configured yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first custom code above</p>
            </div>
          ) : (
            settings.map((setting) => (
              <div key={setting.id} className="p-6">
                    <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{setting.key}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        (setting as any).location === 'head' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {(setting as any).location === 'head' ? 'Head' : 'Body'}
                      </span>
                    </div>
                    {setting.description && (
                      <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                    )}
                    <div className="mt-3 bg-gray-50 rounded-md p-3">
                      <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-all overflow-x-auto">
                        {setting.value}
                      </pre>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Last updated: {new Date(setting.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => openDeleteConfirm(setting.key)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete setting"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the setting <strong>&quot;{deleteKey}&quot;</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteKey(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteKey && handleDelete(deleteKey)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

