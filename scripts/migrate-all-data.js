const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const BLOG_CONSTANTS_PATH = '/Users/sooryagangaraj/Documents/Kian/KianWebApp/kian-webapp/constants/blog.ts';
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('❌ STRAPI_API_TOKEN environment variable is required');
  console.log('💡 Get your token from Strapi Admin → Settings → API Tokens');
  process.exit(1);
}

console.log('🚀 Starting Future Frames data migration to Strapi...');
console.log(`📍 Strapi URL: ${STRAPI_URL}`);
console.log(`📁 Source: ${BLOG_CONSTANTS_PATH}`);

// Helper function to make API calls to Strapi
async function strapiAPI(endpoint, method = 'GET', data = null) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_API_TOKEN}`
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Strapi API error (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ API call failed: ${endpoint}`, error.message);
    throw error;
  }
}

// Extract data from TypeScript blog constants file
function extractBlogData() {
  console.log('📖 Reading blog constants file...');
  
  try {
    const content = fs.readFileSync(BLOG_CONSTANTS_PATH, 'utf8');
    
    // Extract categories
    const categoriesMatch = content.match(/export const blogCategories: BlogCategory\[\] = \[([\s\S]*?)\];/);
    const categoriesString = categoriesMatch ? categoriesMatch[1] : '';
    const categories = categoriesString
      .split(',')
      .map(cat => cat.trim().replace(/['"]/g, ''))
      .filter(cat => cat.length > 0 && !cat.includes('\n'));
    
    console.log(`📂 Found ${categories.length} categories:`, categories);
    
    // Extract articles - more complex parsing needed
    const articles = extractArticlesFromContent(content);
    
    console.log(`📄 Found ${articles.length} articles`);
    
    return { categories, articles };
  } catch (error) {
    console.error('❌ Error reading blog file:', error.message);
    return null;
  }
}

// Extract individual articles from the TypeScript content
function extractArticlesFromContent(content) {
  const articles = [];
  
  // Find the start of the blogArticles array
  const articlesStart = content.indexOf('export const blogArticles: BlogArticle[] = [');
  if (articlesStart === -1) {
    console.error('❌ Could not find blogArticles array');
    return articles;
  }
  
  // Extract the array content
  const articlesContent = content.substring(articlesStart);
  
  // Use regex to find individual article objects
  const articleMatches = articlesContent.match(/{\s*id:\s*['"`](\d+)['"`][\s\S]*?(?=},\s*{|\}\s*\];)/g);
  
  if (!articleMatches) {
    console.error('❌ Could not parse articles from content');
    return articles;
  }
  
  articleMatches.forEach((articleMatch, index) => {
    try {
      const article = parseArticleObject(articleMatch + '}');
      if (article) {
        articles.push(article);
        console.log(`✅ Parsed article ${index + 1}: "${article.title}"`);
      }
    } catch (error) {
      console.error(`❌ Error parsing article ${index + 1}:`, error.message);
    }
  });
  
  return articles;
}

// Parse individual article object from TypeScript
function parseArticleObject(articleText) {
  try {
    // Extract basic properties using regex
    const extractProperty = (prop, defaultValue = null) => {
      const regex = new RegExp(`${prop}:\\s*['"\`](.*?)['"\`]`, 's');
      const match = articleText.match(regex);
      return match ? match[1] : defaultValue;
    };
    
    const extractPropertyRaw = (prop, defaultValue = null) => {
      const regex = new RegExp(`${prop}:\\s*(.*?)(?=,\\s*\\w+:|\\}$)`, 's');
      const match = articleText.match(regex);
      return match ? match[1].trim() : defaultValue;
    };
    
    // Extract multiline content property
    const contentMatch = articleText.match(/content:\s*`([\s\S]*?)`(?=,\s*\w+:|,?\s*\})/);
    const content = contentMatch ? contentMatch[1] : '';
    
    const article = {
      id: extractProperty('id'),
      slug: extractProperty('slug'),
      title: extractProperty('title'),
      excerpt: extractProperty('excerpt'),
      content: content,
      category: extractProperty('category'),
      featuredImage: extractProperty('featuredImage'),
      author: extractProperty('author'),
      publishedAt: extractProperty('publishedAt'),
      readTime: extractPropertyRaw('readTime'),
      tags: extractPropertyRaw('tags')
    };
    
    // Clean up readTime
    if (article.readTime) {
      const readTimeMatch = article.readTime.match(/(\d+)/);
      article.readTime = readTimeMatch ? parseInt(readTimeMatch[1]) : null;
    }
    
    // Parse tags if they exist
    if (article.tags && article.tags.includes('[')) {
      try {
        const tagsMatch = article.tags.match(/\[(.*?)\]/);
        if (tagsMatch) {
          article.tags = tagsMatch[1]
            .split(',')
            .map(tag => tag.trim().replace(/['"]/g, ''))
            .filter(tag => tag.length > 0);
        }
      } catch (e) {
        article.tags = [];
      }
    } else {
      article.tags = [];
    }
    
    return article;
  } catch (error) {
    console.error('Error parsing article object:', error.message);
    return null;
  }
}

// Create categories in Strapi
async function createCategories(categories) {
  console.log('\n📂 Creating categories in Strapi...');
  
  const categoryMap = {};
  
  for (const categoryName of categories) {
    try {
      const slug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
      
      const categoryData = {
        data: {
          name: categoryName,
          slug: slug,
          description: `Articles related to ${categoryName}`
        }
      };
      
      console.log(`➕ Creating category: ${categoryName}`);
      const response = await strapiAPI('/categories', 'POST', categoryData);
      
      categoryMap[categoryName] = response.data.documentId;
      console.log(`✅ Created category: ${categoryName} (ID: ${response.data.documentId})`);
      
    } catch (error) {
      if (error.message.includes('unique')) {
        console.log(`⚠️  Category "${categoryName}" already exists, skipping...`);
        // Try to get existing category
        try {
          const existing = await strapiAPI(`/categories?filters[name][$eq]=${encodeURIComponent(categoryName)}`);
          if (existing.data.length > 0) {
            categoryMap[categoryName] = existing.data[0].documentId;
          }
        } catch (e) {
          console.error(`❌ Error getting existing category: ${categoryName}`);
        }
      } else {
        console.error(`❌ Error creating category "${categoryName}":`, error.message);
      }
    }
  }
  
  return categoryMap;
}

// Create articles in Strapi
async function createArticles(articles, categoryMap) {
  console.log('\n📄 Creating articles in Strapi...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const article of articles) {
    try {
      // Get category ID
      const categoryId = categoryMap[article.category];
      if (!categoryId) {
        console.error(`❌ Category not found for article "${article.title}": ${article.category}`);
        errorCount++;
        continue;
      }
      
      // Prepare article data for Strapi
      const articleData = {
        data: {
          title: article.title,
          excerpt: article.excerpt,
          slug: article.slug,
          content: article.content,
          author: article.author || 'Kiantechwise Team',
          publishedAt: article.publishedAt,
          readTime: article.readTime,
          category: categoryId,
          tags: article.tags || []
        }
      };
      
      console.log(`➕ Creating article: "${article.title}"`);
      const response = await strapiAPI('/articles', 'POST', articleData);
      
      console.log(`✅ Created article: "${article.title}" (ID: ${response.data.documentId})`);
      successCount++;
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error creating article "${article.title}":`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Successfully created: ${successCount} articles`);
  console.log(`❌ Errors: ${errorCount} articles`);
  
  return { successCount, errorCount };
}

// Test Strapi connection
async function testConnection() {
  try {
    console.log('🔍 Testing Strapi connection...');
    await strapiAPI('/articles?pagination[limit]=1');
    console.log('✅ Strapi connection successful');
    return true;
  } catch (error) {
    console.error('❌ Strapi connection failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('- Strapi server is running');
    console.log('- STRAPI_API_TOKEN is valid');
    console.log('- API endpoint is accessible');
    return false;
  }
}

// Main migration function
async function runMigration() {
  try {
    // Test connection first
    const connectionOk = await testConnection();
    if (!connectionOk) {
      process.exit(1);
    }
    
    // Extract data from blog constants
    const blogData = extractBlogData();
    if (!blogData) {
      console.error('❌ Failed to extract blog data');
      process.exit(1);
    }
    
    // Create categories
    const categoryMap = await createCategories(blogData.categories);
    
    // Create articles
    const results = await createArticles(blogData.articles, categoryMap);
    
    console.log('\n🎉 Migration completed!');
    console.log(`📊 Total articles processed: ${blogData.articles.length}`);
    console.log(`✅ Successfully migrated: ${results.successCount}`);
    console.log(`❌ Failed: ${results.errorCount}`);
    
    if (results.errorCount > 0) {
      console.log('\n⚠️  Some articles failed to migrate. Check the errors above.');
      console.log('You can re-run the script to retry failed articles.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ with built-in fetch support');
  console.log('💡 Upgrade your Node.js version or install node-fetch');
  process.exit(1);
}

// Run the migration
runMigration();