import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Insert test products using raw SQL
    const result = await prisma.$executeRaw`
      INSERT INTO "Product" (
        id, "spu_no", "item_no", slug, "full_category", "category_1", "category_2", 
        "category_3", "category_4", name, supplier, brand, "vt1", "vv1", "vt2", "vv2", 
        sku, msrp, "sale_price", "discounted_price", "dropshipping_price", map, 
        inventory, "inventory_loc", "shipping_method", "ship_to", "shipping_cost", 
        "promotion_start", "promotion_end", "main_image", images, description, 
        "short_description", upc, asin, "processing_time", ean, "ds_from", "deal_id", 
        status, "meta_title", "meta_description", "meta_keywords", "createdAt", "updatedAt"
      ) VALUES 
      (
        gen_random_uuid(), 'SPU-001', 'ITEM-001', 'macbook-pro-16-inch-m3', 
        'Electronics > Computers > Laptops > Apple', 'Electronics', 'Computers', 
        'Laptops', 'Apple', 'MacBook Pro 16-inch M3 Chip', 'Apple Inc', 'Apple', 
        'Color', 'Space Gray', 'Storage', '512GB', 'MBP16-M3-512-SG', 2499.00, 
        2299.00, 2099.00, 1999.00, 'MAP-001', '25', 'Warehouse A', 'Standard', 
        'US, CA, MX', '0', '2024-01-01', '2024-12-31', 'https://image.doba.com/dg4-jnDShKsAQFbz/d0101h2rtpy.webp', 
        '["https://image.doba.com/dg4-jnDShKsAQFbz/d0101h2rtpy.webp"]', 
        'The most powerful MacBook Pro ever with the M3 chip', 
        'MacBook Pro 16-inch with M3 chip - Ultimate performance laptop', 
        '123456789012', 'B0C8J9K2L3', '1-2 business days', '1234567890123', 
        'Apple Store', 'DEAL-001', 'active', 'MacBook Pro 16-inch M3 - Apple Official Store', 
        'Buy MacBook Pro 16-inch with M3 chip. Fast shipping, official warranty.', 
        'macbook pro, m3 chip, apple laptop, 16 inch, computer', NOW(), NOW()
      ),
      (
        gen_random_uuid(), 'SPU-002', 'ITEM-002', 'iphone-15-pro-max-256gb', 
        'Electronics > Mobile Phones > Smartphones > Apple', 'Electronics', 'Mobile Phones', 
        'Smartphones', 'Apple', 'iPhone 15 Pro Max 256GB', 'Apple Inc', 'Apple', 
        'Color', 'Natural Titanium', 'Storage', '256GB', 'IP15PM-256-NT', 1199.00, 
        1099.00, 999.00, 949.00, 'MAP-002', '50', 'Warehouse B', 'Express', 
        'US, CA', '15', '2024-01-15', '2024-06-15', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop', 
        '["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop"]', 
        'The most advanced iPhone ever with titanium design', 
        'iPhone 15 Pro Max with titanium design and A17 Pro chip', 
        '234567890123', 'B0C8J9K2L4', 'Same day', '2345678901234', 
        'Apple Store', 'DEAL-002', 'active', 'iPhone 15 Pro Max 256GB - Apple Official', 
        'Buy iPhone 15 Pro Max 256GB. Latest features, titanium design.', 
        'iphone 15 pro max, apple phone, titanium, a17 pro', NOW(), NOW()
      ),
      (
        gen_random_uuid(), 'SPU-003', 'ITEM-003', 'samsung-galaxy-s24-ultra-512gb', 
        'Electronics > Mobile Phones > Smartphones > Samsung', 'Electronics', 'Mobile Phones', 
        'Smartphones', 'Samsung', 'Samsung Galaxy S24 Ultra 512GB', 'Samsung Electronics', 'Samsung', 
        'Color', 'Titanium Black', 'Storage', '512GB', 'SGS24U-512-TB', 1299.99, 
        1199.99, 1099.99, 1049.99, 'MAP-003', '30', 'Warehouse C', 'Standard', 
        'US, CA, MX, EU', '0', '2024-02-01', '2024-08-01', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', 
        '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop"]', 
        'The most powerful Galaxy smartphone with AI-powered features', 
        'Galaxy S24 Ultra with AI features and 200MP camera', 
        '345678901234', 'B0C8J9K2L5', '2-3 business days', '3456789012345', 
        'Samsung Store', 'DEAL-003', 'active', 'Samsung Galaxy S24 Ultra 512GB - Official Store', 
        'Buy Galaxy S24 Ultra 512GB. AI features, 200MP camera, S Pen included.', 
        'galaxy s24 ultra, samsung phone, ai features, 200mp camera', NOW(), NOW()
      ),
      (
        gen_random_uuid(), 'SPU-004', 'ITEM-004', 'dell-xps-15-laptop-i7-32gb', 
        'Electronics > Computers > Laptops > Dell', 'Electronics', 'Computers', 
        'Laptops', 'Dell', 'Dell XPS 15 Laptop i7 32GB RAM', 'Dell Technologies', 'Dell', 
        'Processor', 'Intel i7-13700H', 'RAM', '32GB', 'DXPS15-I7-32GB', 1899.99, 
        1699.99, 1499.99, 1399.99, 'MAP-004', '15', 'Warehouse A', 'Standard', 
        'US, CA', '25', '2024-01-20', '2024-07-20', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', 
        '["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop"]', 
        'Premium laptop with Intel i7 processor, 32GB RAM, 1TB SSD', 
        'Dell XPS 15 with i7 processor and 32GB RAM', 
        '456789012345', 'B0C8J9K2L6', '3-5 business days', '4567890123456', 
        'Dell Store', 'DEAL-004', 'active', 'Dell XPS 15 Laptop i7 32GB - Official Store', 
        'Buy Dell XPS 15 with i7 processor, 32GB RAM, 4K display.', 
        'dell xps 15, i7 processor, 32gb ram, 4k laptop', NOW(), NOW()
      ),
      (
        gen_random_uuid(), 'SPU-005', 'ITEM-005', 'sony-wh-1000xm5-headphones', 
        'Electronics > Audio > Headphones > Sony', 'Electronics', 'Audio', 
        'Headphones', 'Sony', 'Sony WH-1000XM5 Noise Canceling Headphones', 'Sony Corporation', 'Sony', 
        'Color', 'Black', 'Connectivity', 'Wireless', 'SWH1000XM5-BLK', 399.99, 
        349.99, 299.99, 279.99, 'MAP-005', '100', 'Warehouse B', 'Standard', 
        'US, CA, MX, EU', '0', '2024-03-01', '2024-09-01', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', 
        '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"]', 
        'Industry-leading noise canceling headphones with 30-hour battery life', 
        'Sony WH-1000XM5 noise canceling headphones', 
        '567890123456', 'B0C8J9K2L7', '1-2 business days', '5678901234567', 
        'Sony Store', 'DEAL-005', 'active', 'Sony WH-1000XM5 Headphones - Official Store', 
        'Buy Sony WH-1000XM5 noise canceling headphones. 30-hour battery life.', 
        'sony headphones, noise canceling, wh-1000xm5, wireless', NOW(), NOW()
      )
    `
    
    return NextResponse.json({
      success: true,
      message: 'Successfully inserted 5 test products',
      count: result
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to insert test products',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
