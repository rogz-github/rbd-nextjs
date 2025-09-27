/**
 * Utility functions for product pricing calculations
 */

export interface PricingInfo {
  finalPrice: number
  originalPrice?: number
  hasDiscount: boolean
  discountAmount?: number
  discountPercentage?: number
}

/**
 * Calculate pricing information based on MSRP and discounted price
 * @param msrp - Manufacturer's Suggested Retail Price
 * @param discountedPrice - Discount amount (not percentage)
 * @returns PricingInfo object with calculated values
 */
export function calculatePricing(msrp: string | number, discountedPrice?: string | number): PricingInfo {
  const msrpNum = typeof msrp === 'string' ? parseFloat(msrp) : msrp
  const discountedNum = discountedPrice ? (typeof discountedPrice === 'string' ? parseFloat(discountedPrice) : discountedPrice) : 0

  // If no discount or invalid values
  if (!discountedNum || discountedNum <= 0 || isNaN(msrpNum) || isNaN(discountedNum)) {
    return {
      finalPrice: msrpNum,
      hasDiscount: false
    }
  }

  // Calculate final price (MSRP - discount amount)
  const finalPrice = msrpNum - discountedNum
  const discountAmount = discountedNum
  const discountPercentage = Math.round((discountAmount / msrpNum) * 100)

  return {
    finalPrice: Math.max(0, finalPrice), // Ensure price doesn't go below 0
    originalPrice: msrpNum,
    hasDiscount: true,
    discountAmount,
    discountPercentage
  }
}

/**
 * Format price for display
 * @param price - Price to format
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

/**
 * Get pricing display components for UI
 * @param msrp - MSRP value
 * @param discountedPrice - Discount amount
 * @returns Object with formatted price strings and discount info
 */
export function getPricingDisplay(msrp: string | number, discountedPrice?: string | number) {
  const pricing = calculatePricing(msrp, discountedPrice)
  
  return {
    finalPrice: formatPrice(pricing.finalPrice),
    originalPrice: pricing.originalPrice ? formatPrice(pricing.originalPrice) : null,
    hasDiscount: pricing.hasDiscount,
    discountPercentage: pricing.discountPercentage,
    discountAmount: pricing.discountAmount ? formatPrice(pricing.discountAmount) : null
  }
}
