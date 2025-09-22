const fs = require('fs');
const path = require('path');

// Configuration
const BLOG_CONSTANTS_PATH = '/Users/sooryagangaraj/Documents/Kian/KianWebApp/kian-webapp/constants/blog.ts';

// Read and parse the blog constants file to extract clean JSON data
function extractBlogDataToJSON() {
  console.log('📖 Reading blog constants file...');
  
  try {
    const content = fs.readFileSync(BLOG_CONSTANTS_PATH, 'utf8');
    
    // Execute the TypeScript content by creating a temporary evaluation context
    // This is safer than eval() as we're only extracting data
    const extractedData = extractDataSafely(content);
    
    if (extractedData) {
      // Save extracted data to JSON files
      fs.writeFileSync(
        path.join(__dirname, '../data/extracted-categories.json'),
        JSON.stringify(extractedData.categories, null, 2)
      );
      
      fs.writeFileSync(
        path.join(__dirname, '../data/extracted-articles.json'),
        JSON.stringify(extractedData.articles, null, 2)
      );
      
      console.log('✅ Data extracted successfully!');
      console.log(`📂 Categories: ${extractedData.categories.length}`);
      console.log(`📄 Articles: ${extractedData.articles.length}`);
      console.log('📁 Files saved to:');
      console.log('  - data/extracted-categories.json');
      console.log('  - data/extracted-articles.json');
      
      return extractedData;
    }
    
  } catch (error) {
    console.error('❌ Error extracting blog data:', error.message);
    return null;
  }
}

// Safely extract data from TypeScript content
function extractDataSafely(content) {
  try {
    // Create a mock module environment
    const moduleCode = `
      // Mock the module structure
      const exports = {};
      const module = { exports };
      
      // Define the types as they appear in the original file
      ${content}
      
      // Return the data we need
      return {
        categories: blogCategories,
        articles: blogArticles
      };
    `;
    
    // Use Function constructor instead of eval for safer execution
    const extractorFunction = new Function(moduleCode);
    const result = extractorFunction();
    
    return result;
    
  } catch (error) {
    console.error('Error in safe extraction:', error.message);
    
    // Fallback to regex-based extraction
    return extractWithRegex(content);
  }
}

// Fallback regex-based extraction
function extractWithRegex(content) {
  console.log('📝 Using regex-based extraction...');
  
  const categories = ['News & Updates', 'Design', 'Development', 'Marketing'];
  
  // Extract articles using a more robust approach
  const articles = [];
  
  // Find all article objects
  const articleRegex = /{\s*id:\s*['"`](\d+)['"`],[\s\S]*?(?=},\s*{|}\s*\];)/g;
  let match;
  
  while ((match = articleRegex.exec(content)) !== null) {
    const articleText = match[0] + '}';
    const article = parseArticleFromText(articleText);
    if (article) {
      articles.push(article);
    }
  }
  
  return { categories, articles };
}

// Parse individual article from text
function parseArticleFromText(text) {
  try {
    const article = {};
    
    // Helper to extract quoted values
    const getQuotedValue = (prop) => {
      const regex = new RegExp(`${prop}:\\s*['"\`](.*?)['"\`]`, 's');
      const match = text.match(regex);
      return match ? match[1] : null;
    };
    
    // Helper to extract numeric values
    const getNumericValue = (prop) => {
      const regex = new RegExp(`${prop}:\\s*(\\d+)`);
      const match = text.match(regex);
      return match ? parseInt(match[1]) : null;
    };
    
    // Extract basic properties
    article.id = getQuotedValue('id');
    article.slug = getQuotedValue('slug');
    article.title = getQuotedValue('title');
    article.excerpt = getQuotedValue('excerpt');
    article.category = getQuotedValue('category');
    article.featuredImage = getQuotedValue('featuredImage');
    article.author = getQuotedValue('author');
    article.publishedAt = getQuotedValue('publishedAt');
    article.readTime = getNumericValue('readTime');
    
    // Extract content (multiline)
    const contentMatch = text.match(/content:\s*`([\s\S]*?)`/);
    article.content = contentMatch ? contentMatch[1] : '';
    
    // Extract tags array
    const tagsMatch = text.match(/tags:\s*\[(.*?)\]/s);
    if (tagsMatch) {
      article.tags = tagsMatch[1]
        .split(',')
        .map(tag => tag.trim().replace(/['"]/g, ''))
        .filter(tag => tag.length > 0);
    } else {
      article.tags = [];
    }
    
    return article;
    
  } catch (error) {
    console.error('Error parsing article:', error.message);
    return null;
  }
}

// Run the extraction
const result = extractBlogDataToJSON();

if (result) {
  console.log('\n📊 Sample data:');
  console.log('First category:', result.categories[0]);
  if (result.articles.length > 0) {
    console.log('First article title:', result.articles[0].title);
    console.log('First article slug:', result.articles[0].slug);
  }
}