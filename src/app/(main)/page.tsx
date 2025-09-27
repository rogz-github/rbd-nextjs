import { Hero } from '@/components/home/hero'
import { FeaturedProducts } from '@/components/home/featured-products'
import { Categories } from '@/components/home/categories'
import { Features } from '@/components/home/features'
import { Newsletter } from '@/components/home/newsletter'

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Features />
      <Newsletter />
    </>
  )
}
