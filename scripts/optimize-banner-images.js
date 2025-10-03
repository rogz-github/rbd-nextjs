const fs = require('fs');
const path = require('path');

/**
 * Script to analyze and provide recommendations for optimizing banner images
 * This script checks the banner images in the public/images/banners directory
 * and provides optimization recommendations.
 */

const BANNERS_DIR = path.join(__dirname, '..', 'public', 'images', 'banners');

function getFileSizeInKB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024);
  } catch (error) {
    return 0;
  }
}

function getFileExtension(filePath) {
  return path.extname(filePath).toLowerCase();
}

function analyzeBannerImages() {
  console.log('🔍 Analyzing banner images for optimization...\n');
  
  try {
    const files = fs.readdirSync(BANNERS_DIR);
    const imageFiles = files.filter(file => {
      const ext = getFileExtension(file);
      return ['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext);
    });
    
    if (imageFiles.length === 0) {
      console.log('❌ No image files found in banners directory');
      return;
    }
    
    console.log(`📊 Found ${imageFiles.length} image files:\n`);
    
    let totalSize = 0;
    const recommendations = [];
    
    imageFiles.forEach((file, index) => {
      const filePath = path.join(BANNERS_DIR, file);
      const sizeKB = getFileSizeInKB(filePath);
      const ext = getFileExtension(file);
      
      totalSize += sizeKB;
      
      console.log(`${index + 1}. ${file}`);
      console.log(`   Size: ${sizeKB} KB`);
      console.log(`   Format: ${ext.toUpperCase()}`);
      
      // Provide recommendations based on file size and format
      if (sizeKB > 500) {
        recommendations.push(`⚠️  ${file} is ${sizeKB}KB - consider compressing`);
      }
      
      if (ext === '.jpg' || ext === '.jpeg') {
        recommendations.push(`🔄 ${file} is JPEG - consider converting to WebP for better compression`);
      }
      
      if (ext === '.png') {
        recommendations.push(`🔄 ${file} is PNG - consider converting to WebP or AVIF`);
      }
      
      if (sizeKB < 100 && ext === '.webp') {
        console.log(`   ✅ Well optimized!`);
      }
      
      console.log('');
    });
    
    console.log(`📈 Total size: ${totalSize} KB (${(totalSize / 1024).toFixed(2)} MB)\n`);
    
    if (recommendations.length > 0) {
      console.log('💡 Optimization recommendations:');
      recommendations.forEach(rec => console.log(rec));
      console.log('');
    }
    
    // General recommendations
    console.log('🚀 General optimization tips:');
    console.log('1. Convert all images to WebP format for better compression');
    console.log('2. Use AVIF format for modern browsers (even better than WebP)');
    console.log('3. Optimize images to be under 200KB each for faster loading');
    console.log('4. Use responsive images with different sizes for different screen sizes');
    console.log('5. Consider using a CDN for image delivery');
    console.log('6. Implement lazy loading for images not immediately visible');
    console.log('');
    
    // Check for video files
    const videoFiles = files.filter(file => {
      const ext = getFileExtension(file);
      return ['.mp4', '.webm', '.mov', '.avi'].includes(ext);
    });
    
    if (videoFiles.length > 0) {
      console.log('🎥 Video files found:');
      videoFiles.forEach(file => {
        const filePath = path.join(BANNERS_DIR, file);
        const sizeKB = getFileSizeInKB(filePath);
        console.log(`   ${file} - ${sizeKB} KB`);
        
        if (sizeKB > 2000) {
          console.log(`   ⚠️  Consider compressing this video (${sizeKB}KB is quite large)`);
        }
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing images:', error.message);
  }
}

// Run the analysis
analyzeBannerImages();
