import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

// In-memory job status storage (in production, use Redis or database)
const jobStatus = new Map<string, any>()

// Parse CSV content in streaming fashion
function* parseCSVStream(csvContent: string): Generator<string[], void, unknown> {
  const lines = csvContent.split('\n')
  
  for (const line of lines) {
    if (line.trim() === '') continue
    
    const record: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        record.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    record.push(current.trim())
    yield record
  }
}

// Process a batch of products
async function processBatch(products: any[], batchNumber: number) {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  }

  for (let i = 0; i < products.length; i++) {
    try {
      const product = products[i]
      
      // Validate required fields - only require spuNo since we allow duplicates
      if (!product.spuNo) {
        results.failed++
        results.errors.push(`Batch ${batchNumber}, Row ${i + 1}: SPU Number is required`)
        continue
      }

      // Check if product already exists by slug (since we allow same spuNo)
      const existingProduct = await prisma.product.findFirst({
        where: {
          slug: product.slug
        }
      })

      if (existingProduct) {
        // Update existing product
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: product
        })
      } else {
        // Create new product
        await prisma.product.create({
          data: product
        })
      }

      results.success++
    } catch (error) {
      results.failed++
      results.errors.push(`Batch ${batchNumber}, Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return results
}

// Transform CSV row to product data
function transformCSVRow(row: string[], rowIndex: number) {
  try {
    // Expected CSV format based on the modal description
    const [
      spuNo,
      itemNo,
      url,
      category1,
      name,
      supplier,
      brand,
      variant1,
      variant2,
      variant3,
      variant4,
      sku,
      mapPrice,
      dropshippingPrice,
      inventory,
      shippingWeight,
      shippingLength,
      shippingWidth,
      shippingHeight,
      shippingCost,
      inventoryLocation,
      inventoryStatus,
      inventoryNotes,
      inventoryReserved,
      inventoryAvailable,
      salePrice,
      promotionType,
      promotionValue,
      promotionEndDate,
      mainImage,
      image2,
      image3,
      image4,
      image5,
      description,
      upc,
      asin,
      additionalField1,
      additionalField2,
      additionalField3,
      additionalField4
    ] = row

    // Debug: Log the actual values being read
    console.log(`🔍 Row ${rowIndex + 1} CSV values:`, {
      spuNo,
      itemNo,
      name,
      promotionEndDate,
      mainImage,
      totalColumns: row.length,
      allColumns: row.slice(0, 10) // First 10 columns for debugging
    })

    // Helper function to detect if a value is an image URL
    const isImageUrl = (value: string) => {
      if (!value || value.trim() === '') return false
      return value.includes('http') && (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.webp') || value.includes('image.'))
    }

    // Helper function to detect if a value is a date
    const isDate = (value: string) => {
      if (!value || value.trim() === '') return false
      // Check for common date formats
      return /^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{2}\/\d{2}\/\d{4}/.test(value) || /^\d{2}-\d{2}-\d{4}/.test(value)
    }

    // Parse numeric values
    const parsePrice = (priceStr: string) => {
      if (!priceStr || priceStr.trim() === '') return null
      const parsed = parseFloat(priceStr.replace(/[^0-9.-]/g, ''))
      return isNaN(parsed) ? null : parsed
    }

    const parseInventory = (inventoryStr: string) => {
      if (!inventoryStr || inventoryStr.trim() === '') return '0'
      const parsed = parseInt(inventoryStr.replace(/[^0-9]/g, ''))
      return isNaN(parsed) ? '0' : parsed.toString()
    }

    // Calculate prices
    const msrp = parsePrice(mapPrice)
    const discountedPrice = parsePrice(salePrice)
    const salePriceNum = parsePrice(salePrice)

    // Generate slug from name
    const generateSlug = (name: string, itemNo: string, spuNo: string, rowIndex: number) => {
      const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      // Add item number, spu number, and row index to ensure uniqueness
      const itemSuffix = itemNo?.trim() ? `-${itemNo}` : ''
      const spuSuffix = spuNo?.trim() ? `-${spuNo}` : ''
      const timestamp = Date.now().toString().slice(-6) // Last 6 digits of timestamp
      const randomSuffix = Math.random().toString(36).substr(2, 4) // 4 random characters
      return `${baseSlug}${itemSuffix}${spuSuffix}-${rowIndex}-${timestamp}-${randomSuffix}`.substring(0, 100) // Limit length
    }

    // Parse full category path into individual categories
    const parseCategoryPath = (fullCategoryPath: string) => {
      if (!fullCategoryPath || fullCategoryPath.trim() === '') {
        return {
          fullCategory: 'Other',
          category1: 'Other',
          category2: 'Other',
          category3: 'Other',
          category4: 'Other'
        }
      }
      
      const categories = fullCategoryPath.split('>>').map(cat => cat.trim())
      
      return {
        fullCategory: fullCategoryPath,
        category1: categories[0] || 'Other',
        category2: categories[1] || 'Other',
        category3: categories[2] || 'Other',
        category4: categories[3] || 'Other'
      }
    }

    // Smart column detection - fix common mapping issues
    let actualPromotionEnd = promotionEndDate?.trim() || null
    let actualMainImage = mainImage?.trim() || ''
    
    // If promotionEnd looks like an image URL, swap it with mainImage
    if (actualPromotionEnd && isImageUrl(actualPromotionEnd) && !isImageUrl(actualMainImage)) {
      console.log(`🔄 Swapping promotionEnd and mainImage for row ${rowIndex + 1}`)
      const temp = actualPromotionEnd
      actualPromotionEnd = actualMainImage
      actualMainImage = temp
    }
    
    // Look for the actual main image in the row if it's not in the expected position
    if (!actualMainImage || actualMainImage === '') {
      for (let i = 0; i < row.length; i++) {
        if (isImageUrl(row[i])) {
          actualMainImage = row[i]
          console.log(`🔍 Found main image at column ${i + 1}: ${actualMainImage}`)
          break
        }
      }
    }
    
    // Look for the actual promotion end date if it's not in the expected position
    if (!actualPromotionEnd || !isDate(actualPromotionEnd)) {
      for (let i = 0; i < row.length; i++) {
        if (isDate(row[i])) {
          actualPromotionEnd = row[i]
          console.log(`🔍 Found promotion end date at column ${i + 1}: ${actualPromotionEnd}`)
          break
        }
      }
    }

    const categoryData = parseCategoryPath(category1?.trim() || '')

    return {
      spuNo: spuNo?.trim() || '',
      itemNo: itemNo?.trim() || null,
      slug: generateSlug(name?.trim() || 'untitled-product', itemNo?.trim() || '', spuNo?.trim() || '', rowIndex),
      fullCategory: categoryData.fullCategory,
      category1: categoryData.category1,
      category2: categoryData.category2,
      category3: categoryData.category3,
      category4: categoryData.category4,
      name: name?.trim() || 'Untitled Product',
      supplier: supplier?.trim() || null,
      brand: brand?.trim() || null,
      vt1: variant1?.trim() || null,
      vv1: variant2?.trim() || null,
      vt2: variant3?.trim() || null,
      vv2: variant4?.trim() || null,
      sku: sku?.trim() || null,
      msrp: msrp,
      salePrice: salePriceNum,
      discountedPrice: discountedPrice,
      dropshippingPrice: parsePrice(dropshippingPrice),
      map: null,
      inventory: parseInventory(inventory),
      inventoryLoc: inventoryLocation?.trim() || null,
      shippingMethod: null,
      shipTo: null,
      shippingCost: parsePrice(shippingCost)?.toString() || '0',
      promotionStart: null,
      promotionEnd: actualPromotionEnd,
      mainImage: actualMainImage,
      images: [image2, image3, image4, image5].filter(img => img?.trim()).map(img => img.trim()),
      description: description?.trim() || null,
      shortDescription: null,
      upc: upc?.trim() || null,
      asin: asin?.trim() || null,
      processingTime: null,
      ean: null,
      dsFrom: null,
      dealId: null,
      status: 'active',
      metaTitle: null,
      metaDescription: null,
      metaKeywords: null
    }
  } catch (error) {
    throw new Error(`Row ${rowIndex + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Background processing function
async function processCSVInBackground(jobId: string, filePath: string) {
  try {
    // Update job status to processing
    jobStatus.set(jobId, {
      ...jobStatus.get(jobId),
      status: 'processing',
      startTime: new Date()
    })

    // Read and process the CSV file
    const fs = await import('fs')
    const csvContent = fs.readFileSync(filePath, 'utf-8')
    
    const BATCH_SIZE = 100
    let totalRows = 0
    let totalSuccess = 0
    let totalFailed = 0
    const allErrors: string[] = []
    let batchNumber = 0

    // Count total rows first
    const lines = csvContent.split('\n').filter(line => line.trim() !== '')
    totalRows = lines.length - 1 // Subtract header row

    // Update job status with total rows
    jobStatus.set(jobId, {
      ...jobStatus.get(jobId),
      totalRows: totalRows
    })

    // Process CSV in batches
    const products: any[] = []
    let rowIndex = 0

    const csvGenerator = parseCSVStream(csvContent)
    let result = csvGenerator.next()
    
    while (!result.done) {
      const row = result.value
      
      // Skip header row
      if (rowIndex === 0) {
        rowIndex++
        result = csvGenerator.next()
        continue
      }

      try {
        const product = transformCSVRow(row, rowIndex)
        products.push(product)

        // Process batch when it reaches the batch size
        if (products.length >= BATCH_SIZE) {
          batchNumber++
          const batchResults = await processBatch(products, batchNumber)
          
          totalSuccess += batchResults.success
          totalFailed += batchResults.failed
          allErrors.push(...batchResults.errors)

          // Update progress
          const progress = Math.round((rowIndex / totalRows) * 100)
          jobStatus.set(jobId, {
            ...jobStatus.get(jobId),
            progress: progress,
            processedRows: rowIndex,
            successCount: totalSuccess,
            failCount: totalFailed,
            errors: allErrors.slice(-50) // Keep last 50 errors
          })

          // Clear the products array for next batch
          products.length = 0

          console.log(`Job ${jobId} - Processed batch ${batchNumber}: ${batchResults.success} success, ${batchResults.failed} failed`)
        }
      } catch (error) {
        totalFailed++
        allErrors.push(`Row ${rowIndex + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      rowIndex++
      result = csvGenerator.next()
    }

    // Process remaining products
    if (products.length > 0) {
      batchNumber++
      const batchResults = await processBatch(products, batchNumber)
      
      totalSuccess += batchResults.success
      totalFailed += batchResults.failed
      allErrors.push(...batchResults.errors)
    }

    // Mark job as completed
    jobStatus.set(jobId, {
      ...jobStatus.get(jobId),
      status: 'completed',
      progress: 100,
      processedRows: totalRows,
      successCount: totalSuccess,
      failCount: totalFailed,
      errors: allErrors,
      endTime: new Date()
    })

    // Clean up file
    try {
      await fs.promises.unlink(filePath)
    } catch (error) {
      console.warn('Failed to delete temporary file:', error)
    }

    console.log(`Job ${jobId} completed: ${totalSuccess} success, ${totalFailed} failed`)

  } catch (error) {
    console.error(`Job ${jobId} failed:`, error)
    
    // Mark job as failed
    jobStatus.set(jobId, {
      ...jobStatus.get(jobId),
      status: 'failed',
      errors: [`Job failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      endTime: new Date()
    })
  }
}

// Start background import
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin permissions
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions. Admin role required.' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Invalid file type. Only CSV files are allowed.' }, { status: 400 })
    }

    // Check file size (3GB max)
    const maxSize = 3 * 1024 * 1024 * 1024 // 3GB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 3GB limit' }, { status: 400 })
    }

    // Generate job ID
    const jobId = `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'csv-imports')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file temporarily
    const fileName = `${jobId}.csv`
    const filePath = join(uploadsDir, fileName)
    const buffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(buffer))

    // Initialize job status
    jobStatus.set(jobId, {
      status: 'pending',
      progress: 0,
      totalRows: 0,
      processedRows: 0,
      successCount: 0,
      failCount: 0,
      errors: [],
      startTime: new Date()
    })

    // Start background processing (don't await)
    processCSVInBackground(jobId, filePath).catch(error => {
      console.error('Background processing error:', error)
    })

    return NextResponse.json({
      success: true,
      jobId: jobId,
      message: 'Import job started. Use the job ID to check progress.'
    })

  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json(
      { error: 'Internal server error during CSV import' },
      { status: 500 }
    )
  }
}

// Get job status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    const status = jobStatus.get(jobId)
    if (!status) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      ...status
    })

  } catch (error) {
    console.error('Job status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
