// Utility functions for handling images safely with Next.js Image component

export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  
  // Check if it's a valid URL format
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    // If URL constructor fails, check if it starts with http/https
    return url.startsWith('http://') || url.startsWith('https://')
  }
}

export function sanitizeImageUrl(url: string | null | undefined): string {
  if (!url) return '/images/placeholder-product.jpg'
  
  // If it's already a valid URL, return it
  if (isValidImageUrl(url)) {
    return url
  }
  
  // If it starts with a slash, it's a relative path - make sure it starts with /
  if (url.startsWith('/')) {
    return url
  }
  
  // If it's just text or invalid data, return placeholder
  return '/images/placeholder-product.jpg'
}

export function sanitizeImageArray(images: any[] | null | undefined): any[] {
  if (!images || !Array.isArray(images)) return []
  
  return images
    .filter(img => img && typeof img === 'object' && img.img)
    .map(img => ({
      ...img,
      img: sanitizeImageUrl(img.img)
    }))
    .filter(img => img.img !== '/images/placeholder-product.jpg' || images.length === 1) // Keep at least one image
}








