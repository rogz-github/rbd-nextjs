// Utility functions for CSV processing

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

export function processImagesFromCSV(data: string[]): string {
  const images = []
  
  // Process individual image columns (29-34)
  for (let i = 29; i <= 34; i++) {
    if (data[i] && data[i].trim() !== '') {
      if (i === 34) {
        // Handle the last column which might contain multiple images separated by semicolons
        const imgParts = data[i].split(';')
        for (const part of imgParts) {
          const imgUrl = part.trim()
          if (imgUrl && isValidImageUrl(imgUrl)) {
            images.push({ img: imgUrl })
          }
        }
      } else {
        const imgUrl = data[i].trim()
        if (isValidImageUrl(imgUrl)) {
          images.push({ img: imgUrl })
        }
      }
    }
  }
  
  return JSON.stringify(images)
}

export function validateMainImage(mainImage: string): string {
  return isValidImageUrl(mainImage) 
    ? mainImage.replace(/\.jpg$/, '.webp') 
    : '/images/placeholder-product.jpg'
}

