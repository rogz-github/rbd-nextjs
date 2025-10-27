interface Category {
  id: number
  name: string
  slug: string
  children?: Category[]
}

/**
 * Build a hierarchical path for a category by traversing up the tree
 */
export function getCategoryPath(category: Category, allCategories: Category[]): string {
  // Start with the category's own slug
  let path = [category.slug]
  
  // Helper function to find parent of a category
  const findParent = (targetCategory: Category, categories: Category[], parentPath: string[] = []): string[] | null => {
    for (const cat of categories) {
      if (cat.children) {
        for (const child of cat.children) {
          if (child.id === targetCategory.id || child.slug === targetCategory.slug) {
            return [cat.slug, ...parentPath]
          }
          
          const deeperParent = findParent(targetCategory, cat.children, [cat.slug, ...parentPath])
          if (deeperParent) {
            return deeperParent
          }
          
          if (child.children) {
            const result = findParent(targetCategory, [child], [cat.slug])
            if (result) {
              return [...result]
            }
          }
        }
      }
    }
    return null
  }
  
  // Try to find the parent path by searching through all categories
  // For now, we'll use a simpler approach: just return the category slug for root level
  // For nested categories, we need to search recursively
  
  return `/${path.join('/')}`
}

/**
 * Build hierarchical path for a category by finding it in the category tree
 */
export function buildCategoryPath(category: Category, categories: Category[], parentPath: string[] = []): string {
  // Check if this category is in the root level
  for (const cat of categories) {
    if (cat.id === category.id && cat.slug === category.slug) {
      return `/${category.slug}`
    }
    
    // Check children
    if (cat.children && cat.children.length > 0) {
      for (const child of cat.children) {
        if (child.id === category.id && child.slug === category.slug) {
          return `/${cat.slug}/${category.slug}`
        }
        
        // Check grandchildren
        if (child.children && child.children.length > 0) {
          for (const grandchild of child.children) {
            if (grandchild.id === category.id && grandchild.slug === category.slug) {
              return `/${cat.slug}/${child.slug}/${category.slug}`
            }
            
            // Check great-grandchildren (4 levels deep)
            if (grandchild.children && grandchild.children.length > 0) {
              for (const greatGrandchild of grandchild.children) {
                if (greatGrandchild.id === category.id && greatGrandchild.slug === category.slug) {
                  return `/${cat.slug}/${child.slug}/${grandchild.slug}/${category.slug}`
                }
              }
            }
          }
        }
      }
    }
  }
  
  // If not found, return just the category slug
  return `/${category.slug}`
}

/**
 * Recursively find a category by ID or slug in the category tree
 */
function findCategoryInTree(
  targetId: number,
  targetSlug: string,
  categories: Category[],
  pathSoFar: string[] = []
): string[] | null {
  for (const cat of categories) {
    const currentPath = [...pathSoFar, cat.slug]
    
    if (cat.id === targetId && cat.slug === targetSlug) {
      return currentPath
    }
    
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryInTree(targetId, targetSlug, cat.children, currentPath)
      if (found) {
        return found
      }
    }
  }
  
  return null
}

/**
 * Get the full hierarchical path for a category
 * This returns paths with /c1 prefix for cleaner URLs
 */
export function getCategoryHierarchicalPath(category: Category, allCategories: Category[]): string {
  const path = findCategoryInTree(category.id, category.slug, allCategories)
  
  if (path) {
    // Return path with /c1 prefix
    return '/c1/' + path.join('/')
  }
  
  // Fallback to just the slug with /c1 prefix
  return `/c1/${category.slug}`
}

