import { getPricingDisplay } from '@/lib/pricing'

interface PricingDisplayProps {
  msrp: string | number
  discountedPrice?: string | number
  className?: string
  showDiscountPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function PricingDisplay({ 
  msrp, 
  discountedPrice, 
  className = '', 
  showDiscountPercentage = true,
  size = 'md'
}: PricingDisplayProps) {
  const pricing = getPricingDisplay(msrp, discountedPrice)
  
  const sizeClasses = {
    sm: {
      finalPrice: 'text-sm font-semibold',
      originalPrice: 'text-xs',
      discount: 'text-xs'
    },
    md: {
      finalPrice: 'text-lg font-bold',
      originalPrice: 'text-sm',
      discount: 'text-xs'
    },
    lg: {
      finalPrice: 'text-xl font-bold',
      originalPrice: 'text-base',
      discount: 'text-sm'
    }
  }

  const classes = sizeClasses[size]

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className={`text-gray-900 ${classes.finalPrice}`}>
        {pricing.finalPrice}
      </span>
      
      {pricing.hasDiscount && pricing.originalPrice && (
        <>
          <span className={`text-gray-500 line-through ${classes.originalPrice}`}>
            {pricing.originalPrice}
          </span>
          {showDiscountPercentage && pricing.discountPercentage && (
            <span className={`bg-red-100 text-red-800 px-2 py-1 rounded-full ${classes.discount}`}>
              -{pricing.discountPercentage}%
            </span>
          )}
        </>
      )}
    </div>
  )
}
