const fs = require('fs');
const path = require('path');

// Use the already extracted data and create a comprehensive auto-seed script
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('❌ STRAPI_API_TOKEN environment variable is required');
  console.log('💡 Get your token from Strapi Admin → Settings → API Tokens');
  process.exit(1);
}

console.log('🚀 Auto-seeding Future Frames with all content...');

// Load previously extracted data
const extractedArticlesPath = path.join(__dirname, '../data/extracted-articles.json');
const extractedCategoriesPath = path.join(__dirname, '../data/extracted-categories.json');

if (!fs.existsSync(extractedArticlesPath)) {
  console.error('❌ No extracted articles found');
  console.log('💡 Run: npm run extract:data first');
  process.exit(1);
}

const articles = JSON.parse(fs.readFileSync(extractedArticlesPath, 'utf8'));
const categories = [
  { name: "News & Updates", slug: "news-updates", description: "Latest technology news and platform updates" },
  { name: "Design", slug: "design", description: "Design trends, UI/UX insights, and creative inspiration" },
  { name: "Development", slug: "development", description: "Web development trends, frameworks, and technical insights" },
  { name: "Marketing", slug: "marketing", description: "Digital marketing trends, automation, and strategy insights" }
];

console.log(`📊 Data loaded: ${categories.length} categories, ${articles.length} articles`);

// API helper
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

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Strapi API error (${response.status}): ${errorText}`);
  }
  
  return await response.json();
}

// Test connection
async function testConnection() {
  try {
    await strapiAPI('/articles?pagination[limit]=1');
    console.log('✅ Strapi connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// Auto-seed categories
async function autoSeedCategories() {
  console.log('\n📂 Auto-seeding categories...');
  const categoryMap = {};
  
  for (const category of categories) {
    try {
      // Check if category exists
      const existing = await strapiAPI(`/categories?filters[name][$eq]=${encodeURIComponent(category.name)}`);
      
      if (existing.data.length > 0) {
        categoryMap[category.name] = existing.data[0].documentId;
        console.log(`✅ Found existing: ${category.name}`);
      } else {
        // Create new category
        const response = await strapiAPI('/categories', 'POST', {
          data: category
        });
        categoryMap[category.name] = response.data.documentId;
        console.log(`✅ Created: ${category.name}`);
      }
    } catch (error) {
      console.error(`❌ Error with category ${category.name}:`, error.message);
    }
  }
  
  return categoryMap;
}

// Auto-seed articles with full content
async function autoSeedArticles(categoryMap) {
  console.log('\n📄 Auto-seeding articles with complete content...');
  
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    
    try {
      // Check if article already exists
      const existing = await strapiAPI(`/articles?filters[slug][$eq]=${article.slug}`);
      
      if (existing.data.length > 0) {
        console.log(`⚠️  Article "${article.title}" already exists, skipping...`);
        skipped++;
        continue;
      }
      
      // Get category ID
      const categoryId = categoryMap[article.category];
      if (!categoryId) {
        console.error(`❌ No category found for: ${article.category}`);
        errors++;
        continue;
      }
      
      // Prepare article data with ALL content
      const articleData = {
        data: {
          title: article.title || `Untitled Article ${article.id}`,
          excerpt: article.excerpt || '',
          slug: article.slug || `article-${article.id}`,
          content: article.content || '',
          author: article.author || 'Kiantechwise Team',
          publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
          readTime: article.readTime || Math.ceil((article.content?.length || 0) / 1000) || 5,
          category: categoryId,
          tags: Array.isArray(article.tags) ? article.tags : []
        }
      };
      
      console.log(`➕ Creating ${i + 1}/${articles.length}: "${article.title}"`);
      console.log(`   📊 Content: ${articleData.data.content.length} chars`);
      console.log(`   📂 Category: ${article.category}`);
      
      const response = await strapiAPI('/articles', 'POST', articleData);
      
      console.log(`✅ Created: "${article.title}" (ID: ${response.data.documentId})`);
      created++;
      
      // Small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error creating "${article.title}":`, error.message);
      errors++;
    }
  }
  
  return { created, skipped, errors };
}

// Verify the seeded data
async function verifySeededData() {
  console.log('\n🔍 Verifying seeded data...');
  
  try {
    const categoriesResult = await strapiAPI('/categories');
    const articlesResult = await strapiAPI('/articles?populate=*&pagination[limit]=100');
    
    console.log(`✅ Categories in Strapi: ${categoriesResult.data.length}`);
    console.log(`✅ Articles in Strapi: ${articlesResult.data.length}`);
    
    // Show sample content to verify
    if (articlesResult.data.length > 0) {
      console.log('\n📄 Sample articles (with content verification):');
      articlesResult.data.slice(0, 3).forEach((article, index) => {
        console.log(`${index + 1}. "${article.title}"`);
        console.log(`   📊 Content: ${article.content?.length || 0} characters`);
        console.log(`   📂 Category: ${article.category?.name || 'No category'}`);
        console.log(`   🔗 Slug: ${article.slug}`);
      });
    }
    
    return { categories: categoriesResult.data.length, articles: articlesResult.data.length };
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return null;
  }
}

// Main auto-seeding function
async function runAutoSeed() {
  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) process.exit(1);
    
    // Seed categories first
    const categoryMap = await autoSeedCategories();
    console.log(`✅ Categories ready: ${Object.keys(categoryMap).length}`);
    
    // Seed all articles
    const results = await autoSeedArticles(categoryMap);
    
    // Verify everything worked
    const verification = await verifySeededData();
    
    // Final summary
    console.log('\n🎉 Auto-seeding complete!');
    console.log('='.repeat(50));
    console.log(`📊 Results:`);
    console.log(`   📂 Categories: ${Object.keys(categoryMap).length}`);
    console.log(`   ✅ Articles created: ${results.created}`);
    console.log(`   ⚠️  Articles skipped: ${results.skipped}`);
    console.log(`   ❌ Articles failed: ${results.errors}`);
    console.log(`   📄 Total processed: ${articles.length}`);
    
    if (verification) {
      console.log(`\n✅ Final verification:`);
      console.log(`   📂 Categories in Strapi: ${verification.categories}`);
      console.log(`   📄 Articles in Strapi: ${verification.articles}`);
    }
    
    if (results.errors === 0 && results.created > 0) {
      console.log('\n🎊 SUCCESS! Your Future Frames blog is now fully loaded in Strapi!');
      console.log('\n🔗 Next steps:');
      console.log('1. Visit http://localhost:3000/future-frames to see Strapi data');
      console.log('2. Upload featured images in Strapi Admin → Media Library');
      console.log('3. Test individual article pages');
      console.log('4. Deploy to production when ready');
    } else if (results.created === 0 && results.skipped > 0) {
      console.log('\n✅ All articles were already in Strapi - no changes needed!');
    } else {
      console.log('\n⚠️  Some issues occurred - check the logs above');
    }
    
  } catch (error) {
    console.error('❌ Auto-seeding failed:', error.message);
    process.exit(1);
  }
}

// Check requirements
if (typeof fetch === 'undefined') {
  console.error('❌ Node.js 18+ required');
  process.exit(1);
}

// Run the auto-seeding
runAutoSeed();