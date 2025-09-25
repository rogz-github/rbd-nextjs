// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const { faker } = require('@faker-js/faker')

const prisma = new PrismaClient()

async function main() {
  for (let i = 0; i < 50000; i++) {
    await prisma.product.create({
      data: {
        spuNo: faker.string.uuid(),
        itemNo: faker.string.uuid(),
        slug: faker.lorem.slug(),
        fullCategory: "Electronics > Phones",
        category1: "Electronics",
        name: faker.commerce.productName(),
        brand: faker.company.name(),
        msrp: 100,
        salePrice: 80,
        discountedPrice: 70,
        dropshippingPrice: 65,
        mainImage: "https://via.placeholder.com/300",
        images: [faker.image.url()],
        description: faker.commerce.productDescription(),
        shortDescription: faker.lorem.sentence(),
        status: "active"
      }
    })
  }
}

main()
  .then(() => {
    console.log("🌱 Seeding complete")
    return prisma.$disconnect()
  })
  .catch((e) => {
    console.error(e)
    return prisma.$disconnect().finally(() => process.exit(1))
  })
