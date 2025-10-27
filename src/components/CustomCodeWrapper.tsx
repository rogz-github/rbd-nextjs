import { prisma } from '@/lib/prisma'

export default async function CustomCodeWrapper({ location }: { location: 'head' | 'body' }) {
  try {
    // @ts-ignore - SiteSettings will be available after prisma generate
    const settings = await prisma.siteSettings?.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    }).catch(() => []) || []

    // If no settings found or Prisma client not updated, return empty
    if (!settings || settings.length === 0) {
      return null
    }

    // Filter by location and extract values
    const codes = (settings as any[])
      .filter((setting: any) => setting.location === location)
      .map((setting: any) => setting.value)
      .filter(Boolean)

    if (codes.length === 0) {
      return null
    }

    return (
      <>
        {codes.map((code: string, index: number) => (
          <div 
            key={index}
            dangerouslySetInnerHTML={{ __html: code }}
            style={{ display: 'contents' }}
          />
        ))}
      </>
    )
  } catch (error) {
    // Silently fail if Prisma client is not updated yet
    console.error('Error loading site settings (this is normal if Prisma client needs regeneration):', error)
    return null
  }
}

