// Central configuration for admin navigation routes
export interface AdminRoute {
  title: string
  href: string
  icon?: any
  badge?: string
  badgeColor?: string
}

export const ADMIN_ROUTES = {
  menuItems: [
    {
      title: 'Dashboard',
      href: '/~admin/dashboard',
      icon: 'PieChart'
    }
  ],
  
  checkoutItems: [
    {
      title: 'Orders',
      href: '/~admin/orders',
      badgeColor: 'bg-yellow-500' // dynamic badge will be added
    },
    {
      title: 'Abandoned Checkout',
      href: '/~admin/abandoned-checkout',
      badgeColor: 'bg-gray-400'
    }
  ],
  
  categoryItems: [
    {
      title: 'Categories 1',
      href: '/~admin/category/one'
    },
    {
      title: 'Categories 2',
      href: '/~admin/category/two'
    },
    {
      title: 'Categories 3',
      href: '/~admin/category/three'
    },
    {
      title: 'Categories 4',
      href: '/~admin/category/four'
    },
    {
      title: 'Categories Settings',
      href: '/~admin/category/settings'
    }
  ],
  
  productItems: [
    {
      title: 'Add Product',
      href: '/~admin/products/add',
      icon: 'Plus'
    },
    {
      title: 'All Products',
      href: '/~admin/products',
      icon: 'List'
    },
    {
      title: 'Sale Products',
      href: '/~admin/products/sale',
      icon: 'Percent'
    },
    {
      title: 'Coupons',
      href: '/~admin/coupons',
      icon: 'Tag'
    }
  ],
  
  pageItems: [
    {
      title: 'Slider Banner',
      href: '/~admin/slider-banners',
      icon: 'Image'
    },
    {
      title: 'Bottom Banner',
      href: '/~admin/bottom-banner',
      icon: 'Grid3X3'
    },
    {
      title: '3 Images',
      href: '/~admin/three-images',
      icon: 'Grid3X3'
    },
    {
      title: 'Best Deal Available',
      href: '/~admin/best-deal',
      icon: 'Star'
    },
    {
      title: 'Displayed Products',
      href: '/~admin/displayed-products',
      icon: 'Package'
    },
    {
      title: 'Displayed Images',
      href: '/~admin/displayed-images',
      icon: 'Eye'
    }
  ]
} as const

// Helper function to check if a route exists
export function routeExists(pathname: string): boolean {
  const allRoutes = [
    ...ADMIN_ROUTES.menuItems,
    ...ADMIN_ROUTES.checkoutItems,
    ...ADMIN_ROUTES.categoryItems,
    ...ADMIN_ROUTES.productItems,
    ...ADMIN_ROUTES.pageItems
  ]
  
  return allRoutes.some(route => route.href === pathname)
}

// Helper function to get route by href
export function getRouteByHref(href: string) {
  const allRoutes = [
    ...ADMIN_ROUTES.menuItems,
    ...ADMIN_ROUTES.checkoutItems,
    ...ADMIN_ROUTES.categoryItems,
    ...ADMIN_ROUTES.productItems,
    ...ADMIN_ROUTES.pageItems
  ]
  
  return allRoutes.find(route => route.href === href)
}
