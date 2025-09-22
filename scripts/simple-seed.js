const fs = require('fs');
const path = require('path');

// Read the extracted JSON data
const categoriesPath = path.join(__dirname, '../data/extracted-categories.json');
const articlesPath = path.join(__dirname, '../data/extracted-articles.json');

// Configuration
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('❌ STRAPI_API_TOKEN environment variable is required');
  console.log('💡 To get your token:');
  console.log('1. Go to Strapi Admin → Settings → API Tokens');
  console.log('2. Create a new token with "Full access"');
  console.log('3. Set it as: export STRAPI_API_TOKEN="your_token_here"');
  process.exit(1);
}

console.log('🚀 Starting simple data migration to Strapi...');
console.log(`📍 Strapi URL: ${STRAPI_URL}`);

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
    console.log('- Strapi server is running (npm run develop)');
    console.log('- STRAPI_API_TOKEN is valid');
    console.log('- API endpoint is accessible');
    return false;
  }
}

// Create categories in Strapi
async function createCategories() {
  console.log('\n📂 Creating categories in Strapi...');
  
  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
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
      if (error.message.includes('unique') || error.message.includes('already exists')) {
        console.log(`⚠️  Category "${categoryName}" already exists, fetching ID...`);
        try {
          const existing = await strapiAPI(`/categories?filters[name][$eq]=${encodeURIComponent(categoryName)}`);
          if (existing.data.length > 0) {
            categoryMap[categoryName] = existing.data[0].documentId;
            console.log(`✅ Found existing category: ${categoryName} (ID: ${existing.data[0].documentId})`);
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
async function createArticles(categoryMap) {
  console.log('\n📄 Creating articles in Strapi...');
  
  const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    
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
          title: article.title || `Article ${article.id}`,
          excerpt: article.excerpt || '',
          slug: article.slug || `article-${article.id}`,
          content: article.content || '',
          author: article.author || 'Kiantechwise Team',
          publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
          readTime: article.readTime || 5,
          category: categoryId,
          tags: article.tags || []
        }
      };
      
      console.log(`➕ Creating article ${i + 1}/${articles.length}: "${articleData.data.title}"`);
      const response = await strapiAPI('/articles', 'POST', articleData);
      
      console.log(`✅ Created article: "${articleData.data.title}" (ID: ${response.data.documentId})`);
      successCount++;
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      if (error.message.includes('unique') || error.message.includes('already exists')) {
        console.log(`⚠️  Article "${article.title}" already exists, skipping...`);
      } else {
        console.error(`❌ Error creating article "${article.title}":`, error.message);
        errorCount++;
      }
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Successfully created: ${successCount} articles`);
  console.log(`❌ Errors: ${errorCount} articles`);
  console.log(`📄 Total processed: ${articles.length} articles`);
  
  return { successCount, errorCount, total: articles.length };
}

// Main migration function
async function runMigration() {
  try {
    // Test connection first
    const connectionOk = await testConnection();
    if (!connectionOk) {
      process.exit(1);
    }
    
    // Check if extracted data exists
    if (!fs.existsSync(categoriesPath) || !fs.existsSync(articlesPath)) {
      console.error('❌ Extracted data files not found');
      console.log('💡 Run: node scripts/extract-articles-json.js first');
      process.exit(1);
    }
    
    // Create categories
    const categoryMap = await createCategories();
    
    // Create articles
    const results = await createArticles(categoryMap);
    
    console.log('\n🎉 Migration completed!');
    console.log(`📊 Results:`);
    console.log(`   - Total articles: ${results.total}`);
    console.log(`   - Successfully migrated: ${results.successCount}`);
    console.log(`   - Failed: ${results.errorCount}`);
    console.log(`   - Categories: ${Object.keys(categoryMap).length}`);
    
    if (results.errorCount > 0) {
      console.log('\n⚠️  Some articles failed to migrate. Check the errors above.');
      console.log('You can re-run the script to retry failed articles.');
    } else {
      console.log('\n🎊 All articles migrated successfully!');
      console.log('🌐 Your Future Frames blog is now powered by Strapi!');
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