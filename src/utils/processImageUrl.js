/**
 * Processes image URLs to convert Unsplash URLs to direct image URLs
 * @param {string} url - The original image URL
 * @returns {string} - The processed image URL
 */
export const processImageUrl = (url) => {
  if (!url) return '';
  
  // Check if it's an Unsplash photo URL (https://unsplash.com/photos/...)
  const unsplashPhotoRegex = /https:\/\/unsplash\.com\/photos\/([^/?]+)/;
  const photoMatch = url.match(unsplashPhotoRegex);
  
  if (photoMatch) {
    const fullPhotoId = photoMatch[1];
    // Extract just the photo ID part (the last segment after the last hyphen)
    const photoId = fullPhotoId.split('-').pop();
    return `https://source.unsplash.com/${photoId}/400x400`;
  }
  
  // Check if it's already a source.unsplash.com URL
  if (url.includes('source.unsplash.com')) {
    return url;
  }
  
  // Check if it's already an images.unsplash.com URL
  if (url.includes('images.unsplash.com')) {
    return url;
  }
  
  // Return the original URL if it's not an Unsplash URL
  return url;
};