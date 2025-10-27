import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'
import { promises as fsPromises } from 'fs'

interface CategoryOneWithChildren {
  pcstId: number
  pcstImg: string
  pcstSlug: string
  pcstCat: string
  totalProduct: number
  pcstPosition: number
  banner: string
  imageVector: string
  seoTitle: string
  seoDesc: string
  children?: CategoryTwoWithChildren[]
}

interface CategoryTwoWithChildren {
  psstId: number
  psstImg: string
  psstSlug: string
  psstSubcat: string
  psstTotalProduct: number
  psstPosition: number
  toShow: number
  seoTitle: string
  seoDesc: string
  children?: CategoryThreeWithChildren[]
}

interface CategoryThreeWithChildren {
  pssstId: number
  pssstImg: string
  pssstSlug: string
  pssstSubsubcat: string
  pssstSubcat?: string
  pssstCat?: string
  pssstTotalProduct: number
  pssstPosition: number
  seoTitle: string
  seoDesc: string
  children?: CategoryFourSimple[]
}

interface CategoryFourSimple {
  psssstId: number
  psssstImg: string
  psssstSlug: string
  psssstSubsubsubcat: string
  psssstSubsubcat?: string
  psssstSubcat?: string
  psssstCat?: string
  psssstTotalProduct: number
  psssstPosition: number
  seoTitle: string
  seoDesc: string
}

export async function POST(request: NextRequest) {
  try {
    // Fetch all categories from all levels
    const [categoryOne, categoryTwo, categoryThree, categoryFour] = await Promise.all([
      prisma.categoryOne.findMany({
        orderBy: { pcstPosition: 'asc' }
      }),
      prisma.$queryRaw<any[]>`SELECT * FROM category_two ORDER BY psst_position ASC`,
      prisma.$queryRaw<any[]>`SELECT * FROM category_three ORDER BY pssst_position ASC`,
      prisma.$queryRaw<any[]>`SELECT * FROM category_four ORDER BY psssst_position ASC`
    ])

    // Transform category two data
    const transformedCategoryTwo = categoryTwo.map((cat: any) => ({
      psstId: cat.psst_id,
      psstImg: cat.psst_img || '',
      psstSlug: cat.psst_slug,
      psstPcstCat: cat.psst_pcst_cat,
      psstSubcat: cat.psst_subcat,
      psstTotalProduct: cat.psst_total_product,
      psstPosition: cat.psst_position,
      toShow: cat.toShow,
      seoTitle: cat.seoTitle,
      seoDesc: cat.seoDesc
    }))

    // Transform category three data
    const transformedCategoryThree = categoryThree.map((cat: any) => ({
      pssstId: cat.pssst_id,
      pssstImg: cat.pssst_img || '',
      pssstSlug: cat.pssst_slug,
      pssstSubsubcat: cat.pssst_subsubcat,
      pssstSubcat: cat.pssst_subcat,
      pssstCat: cat.pssst_cat,
      pssstTotalProduct: cat.pssst_total_product,
      pssstPosition: cat.pssst_position,
      cat2Slug: cat.cat2_slug,
      seoTitle: cat.seoTitle,
      seoDesc: cat.seoDesc
    }))

    // Transform category four data
    const transformedCategoryFour = categoryFour.map((cat: any) => ({
      psssstId: cat.psssst_id,
      psssstImg: cat.psssst_img || '',
      psssstSlug: cat.psssst_slug,
      psssstSubsubsubcat: cat.psssst_subsubsubcat,
      psssstSubsubcat: cat.psssst_subsubcat,
      psssstSubcat: cat.psssst_subcat,
      psssstCat: cat.psssst_cat,
      psssstTotalProduct: cat.psssst_total_product,
      psssstPosition: cat.psssst_position,
      cat3Slug: cat.cat3_slug,
      seoTitle: cat.seoTitle,
      seoDesc: cat.seoDesc
    }))

    // Build nested structure - Start from Category One
    const nestedCategories: CategoryOneWithChildren[] = categoryOne.map((cat1: any) => {
      // Find Category Two items that belong to this Category One
      const cat2Items = transformedCategoryTwo.filter(
        (cat2: any) => cat2.psstPcstCat.toLowerCase() === cat1.pcstCat.toLowerCase()
      ) as CategoryTwoWithChildren[]

      // For each Category Two, find its Category Three children
      const cat2WithChildren = cat2Items.map((cat2: any) => {
        // Find Category Three items that belong to this Category Two
        const cat3Items = transformedCategoryThree.filter(
          (cat3: any) => cat3.cat2Slug === cat2.psstSlug
        ) as CategoryThreeWithChildren[]

        // For each Category Three, find its Category Four children
        const cat3WithChildren = cat3Items.map((cat3: any) => {
          // Find Category Four items that belong to this Category Three
          const cat4Items = transformedCategoryFour.filter(
            (cat4: any) => cat4.cat3Slug === cat3.pssstSlug
          ) as CategoryFourSimple[]

          return {
            ...cat3,
            children: cat4Items.sort((a: any, b: any) => a.psssstPosition - b.psssstPosition)
          }
        })

        return {
          ...cat2,
          children: cat3WithChildren.sort((a: any, b: any) => a.pssstPosition - b.pssstPosition)
        }
      })

      return {
        ...cat1,
        children: cat2WithChildren.sort((a: any, b: any) => a.psstPosition - b.psstPosition)
      }
    })

    // Helper function to normalize image paths
    const normalizeImage = (img: string) => {
      if (!img || img === '') return '/no_image_400.webp'
      return img.startsWith('/') ? img : `/${img}`
    }

    // Create simplified version for JSON export (cleaner structure)
    const simplifiedCategories = nestedCategories.map((cat1) => ({
      id: cat1.pcstId,
      name: cat1.pcstCat,
      slug: cat1.pcstSlug,
      image: normalizeImage(cat1.pcstImg),
      banner: cat1.banner ? normalizeImage(cat1.banner) : null,
      position: cat1.pcstPosition,
      totalProducts: cat1.totalProduct,
      seoTitle: cat1.seoTitle,
      seoDesc: cat1.seoDesc,
      children: cat1.children?.map((cat2) => ({
        id: cat2.psstId,
        name: cat2.psstSubcat,
        slug: cat2.psstSlug,
        image: normalizeImage(cat2.psstImg),
        position: cat2.psstPosition,
        totalProducts: cat2.psstTotalProduct,
        visible: cat2.toShow === 1,
        seoTitle: cat2.seoTitle,
        seoDesc: cat2.seoDesc,
        children: cat2.children?.map((cat3) => ({
          id: cat3.pssstId,
          name: cat3.pssstSubsubcat || cat3.pssstSubcat || cat3.pssstCat,
          slug: cat3.pssstSlug,
          image: normalizeImage(cat3.pssstImg),
          position: cat3.pssstPosition,
          totalProducts: cat3.pssstTotalProduct,
          seoTitle: cat3.seoTitle,
          seoDesc: cat3.seoDesc,
          children: cat3.children?.map((cat4) => ({
            id: cat4.psssstId,
            name: cat4.psssstSubsubsubcat || cat4.psssstSubsubcat || cat4.psssstSubcat || cat4.psssstCat,
            slug: cat4.psssstSlug,
            image: normalizeImage(cat4.psssstImg),
            position: cat4.psssstPosition,
            totalProducts: cat4.psssstTotalProduct,
            seoTitle: cat4.seoTitle,
            seoDesc: cat4.seoDesc
          }))
        }))
      }))
    }))

    const jsonData = JSON.stringify(simplifiedCategories, null, 2)
    
    // Write to public directory so it's accessible
    const publicPath = path.join(process.cwd(), 'public', 'categories.json')
    await fsPromises.writeFile(publicPath, jsonData, 'utf8')

    return NextResponse.json({
      success: true,
      message: 'categories.json generated successfully',
      path: '/categories.json',
      jsonData: jsonData, // Include the JSON data in the response
      categoriesCount: {
        level1: simplifiedCategories.length,
        level2: simplifiedCategories.reduce((sum, cat) => sum + (cat.children?.length || 0), 0),
        level3: simplifiedCategories.reduce((sum, cat1) => 
          sum + (cat1.children?.reduce((sum2, cat2) => sum2 + (cat2.children?.length || 0), 0) || 0), 0
        ),
        level4: simplifiedCategories.reduce((sum, cat1) => 
          sum + (cat1.children?.reduce((sum2, cat2) => 
            sum2 + (cat2.children?.reduce((sum3, cat3) => sum3 + (cat3.children?.length || 0), 0) || 0), 0) || 0), 0
        )
      }
    })
  } catch (error) {
    console.error('Error generating categories.json:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate categories.json',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
