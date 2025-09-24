import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = []
}: SEOProps): Metadata {
  const siteName = 'RBD E-Commerce'
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rbd-ecommerce.com'
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const fullDescription = description || 'Discover amazing products at great prices. Fast shipping, secure checkout, and excellent customer service.'
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl

  const metadata: Metadata = {
    title: fullTitle,
    description: fullDescription,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    authors: author ? [{ name: author }] : [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    openGraph: {
      type: type === 'product' ? 'website' : type,
      locale: 'en_US',
      url: fullUrl,
      title: fullTitle,
      description: fullDescription,
      siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
      creator: '@rbdecommerce',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: fullUrl,
    },
  }

  // Note: publishedTime, modifiedTime, and section are not supported in Next.js OpenGraph type
  // These would need to be handled differently if needed

  // Note: tags are not directly supported in Next.js OpenGraph type
  // These would need to be handled differently if needed

  return metadata
}

export function generateStructuredData({
  type,
  name,
  description,
  image,
  price,
  currency = 'USD',
  availability = 'InStock',
  brand,
  sku,
  category,
  rating,
  reviewCount,
  url
}: {
  type: 'Product' | 'Organization' | 'WebSite'
  name?: string
  description?: string
  image?: string
  price?: number
  currency?: string
  availability?: string
  brand?: string
  sku?: string
  category?: string
  rating?: number
  reviewCount?: number
  url?: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rbd-ecommerce.com'

  switch (type) {
    case 'Product':
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        image: image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : undefined,
        brand: brand ? { '@type': 'Brand', name: brand } : undefined,
        sku,
        category,
        offers: {
          '@type': 'Offer',
          price,
          priceCurrency: currency,
          availability: `https://schema.org/${availability}`,
          url: url ? `${siteUrl}${url}` : undefined,
        },
        aggregateRating: rating && reviewCount ? {
          '@type': 'AggregateRating',
          ratingValue: rating,
          reviewCount,
        } : undefined,
      }

    case 'Organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'RBD E-Commerce',
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description: 'Premium online shopping destination with quality products and excellent service.',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-555-123-4567',
          contactType: 'customer service',
          availableLanguage: 'English',
        },
        sameAs: [
          'https://facebook.com/rbdecommerce',
          'https://twitter.com/rbdecommerce',
          'https://instagram.com/rbdecommerce',
        ],
      }

    case 'WebSite':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'RBD E-Commerce',
        url: siteUrl,
        description: 'Discover amazing products at great prices. Fast shipping, secure checkout, and excellent customer service.',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/products?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }

    default:
      return {}
  }
}
