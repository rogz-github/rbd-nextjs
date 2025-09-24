# Public Assets Directory

This directory contains static assets that can be served directly by Next.js.

## Image Storage Best Practices

### For the RBD Logo/Banner Image:

1. **Save the image as**: `rbd-logo.png` or `rbd-banner.png`
2. **Recommended dimensions**: 
   - For logo: 200x80px (or similar aspect ratio)
   - For banner: 1200x300px (or similar aspect ratio)
3. **Format**: PNG (for logos with transparency) or WebP (for better compression)

### Usage in Next.js Components:

```tsx
import Image from 'next/image'

// For logo
<Image
  src="/rbd-logo.png"
  alt="RBD Logo"
  width={200}
  height={80}
  priority // if it's above the fold
/>

// For banner
<Image
  src="/rbd-banner.png"
  alt="RBD Banner"
  width={1200}
  height={300}
  priority // if it's above the fold
/>
```

### File Structure:
```
public/
├── images/
│   ├── logo/
│   │   └── rbd-logo.png
│   ├── banners/
│   │   └── rbd-banner.png
│   └── icons/
└── README.md
```

### Next.js Image Optimization:
- Images are automatically optimized
- Supports lazy loading
- Responsive images with srcSet
- WebP format when supported by browser
