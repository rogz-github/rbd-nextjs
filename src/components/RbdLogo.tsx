import Image from 'next/image'
import { cn } from '@/lib/utils'

interface RbdLogoProps {
  variant?: 'logo' | 'banner'
  className?: string
  priority?: boolean
  showText?: boolean
}

export default function RbdLogo({ 
  variant = 'logo', 
  className,
  priority = false,
  showText = false
}: RbdLogoProps) {
  const isBanner = variant === 'banner'
  
  return (
    <div className={cn('relative flex items-center', className)}>
      <Image
        src="/images/logo/ready-logo.webp"
        alt="RBD Logo"
        width={isBanner ? 200 : 250}
        height={isBanner ? 80 : 60}
        priority={priority}
        quality={100}
        className="object-contain"
        style={{ height: 'auto', width: 'auto' }} // ✅ prevents warning
      />

    </div>
  )
}

// Usage examples:
// <RbdLogo variant="logo" className="h-16 w-auto" />
// <RbdLogo variant="banner" className="w-full h-32" priority />
// <RbdLogo showText={false} className="h-10 w-10" />
