'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface CSVImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ImportReport {
  totalRows: number
  successCount: number
  failCount: number
  executeFailedCount: number
  errors: string[]
}

interface JobStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  totalRows: number
  processedRows: number
  successCount: number
  failCount: number
  errors: string[]
  startTime: string
  endTime?: string
}

export function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [importReport, setImportReport] = useState<ImportReport | null>(null)
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [useBackgroundProcessing, setUseBackgroundProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleClose = () => {
    setFile(null)
    setImportReport(null)
    setJobStatus(null)
    setJobId(null)
    setUseBackgroundProcessing(false)
    setError(null)
    setUploading(false)
    
    // Clear progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    
    onClose()
  }

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.type.includes('csv')) {
      setError('Please select a valid CSV file')
      return
    }

    // Check file size and suggest background processing for large files
    const fileSizeMB = selectedFile.size / (1024 * 1024)
    const isLargeFile = fileSizeMB > 100 // 100MB threshold
    
    if (selectedFile.size > 3 * 1024 * 1024 * 1024) { // 3GB max
      setError('File size exceeds 3GB limit')
      return
    }

    setFile(selectedFile)
    setUseBackgroundProcessing(isLargeFile)
    setError(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  // Monitor job progress
  const monitorJobProgress = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/products/import-csv-background?jobId=${jobId}`)
      const result = await response.json()

      if (result.success) {
        setJobStatus(result)
        
        if (result.status === 'completed' || result.status === 'failed') {
          // Job finished, stop monitoring
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
            progressIntervalRef.current = null
          }
          
          if (result.status === 'completed') {
            setImportReport({
              totalRows: result.totalRows,
              successCount: result.successCount,
              failCount: result.failCount,
              executeFailedCount: 0,
              errors: result.errors
            })
            // Show success message briefly before closing
            setTimeout(() => {
              onSuccess()
            }, 1500)
          } else {
            setError('Import failed. Check the errors below.')
          }
        }
      }
    } catch (error) {
      console.error('Error monitoring job progress:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a CSV file')
      return
    }

    setUploading(true)
    setError(null)
    setImportReport(null)
    setJobStatus(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Choose endpoint based on file size
      const endpoint = useBackgroundProcessing 
        ? '/api/admin/products/import-csv-background'
        : '/api/admin/products/import-csv-stream'

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        if (useBackgroundProcessing && result.jobId) {
          // Start background processing
          setJobId(result.jobId)
          setJobStatus({
            status: 'pending',
            progress: 0,
            totalRows: 0,
            processedRows: 0,
            successCount: 0,
            failCount: 0,
            errors: [],
            startTime: new Date().toISOString()
          })
          
          // Start monitoring progress
          progressIntervalRef.current = setInterval(() => {
            monitorJobProgress(result.jobId)
          }, 2000) // Check every 2 seconds
        } else {
          // Regular processing completed
          setImportReport(result.report)
          // Show success message briefly before closing
          setTimeout(() => {
            onSuccess()
          }, 1500)
        }
      } else {
        setError(result.error || 'Import failed')
      }
    } catch (error) {
      console.error('Import error:', error)
      setError('Failed to import CSV file. Please try again.')
    } finally {
      if (!useBackgroundProcessing) {
        setUploading(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import Products from CSV
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!importReport && !jobStatus ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                
                {file ? (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">
                      Drop your CSV file here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports CSV files up to 10MB
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                  </div>
                )}
              </div>

              {/* File Processing Options */}
              {file && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Processing Options</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="backgroundProcessing"
                        checked={useBackgroundProcessing}
                        onChange={(e) => setUseBackgroundProcessing(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="backgroundProcessing" className="text-sm text-blue-800">
                        Use background processing (recommended for files larger than 100MB)
                      </label>
                    </div>
                    <p className="text-xs text-blue-700">
                      Background processing allows you to close this window while the import continues.
                      You can check progress later using the job ID.
                    </p>
                  </div>
                </div>
              )}

              {/* CSV Format Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Expected CSV Format</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Your CSV should contain the following columns (in order):
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Column Order (42 columns total):</strong></p>
                  <p>1: SPU Number | 2: Item Number | 3: URL | 4: Full Category Path</p>
                  <p>5: Product Name | 6: Supplier | 7: Brand | 8-11: Variants (vt1, vv1, vt2, vv2)</p>
                  <p>12: SKU | 13: MAP Price | 14: Dropshipping Price | 15: Inventory</p>
                  <p>16-20: Shipping Details | 21-25: Inventory Details | 26: Sale Price</p>
                  <p>27: Promotion Type | 28: Promotion Value | 29: Promotion End Date | 30: Main Image</p>
                  <p>31-35: Additional Images | 36: Description | 37: UPC | 38: ASIN</p>
                  <p>39-42: Additional Fields</p>
                  <p className="text-blue-600 font-medium">Note: Category should be in format "Category1&gt;&gt;Category2&gt;&gt;Category3&gt;&gt;Category4"</p>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import Products
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : jobStatus ? (
            /* Progress Display */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                  <div 
                    className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"
                    style={{ transform: `rotate(${jobStatus.progress * 3.6}deg)` }}
                  ></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {jobStatus.status === 'pending' ? 'Preparing Import...' : 
                   jobStatus.status === 'processing' ? 'Processing CSV...' : 
                   jobStatus.status === 'completed' ? 'Import Complete!' : 'Import Failed'}
                </h3>
                <p className="text-gray-600">
                  {jobStatus.status === 'processing' ? 
                    `Processing ${jobStatus.processedRows.toLocaleString()} of ${jobStatus.totalRows.toLocaleString()} rows` :
                    jobStatus.status === 'completed' ? 
                    `Successfully imported ${jobStatus.successCount.toLocaleString()} products` :
                    'Please wait...'
                  }
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{jobStatus.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${jobStatus.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Job Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Job Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Job ID:</span>
                    <span className="ml-2 font-mono text-xs">{jobId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      jobStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
                      jobStatus.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      jobStatus.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {jobStatus.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Success:</span>
                    <span className="ml-2 text-green-600 font-medium">{jobStatus.successCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Failed:</span>
                    <span className="ml-2 text-red-600 font-medium">{jobStatus.failCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {jobStatus.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Recent Errors ({jobStatus.errors.length})
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {jobStatus.errors.slice(-10).map((error, index) => (
                      <p key={index} className="text-sm text-red-700">{error}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {jobStatus.status === 'completed' ? 'Close' : 'Cancel'}
                </button>
              </div>
            </div>
          ) : (
            /* Import Report */
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Import Complete</h3>
                <p className="text-gray-600">CSV file has been processed successfully</p>
              </div>

              {/* Report Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{importReport?.totalRows || 0}</div>
                  <div className="text-sm text-blue-700">Total Rows</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{importReport?.successCount || 0}</div>
                  <div className="text-sm text-green-700">Successfully Imported</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{importReport?.failCount || 0}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{importReport?.executeFailedCount || 0}</div>
                  <div className="text-sm text-yellow-700">Skipped</div>
                </div>
              </div>

              {/* Errors */}
              {importReport?.errors && importReport.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Errors ({importReport.errors.length})
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {importReport.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700">{error}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
