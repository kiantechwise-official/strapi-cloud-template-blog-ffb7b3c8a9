const fs = require('fs');
const path = require('path');

// Path to your blog constants file
const blogConstantsPath = '/Users/sooryagangaraj/Documents/Kian/KianWebApp/kian-webapp/constants/blog.ts';

// Read the first 100 lines to get the structure and interface
function analyzeBlogStructure() {
  try {
    const content = fs.readFileSync(blogConstantsPath, 'utf8');
    const lines = content.split('\n');
    
    console.log('🔍 Analyzing blog structure...');
    console.log('File has', lines.length, 'lines');
    
    // Find where blogArticles array starts
    const blogArticlesLineIndex = lines.findIndex(line => line.includes('export const blogArticles'));
    console.log('📍 blogArticles starts at line:', blogArticlesLineIndex + 1);
    
    // Show first few lines of structure
    console.log('\n📋 First 20 lines of the file:');
    lines.slice(0, 20).forEach((line, index) => {
      console.log(`${index + 1}: ${line}`);
    });
    
    return {
      totalLines: lines.length,
      blogArticlesStartLine: blogArticlesLineIndex,
      content: content
    };
  } catch (error) {
    console.error('❌ Error reading blog file:', error.message);
    return null;
  }
}

// Extract and count articles
function extractArticleData() {
  try {
    const analysis = analyzeBlogStructure();
    if (!analysis) return;
    
    const content = analysis.content;
    
    // Count articles by counting occurrences of article objects
    const articleMatches = content.match(/{\s*id:\s*['"`]\d+['"`]/g);
    const articleCount = articleMatches ? articleMatches.length : 0;
    
    console.log(`\n📊 Found ${articleCount} articles in the blog data`);
    
    // Extract categories
    const categoriesMatch = content.match(/export const blogCategories: BlogCategory\[\] = \[([\s\S]*?)\];/);
    if (categoriesMatch) {
      const categoriesContent = categoriesMatch[1];
      const categories = categoriesContent
        .split(',')
        .map(cat => cat.trim().replace(/['"]/g, ''))
        .filter(cat => cat.length > 0 && !cat.includes('\n'));
      
      console.log('\n📂 Categories found:', categories);
      
      // Create the migration data
      createMigrationPlan(categories, articleCount);
    }
    
  } catch (error) {
    console.error('❌ Error extracting article data:', error.message);
  }
}

function createMigrationPlan(categories, articleCount) {
  const migrationPlan = {
    sourceFile: blogConstantsPath,
    categories: categories.map((name, index) => ({
      id: index + 1,
      name: name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
      description: `Articles related to ${name}`
    })),
    articlesCount: articleCount,
    migrationSteps: [
      'Update Strapi content types (✅ Done)',
      'Create category entries in Strapi',
      'Extract individual article data',
      'Upload featured images to Strapi media library',
      'Create article entries in Strapi',
      'Update frontend to use Strapi API',
      'Test data integrity'
    ],
    notes: [
      'Articles contain markdown content that needs to be preserved',
      'Featured images need to be uploaded to Strapi media library',
      'Slugs must be unique and match existing URLs',
      'Published dates need to be converted to ISO format',
      'Tags are stored as arrays and need proper handling'
    ]
  };
  
  // Save migration plan
  fs.writeFileSync(
    path.join(__dirname, '../data/migration-plan.json'),
    JSON.stringify(migrationPlan, null, 2)
  );
  
  console.log('\n📋 Migration plan created at: data/migration-plan.json');
  console.log('\n🎯 Next steps:');
  console.log('1. Run Strapi in development mode');
  console.log('2. Use the admin panel to create categories');
  console.log('3. Upload article images to media library');
  console.log('4. Create articles using the admin interface or API');
  console.log('5. Update frontend to fetch from Strapi API');
}

// Run the analysis
console.log('🚀 Starting blog data analysis...');
extractArticleData();