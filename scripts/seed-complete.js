const fs = require('fs');
const path = require('path');

// Configuration
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('❌ STRAPI_API_TOKEN environment variable is required');
  console.log('💡 Get your token from Strapi Admin → Settings → API Tokens');
  process.exit(1);
}

console.log('🚀 Starting complete Future Frames data seeding...');
console.log(`📍 Strapi URL: ${STRAPI_URL}`);

// Check for extracted data
const categoriesPath = path.join(__dirname, '../data/complete-categories.json');
const articlesPath = path.join(__dirname, '../data/complete-articles.json');

if (!fs.existsSync(categoriesPath) || !fs.existsSync(articlesPath)) {
  console.error('❌ Complete data files not found');
  console.log('💡 Run: npm run extract:complete first');
  process.exit(1);
}

// Load the extracted data
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));

console.log(`📊 Data loaded:`);
console.log(`   📂 Categories: ${categories.length}`);
console.log(`   📄 Articles: ${articles.length}`);

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
    throw new Error(`API call failed: ${error.message}`);
  }
}

// Test connection
async function testConnection() {
  try {
    console.log('🔍 Testing Strapi connection...');
    await strapiAPI('/articles?pagination[limit]=1');
    console.log('✅ Strapi connection successful');
    return true;
  } catch (error) {
    console.error('❌ Strapi connection failed:', error.message);
    return false;
  }
}

// Clear existing data (optional)
async function clearExistingData() {
  console.log('\n🧹 Checking for existing data...');
  
  try {
    // Get existing articles
    const existingArticles = await strapiAPI('/articles');
    if (existingArticles.data.length > 0) {
      console.log(`⚠️  Found ${existingArticles.data.length} existing articles`);
      console.log('💡 Tip: Delete them manually in Strapi admin if you want a fresh start');
    }
    
    // Get existing categories
    const existingCategories = await strapiAPI('/categories');
    if (existingCategories.data.length > 0) {
      console.log(`⚠️  Found ${existingCategories.data.length} existing categories`);
    }
    
  } catch (error) {
    console.log('ℹ️  No existing data found (this is normal for first run)');
  }
}

// Create categories
async function seedCategories() {
  console.log('\n📂 Seeding categories...');
  
  const categoryMap = {};
  
  for (const category of categories) {
    try {
      const categoryData = {
        data: {
          name: category.name,
          slug: category.slug,
          description: category.description
        }
      };
      
      console.log(`➕ Creating category: ${category.name}`);
      const response = await strapiAPI('/categories', 'POST', categoryData);
      
      categoryMap[category.name] = response.data.documentId;
      console.log(`✅ Created: ${category.name} (ID: ${response.data.documentId})`);
      
    } catch (error) {
      if (error.message.includes('unique') || error.message.includes('already exists')) {
        console.log(`⚠️  Category "${category.name}" already exists, fetching ID...`);
        try {
          const existing = await strapiAPI(`/categories?filters[name][$eq]=${encodeURIComponent(category.name)}`);
          if (existing.data.length > 0) {
            categoryMap[category.name] = existing.data[0].documentId;
            console.log(`✅ Found existing: ${category.name} (ID: ${existing.data[0].documentId})`);
          }
        } catch (e) {
          console.error(`❌ Error getting existing category: ${category.name}`);
        }
      } else {
        console.error(`❌ Error creating category "${category.name}":`, error.message);
      }
    }
  }
  
  return categoryMap;
}

// Create articles with complete content
async function seedArticles(categoryMap) {
  console.log('\n📄 Seeding articles with complete content...');
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
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
      
      // Validate article data
      if (!article.title || !article.content) {
        console.error(`❌ Missing required data for article: ${article.title || 'Unknown'}`);
        errorCount++;
        continue;
      }
      
      // Prepare complete article data
      const articleData = {
        data: {
          title: article.title,
          excerpt: article.excerpt || '',
          slug: article.slug,
          content: article.content,
          author: article.author || 'Kiantechwise Team',
          publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
          readTime: article.readTime || Math.ceil(article.content.length / 1000) || 5,
          category: categoryId,
          tags: article.tags || []
        }
      };
      
      console.log(`➕ Creating article ${i + 1}/${articles.length}: "${article.title}"`);
      console.log(`   📊 Content length: ${article.content.length} characters`);
      console.log(`   📂 Category: ${article.category}`);
      console.log(`   🏷️  Tags: ${article.tags?.length || 0}`);
      
      const response = await strapiAPI('/articles', 'POST', articleData);
      
      console.log(`✅ Created: "${article.title}" (ID: ${response.data.documentId})`);
      successCount++;
      
      // Delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      if (error.message.includes('unique') || error.message.includes('already exists')) {
        console.log(`⚠️  Article "${article.title}" already exists, skipping...`);
        skippedCount++;
      } else {
        console.error(`❌ Error creating article "${article.title}":`, error.message);
        errorCount++;
      }
    }
  }
  
  return { successCount, errorCount, skippedCount };
}

// Verify seeded data
async function verifySeededData() {
  console.log('\n🔍 Verifying seeded data...');
  
  try {
    const categoriesResponse = await strapiAPI('/categories');
    const articlesResponse = await strapiAPI('/articles?populate=*');
    
    console.log(`✅ Categories in Strapi: ${categoriesResponse.data.length}`);
    console.log(`✅ Articles in Strapi: ${articlesResponse.data.length}`);
    
    // Sample some articles
    if (articlesResponse.data.length > 0) {
      console.log('\n📄 Sample articles in Strapi:');
      articlesResponse.data.slice(0, 3).forEach((article, index) => {
        console.log(`${index + 1}. "${article.title}" (${article.content?.length || 0} chars)`);
      });
    }
    
    return {
      categories: categoriesResponse.data.length,
      articles: articlesResponse.data.length
    };
    
  } catch (error) {
    console.error('❌ Error verifying data:', error.message);
    return null;
  }
}

// Main seeding function
async function runCompleteSeeding() {
  try {
    // Test connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      process.exit(1);
    }
    
    // Check existing data
    await clearExistingData();
    
    // Seed categories
    const categoryMap = await seedCategories();
    console.log(`✅ Category mapping complete: ${Object.keys(categoryMap).length} categories`);
    
    // Seed articles
    const results = await seedArticles(categoryMap);
    
    // Verify everything
    const verification = await verifySeededData();
    
    // Final summary
    console.log('\n🎉 Complete seeding finished!');
    console.log('=' .repeat(50));
    console.log(`📊 Seeding Results:`);
    console.log(`   📂 Categories: ${Object.keys(categoryMap).length}`);
    console.log(`   ✅ Articles created: ${results.successCount}`);
    console.log(`   ⚠️  Articles skipped: ${results.skippedCount}`);
    console.log(`   ❌ Articles failed: ${results.errorCount}`);
    console.log(`   📄 Total processed: ${articles.length}`);
    
    if (verification) {
      console.log(`\n✅ Verification:`);
      console.log(`   📂 Categories in Strapi: ${verification.categories}`);
      console.log(`   📄 Articles in Strapi: ${verification.articles}`);
    }
    
    if (results.errorCount === 0) {
      console.log('\n🎊 All content successfully seeded!');
      console.log('🌐 Your Future Frames blog is now fully powered by Strapi!');
      console.log('\n🔗 Next steps:');
      console.log('1. Visit your Next.js app to see Strapi data loading');
      console.log('2. Upload featured images to Strapi Media Library');
      console.log('3. Test all article pages');
    } else {
      console.log('\n⚠️  Some articles failed. Check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Check Node.js version
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ with built-in fetch');
  process.exit(1);
}

// Run the complete seeding
runCompleteSeeding();