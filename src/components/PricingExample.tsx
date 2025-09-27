'use client'

import { useState } from 'react'
import { PricingDisplay } from './PricingDisplay'

export function PricingExample() {
  const [msrp, setMsrp] = useState('100.00')
  const [discount, setDiscount] = useState('20.00')

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Pricing Example</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            MSRP (Original Price)
          </label>
          <input
            type="number"
            value={msrp}
            onChange={(e) => setMsrp(e.target.value)}
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Amount
          </label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Sees:</h4>
          <PricingDisplay 
            msrp={msrp}
            discountedPrice={discount}
            size="lg"
          />
          
          <div className="mt-2 text-xs text-gray-500">
            Final Price: ${msrp} - ${discount} = ${(parseFloat(msrp) - parseFloat(discount)).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}
