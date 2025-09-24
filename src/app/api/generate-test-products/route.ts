import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { count = 10 } = await request.json()
    
    // Sample product data
    const sampleProducts = [
      {
        spuNo: 'SPU-001',
        itemNo: 'ITEM-001',
        slug: 'macbook-pro-16-inch-m3',
        fullCategory: 'Electronics > Computers > Laptops > Apple',
        category1: 'Electronics',
        category2: 'Computers',
        category3: 'Laptops',
        category4: 'Apple',
        name: 'MacBook Pro 16-inch M3 Chip',
        supplier: 'Apple Inc',
        brand: 'Apple',
        vt1: 'Color',
        vv1: 'Space Gray',
        vt2: 'Storage',
        vv2: '512GB',
        sku: 'MBP16-M3-512-SG',
        msrp: 2499.00,
        salePrice: 2299.00,
        discountedPrice: 2099.00,
        dropshippingPrice: 1999.00,
        map: 'MAP-001',
        inventory: '25',
        inventoryLoc: 'Warehouse A',
        shippingMethod: 'Standard',
        shipTo: 'US, CA, MX',
        shippingCost: '0',
        promotionStart: '2024-01-01',
        promotionEnd: '2024-12-31',
        mainImage: '/images/products/macbook-pro-16.jpg',
        images: [
          '/images/products/macbook-pro-16-1.jpg',
          '/images/products/macbook-pro-16-2.jpg',
          '/images/products/macbook-pro-16-3.jpg'
        ],
        description: 'The most powerful MacBook Pro ever with the M3 chip, featuring a stunning 16-inch Liquid Retina XDR display, up to 22 hours of battery life, and advanced camera and audio systems.',
        shortDescription: 'MacBook Pro 16-inch with M3 chip - Ultimate performance laptop',
        upc: '123456789012',
        asin: 'B0C8J9K2L3',
        processingTime: '1-2 business days',
        ean: '1234567890123',
        dsFrom: 'Apple Store',
        dealId: 'DEAL-001',
        status: 'active',
        metaTitle: 'MacBook Pro 16-inch M3 - Apple Official Store',
        metaDescription: 'Buy MacBook Pro 16-inch with M3 chip. Fast shipping, official warranty. Best price guaranteed.',
        metaKeywords: 'macbook pro, m3 chip, apple laptop, 16 inch, computer'
      },
      {
        spuNo: 'SPU-002',
        itemNo: 'ITEM-002',
        slug: 'iphone-15-pro-max-256gb',
        fullCategory: 'Electronics > Mobile Phones > Smartphones > Apple',
        category1: 'Electronics',
        category2: 'Mobile Phones',
        category3: 'Smartphones',
        category4: 'Apple',
        name: 'iPhone 15 Pro Max 256GB',
        supplier: 'Apple Inc',
        brand: 'Apple',
        vt1: 'Color',
        vv1: 'Natural Titanium',
        vt2: 'Storage',
        vv2: '256GB',
        sku: 'IP15PM-256-NT',
        msrp: 1199.00,
        salePrice: 1099.00,
        discountedPrice: 999.00,
        dropshippingPrice: 949.00,
        map: 'MAP-002',
        inventory: '50',
        inventoryLoc: 'Warehouse B',
        shippingMethod: 'Express',
        shipTo: 'US, CA',
        shippingCost: '15',
        promotionStart: '2024-01-15',
        promotionEnd: '2024-06-15',
        mainImage: '/images/products/iphone-15-pro-max.jpg',
        images: [
          '/images/products/iphone-15-pro-max-1.jpg',
          '/images/products/iphone-15-pro-max-2.jpg'
        ],
        description: 'The most advanced iPhone ever with titanium design, A17 Pro chip, and the most versatile camera system ever on iPhone.',
        shortDescription: 'iPhone 15 Pro Max with titanium design and A17 Pro chip',
        upc: '234567890123',
        asin: 'B0C8J9K2L4',
        processingTime: 'Same day',
        ean: '2345678901234',
        dsFrom: 'Apple Store',
        dealId: 'DEAL-002',
        status: 'active',
        metaTitle: 'iPhone 15 Pro Max 256GB - Apple Official',
        metaDescription: 'Buy iPhone 15 Pro Max 256GB. Latest features, titanium design, A17 Pro chip.',
        metaKeywords: 'iphone 15 pro max, apple phone, titanium, a17 pro'
      },
      {
        spuNo: 'SPU-003',
        itemNo: 'ITEM-003',
        slug: 'samsung-galaxy-s24-ultra-512gb',
        fullCategory: 'Electronics > Mobile Phones > Smartphones > Samsung',
        category1: 'Electronics',
        category2: 'Mobile Phones',
        category3: 'Smartphones',
        category4: 'Samsung',
        name: 'Samsung Galaxy S24 Ultra 512GB',
        supplier: 'Samsung Electronics',
        brand: 'Samsung',
        vt1: 'Color',
        vv1: 'Titanium Black',
        vt2: 'Storage',
        vv2: '512GB',
        sku: 'SGS24U-512-TB',
        msrp: 1299.99,
        salePrice: 1199.99,
        discountedPrice: 1099.99,
        dropshippingPrice: 1049.99,
        map: 'MAP-003',
        inventory: '30',
        inventoryLoc: 'Warehouse C',
        shippingMethod: 'Standard',
        shipTo: 'US, CA, MX, EU',
        shippingCost: '0',
        promotionStart: '2024-02-01',
        promotionEnd: '2024-08-01',
        mainImage: '/images/products/galaxy-s24-ultra.jpg',
        images: [
          '/images/products/galaxy-s24-ultra-1.jpg',
          '/images/products/galaxy-s24-ultra-2.jpg',
          '/images/products/galaxy-s24-ultra-3.jpg'
        ],
        description: 'The most powerful Galaxy smartphone with AI-powered features, 200MP camera, and S Pen included.',
        shortDescription: 'Galaxy S24 Ultra with AI features and 200MP camera',
        upc: '345678901234',
        asin: 'B0C8J9K2L5',
        processingTime: '2-3 business days',
        ean: '3456789012345',
        dsFrom: 'Samsung Store',
        dealId: 'DEAL-003',
        status: 'active',
        metaTitle: 'Samsung Galaxy S24 Ultra 512GB - Official Store',
        metaDescription: 'Buy Galaxy S24 Ultra 512GB. AI features, 200MP camera, S Pen included.',
        metaKeywords: 'galaxy s24 ultra, samsung phone, ai features, 200mp camera'
      },
      {
        spuNo: 'SPU-004',
        itemNo: 'ITEM-004',
        slug: 'dell-xps-15-laptop-i7-32gb',
        fullCategory: 'Electronics > Computers > Laptops > Dell',
        category1: 'Electronics',
        category2: 'Computers',
        category3: 'Laptops',
        category4: 'Dell',
        name: 'Dell XPS 15 Laptop i7 32GB RAM',
        supplier: 'Dell Technologies',
        brand: 'Dell',
        vt1: 'Processor',
        vv1: 'Intel i7-13700H',
        vt2: 'RAM',
        vv2: '32GB',
        sku: 'DXPS15-I7-32GB',
        msrp: 1899.99,
        salePrice: 1699.99,
        discountedPrice: 1499.99,
        dropshippingPrice: 1399.99,
        map: 'MAP-004',
        inventory: '15',
        inventoryLoc: 'Warehouse A',
        shippingMethod: 'Standard',
        shipTo: 'US, CA',
        shippingCost: '25',
        promotionStart: '2024-01-20',
        promotionEnd: '2024-07-20',
        mainImage: '/images/products/dell-xps-15.jpg',
        images: [
          '/images/products/dell-xps-15-1.jpg',
          '/images/products/dell-xps-15-2.jpg'
        ],
        description: 'Premium laptop with Intel i7 processor, 32GB RAM, 1TB SSD, and stunning 15.6-inch 4K display.',
        shortDescription: 'Dell XPS 15 with i7 processor and 32GB RAM',
        upc: '456789012345',
        asin: 'B0C8J9K2L6',
        processingTime: '3-5 business days',
        ean: '4567890123456',
        dsFrom: 'Dell Store',
        dealId: 'DEAL-004',
        status: 'active',
        metaTitle: 'Dell XPS 15 Laptop i7 32GB - Official Store',
        metaDescription: 'Buy Dell XPS 15 with i7 processor, 32GB RAM, 4K display.',
        metaKeywords: 'dell xps 15, i7 processor, 32gb ram, 4k laptop'
      },
      {
        spuNo: 'SPU-005',
        itemNo: 'ITEM-005',
        slug: 'sony-wh-1000xm5-headphones',
        fullCategory: 'Electronics > Audio > Headphones > Sony',
        category1: 'Electronics',
        category2: 'Audio',
        category3: 'Headphones',
        category4: 'Sony',
        name: 'Sony WH-1000XM5 Noise Canceling Headphones',
        supplier: 'Sony Corporation',
        brand: 'Sony',
        vt1: 'Color',
        vv1: 'Black',
        vt2: 'Connectivity',
        vv2: 'Wireless',
        sku: 'SWH1000XM5-BLK',
        msrp: 399.99,
        salePrice: 349.99,
        discountedPrice: 299.99,
        dropshippingPrice: 279.99,
        map: 'MAP-005',
        inventory: '100',
        inventoryLoc: 'Warehouse B',
        shippingMethod: 'Standard',
        shipTo: 'US, CA, MX, EU',
        shippingCost: '0',
        promotionStart: '2024-03-01',
        promotionEnd: '2024-09-01',
        mainImage: '/images/products/sony-wh-1000xm5.jpg',
        images: [
          '/images/products/sony-wh-1000xm5-1.jpg',
          '/images/products/sony-wh-1000xm5-2.jpg'
        ],
        description: 'Industry-leading noise canceling headphones with 30-hour battery life and crystal clear sound.',
        shortDescription: 'Sony WH-1000XM5 noise canceling headphones',
        upc: '567890123456',
        asin: 'B0C8J9K2L7',
        processingTime: '1-2 business days',
        ean: '5678901234567',
        dsFrom: 'Sony Store',
        dealId: 'DEAL-005',
        status: 'active',
        metaTitle: 'Sony WH-1000XM5 Headphones - Official Store',
        metaDescription: 'Buy Sony WH-1000XM5 noise canceling headphones. 30-hour battery life.',
        metaKeywords: 'sony headphones, noise canceling, wh-1000xm5, wireless'
      }
    ]

    // Generate additional products if count > 5
    const additionalProducts = []
    for (let i = 6; i <= count; i++) {
      const baseProduct = sampleProducts[i % 5] // Cycle through base products
      additionalProducts.push({
        ...baseProduct,
        spuNo: `SPU-${i.toString().padStart(3, '0')}`,
        itemNo: `ITEM-${i.toString().padStart(3, '0')}`,
        slug: `${baseProduct.slug}-${i}`,
        sku: `${baseProduct.sku}-${i}`,
        name: `${baseProduct.name} (Variation ${i})`,
        msrp: baseProduct.msrp + (i * 10),
        salePrice: baseProduct.salePrice + (i * 10),
        discountedPrice: baseProduct.discountedPrice + (i * 10),
        dropshippingPrice: baseProduct.dropshippingPrice + (i * 10),
        inventory: (Math.floor(Math.random() * 50) + 10).toString(),
        upc: (567890123456 + i).toString(),
        asin: `B0C8J9K2L${5 + i}`,
        ean: (5678901234567 + i).toString(),
        dealId: `DEAL-${i.toString().padStart(3, '0')}`,
        metaTitle: `${baseProduct.metaTitle} - Variation ${i}`,
        metaDescription: `${baseProduct.metaDescription} - Variation ${i}`,
        metaKeywords: `${baseProduct.metaKeywords}, variation ${i}`
      })
    }

    const allProducts = [...sampleProducts, ...additionalProducts]

    // Insert products using raw SQL
    const insertPromises = allProducts.map(product => 
      prisma.$executeRaw`
        INSERT INTO "Product" (
          id, "spu_no", "item_no", slug, "full_category", "category_1", "category_2", 
          "category_3", "category_4", name, supplier, brand, "vt1", "vv1", "vt2", "vv2", 
          sku, msrp, "sale_price", "discounted_price", "dropshipping_price", map, 
          inventory, "inventory_loc", "shipping_method", "ship_to", "shipping_cost", 
          "promotion_start", "promotion_end", "main_image", images, description, 
          "short_description", upc, asin, "processing_time", ean, "ds_from", "deal_id", 
          status, "meta_title", "meta_description", "meta_keywords", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), ${product.spuNo}, ${product.itemNo}, ${product.slug}, 
          ${product.fullCategory}, ${product.category1}, ${product.category2}, 
          ${product.category3}, ${product.category4}, ${product.name}, ${product.supplier}, 
          ${product.brand}, ${product.vt1}, ${product.vv1}, ${product.vt2}, ${product.vv2}, 
          ${product.sku}, ${product.msrp}, ${product.salePrice}, ${product.discountedPrice}, 
          ${product.dropshippingPrice}, ${product.map}, ${product.inventory}, 
          ${product.inventoryLoc}, ${product.shippingMethod}, ${product.shipTo}, 
          ${product.shippingCost}, ${product.promotionStart}, ${product.promotionEnd}, 
          ${product.mainImage}, ${JSON.stringify(product.images)}, ${product.description}, 
          ${product.shortDescription}, ${product.upc}, ${product.asin}, ${product.processingTime}, 
          ${product.ean}, ${product.dsFrom}, ${product.dealId}, ${product.status}, 
          ${product.metaTitle}, ${product.metaDescription}, ${product.metaKeywords}, 
          NOW(), NOW()
        )
      `
    )

    await Promise.all(insertPromises)

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${count} test products`,
      count: allProducts.length,
      products: allProducts.map(p => ({
        spuNo: p.spuNo,
        name: p.name,
        category: p.fullCategory,
        price: p.salePrice
      }))
    })
  } catch (error) {
    console.error('Error generating test products:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate test products',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
