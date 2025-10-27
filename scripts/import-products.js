const fs = require("fs");
const csv = require("csv-parser");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const BATCH_SIZE = 500;
let records = [];
let totalImported = 0;

// Function to parse category hierarchy
function parseCategory(fullCategory) {
  if (!fullCategory) return { cat1: "", cat2: null, cat3: null, cat4: null };
  
  const parts = fullCategory.split(">>").map(c => c.trim());
  return {
    cat1: parts[0] || "",
    cat2: parts[1] || null,
    cat3: parts[2] || null,
    cat4: parts[3] || null,
  };
}

// Function to parse images
function parseImages(row) {
  const images = [];
  
  // Add main image
  if (row["Product Images 1"]) {
    images.push(row["Product Images 1"]);
  }
  
  // Add additional images
  for (let i = 2; i <= 6; i++) {
    if (row[`Product Images ${i}`]) {
      images.push(row[`Product Images ${i}`]);
    }
  }
  
  // Add additional product images (comma-separated)
  if (row["Additional Product Images"]) {
    const additionalImages = row["Additional Product Images"].split("; ").map(img => img.trim()).filter(Boolean);
    images.push(...additionalImages);
  }
  
  return images.length > 0 ? images : null;
}

// Function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Function to parse price
function parsePrice(priceStr) {
  if (!priceStr) return null;
  const price = parseFloat(priceStr.replace(/[^0-9.-]/g, ""));
  return isNaN(price) ? null : price;
}

fs.createReadStream("./csv_file/Product_file_Doba_format-8-26-25.csv")
  .pipe(csv())
  .on("data", async (row) => {
    const category = parseCategory(row.Category);
    const images = parseImages(row);
    const mainImage = row["Product Images 1"] || "";
    
    const record = {
      spuNo: row["SPU NO"] || "",
      itemNo: row["Item No."] || null,
      slug: row.URL ? row.URL.split("/").pop().replace(".html", "") : generateSlug(row["Product Name"]),
      fullCategory: row.Category || "",
      category1: category.cat1,
      category2: category.cat2,
      category3: category.cat3,
      category4: category.cat4,
      name: row["Product Name"] || "",
      supplier: row.Supplier || null,
      brand: row.Brand || null,
      vt1: row["Variation Theme 1"] || null,
      vv1: row["Variation Value 1"] || null,
      vt2: row["Variation Theme 2"] || null,
      vv2: row["Variation Value 2"] || null,
      sku: row["SKU Code"] || null,
      msrp: parsePrice(row["MSRP (US$)"]),
      salePrice: parsePrice(row["Sale Price (US$)"]),
      discountedPrice: parsePrice(row["Sale Price for Pickup (US$)"]),
      dropshippingPrice: parsePrice(row["Dropshipping Price (US$)"]),
      map: row["MAP (US$)"] || null,
      inventory: row["Inventory Qty"] || "0",
      inventoryLoc: row["Inventory Location"] || null,
      shippingMethod: row["Shipping Method"] || null,
      shipTo: row["Ship-to"] || null,
      shippingCost: row["Estimate Shipping Cost (US$)"] || "0",
      promotionStart: row["Promotion Start Date PST"] || null,
      promotionEnd: row["Promotion End Date PST"] || null,
      mainImage: mainImage,
      images: images ? images : null,
      description: row["Description"] || null,
      shortDescription: row.Description ? row.Description.substring(0, 500) : null,
      upc: row.UPC || null,
      asin: row.ASIN || null,
      processingTime: row["Processing Time (business days)"] || null,
      ean: null, // Not in CSV
      dsFrom: row.Supplier || null,
      dealId: null, // Not in CSV
      status: "active",
      metaTitle: row["Product Name"] || null,
      metaDescription: row["Description"] ? row["Description"].substring(0, 160) : null,
      metaKeywords: null, // Not in CSV
    };

    // Only add records with required fields
    if (record.spuNo && record.name) {
      records.push(record);

      if (records.length >= BATCH_SIZE) {
        const batch = records;
        records = [];
        try {
          await prisma.product.createMany({ data: batch, skipDuplicates: true });
          totalImported += batch.length;
          console.log(`Inserted batch of ${batch.length} products. Total: ${totalImported}`);
        } catch (error) {
          console.error(`Error inserting batch:`, error.message);
        }
      }
    }
  })
  .on("end", async () => {
    if (records.length > 0) {
      try {
        await prisma.product.createMany({ data: records, skipDuplicates: true });
        totalImported += records.length;
        console.log(`Inserted final batch of ${records.length} products. Total: ${totalImported}`);
      } catch (error) {
        console.error(`Error inserting final batch:`, error.message);
      }
    }
    console.log(`\nDONE importing. Total products imported: ${totalImported}`);
    await prisma.$disconnect();
  })
  .on("error", (error) => {
    console.error("Error reading CSV:", error);
    prisma.$disconnect();
  });

