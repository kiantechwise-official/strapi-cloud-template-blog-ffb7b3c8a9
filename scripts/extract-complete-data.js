const fs = require('fs');
const path = require('path');

// Configuration
const BLOG_CONSTANTS_PATH = '/Users/sooryagangaraj/Documents/Kian/KianWebApp/kian-webapp/constants/blog.ts';

console.log('🔍 Extracting complete Future Frames blog data...');

function extractCompleteData() {
  try {
    const content = fs.readFileSync(BLOG_CONSTANTS_PATH, 'utf8');
    
    // Extract categories
    const categories = extractCategories(content);
    
    // Extract articles with better parsing
    const articles = extractArticlesComplete(content);
    
    console.log(`✅ Extraction complete:`);
    console.log(`📂 Categories: ${categories.length}`);
    console.log(`📄 Articles: ${articles.length}`);
    
    // Save the complete data
    const outputDir = path.join(__dirname, '../data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'complete-categories.json'),
      JSON.stringify(categories, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'complete-articles.json'),
      JSON.stringify(articles, null, 2)
    );
    
    // Create Strapi-ready seed data
    const seedData = createStrapiSeedData(categories, articles);
    fs.writeFileSync(
      path.join(outputDir, 'strapi-seed-data.json'),
      JSON.stringify(seedData, null, 2)
    );
    
    console.log(`📁 Files created:`);
    console.log(`   - complete-categories.json`);
    console.log(`   - complete-articles.json`);
    console.log(`   - strapi-seed-data.json`);
    
    return { categories, articles };
    
  } catch (error) {
    console.error('❌ Error extracting data:', error.message);
    return null;
  }
}

function extractCategories(content) {
  const categories = ['News & Updates', 'Design', 'Development', 'Marketing'];
  return categories.map((name, index) => ({
    id: index + 1,
    name: name,
    slug: name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
    description: `Articles related to ${name}`
  }));
}

function extractArticlesComplete(content) {
  console.log('📖 Parsing articles with complete content...');
  
  // Find the blogArticles array
  const articlesMatch = content.match(/export const blogArticles: BlogArticle\[\] = \[([\s\S]*)\];$/m);
  if (!articlesMatch) {
    console.error('❌ Could not find blogArticles array');
    return [];
  }
  
  const articlesArrayContent = articlesMatch[1];
  
  // Split articles by looking for object boundaries
  const articles = [];
  let currentArticle = '';
  let braceCount = 0;
  let inArticle = false;
  let inContent = false;
  let contentDelimiter = '';
  
  const lines = articlesArrayContent.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect start of new article
    if (line.trim().startsWith('{') && line.includes('id:')) {
      if (currentArticle) {
        // Process previous article
        const parsed = parseArticleObject(currentArticle);
        if (parsed) articles.push(parsed);
      }
      currentArticle = line + '\n';
      braceCount = 1;
      inArticle = true;
      continue;
    }
    
    if (inArticle) {
      currentArticle += line + '\n';
      
      // Track content field specifically
      if (line.includes('content:') && (line.includes('`') || line.includes("'"))) {
        inContent = true;
        if (line.includes('`')) contentDelimiter = '`';
        else if (line.includes("'")) contentDelimiter = "'";
      }
      
      // Count braces when not in content
      if (!inContent) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
      }
      
      // Check for end of content field
      if (inContent && contentDelimiter && line.includes(contentDelimiter + ',')) {
        inContent = false;
        contentDelimiter = '';
      }
      
      // Check for end of article
      if (!inContent && braceCount === 0 && line.trim() === '},') {
        // Process this article
        const parsed = parseArticleObject(currentArticle);
        if (parsed) articles.push(parsed);
        
        currentArticle = '';
        inArticle = false;
      }
    }
  }
  
  // Process last article if exists
  if (currentArticle && inArticle) {
    const parsed = parseArticleObject(currentArticle);
    if (parsed) articles.push(parsed);
  }
  
  console.log(`✅ Successfully parsed ${articles.length} articles`);
  return articles;
}

function parseArticleObject(articleText) {
  try {
    const article = {};
    
    // Extract basic string properties
    const extractQuotedValue = (prop) => {
      const patterns = [
        new RegExp(`${prop}:\\s*['"\`](.*?)['"\`](?=,|\\n|\\s*})`, 's'),
        new RegExp(`${prop}:\\s*['"\`](.*?)['"\`]`, 's')
      ];
      
      for (const pattern of patterns) {
        const match = articleText.match(pattern);
        if (match) return match[1];
      }
      return null;
    };
    
    // Extract content (handles multiline backticks)
    const extractContent = () => {
      const patterns = [
        /content:\s*`([\s\S]*?)`(?=,\s*\w+:|,?\s*\})/,
        /content:\s*'([\s\S]*?)'(?=,\s*\w+:|,?\s*\})/,
        /content:\s*"([\s\S]*?)"(?=,\s*\w+:|,?\s*\})/
      ];
      
      for (const pattern of patterns) {
        const match = articleText.match(pattern);
        if (match) return match[1];
      }
      return '';
    };
    
    // Extract numeric values
    const extractNumeric = (prop) => {
      const regex = new RegExp(`${prop}:\\s*(\\d+)`);
      const match = articleText.match(regex);
      return match ? parseInt(match[1]) : null;
    };
    
    // Extract tags array
    const extractTags = () => {
      const tagsMatch = articleText.match(/tags:\s*\[([\s\S]*?)\]/);
      if (tagsMatch) {
        return tagsMatch[1]
          .split(',')
          .map(tag => tag.trim().replace(/['"]/g, ''))
          .filter(tag => tag.length > 0);
      }
      return [];
    };
    
    // Extract all properties
    article.id = extractQuotedValue('id');
    article.slug = extractQuotedValue('slug');
    article.title = extractQuotedValue('title');
    article.excerpt = extractQuotedValue('excerpt');
    article.content = extractContent();
    article.category = extractQuotedValue('category');
    article.featuredImage = extractQuotedValue('featuredImage');
    article.author = extractQuotedValue('author');
    article.publishedAt = extractQuotedValue('publishedAt');
    article.readTime = extractNumeric('readTime');
    article.tags = extractTags();
    
    // Validate required fields
    if (!article.id || !article.slug || !article.title) {
      console.warn(`⚠️  Skipping article with missing required fields: ${article.title || 'Unknown'}`);
      return null;
    }
    
    console.log(`✅ Parsed: "${article.title}" (${article.content?.length || 0} chars)`);
    return article;
    
  } catch (error) {
    console.error('❌ Error parsing article:', error.message);
    return null;
  }
}

function createStrapiSeedData(categories, articles) {
  return {
    version: 2,
    data: {
      "api::category.category": categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      })),
      "api::article.article": articles.map((article, index) => ({
        id: parseInt(article.id),
        title: article.title,
        excerpt: article.excerpt,
        slug: article.slug,
        content: article.content,
        author: article.author || 'Kiantechwise Team',
        publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
        readTime: article.readTime || 5,
        tags: article.tags || [],
        category: categories.find(cat => cat.name === article.category)?.id || 1,
        featuredImage: null, // Will be uploaded separately
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    }
  };
}

// Run the extraction
const result = extractCompleteData();

if (result) {
  console.log('\n📊 Extraction Summary:');
  console.log(`✅ Categories: ${result.categories.length}`);
  console.log(`✅ Articles: ${result.articles.length}`);
  
  if (result.articles.length > 0) {
    console.log('\n📄 Sample articles:');
    result.articles.slice(0, 3).forEach((article, index) => {
      console.log(`${index + 1}. "${article.title}" (${article.content?.length || 0} chars)`);
    });
  }
  
  console.log('\n🎯 Ready for migration! Use:');
  console.log('npm run seed:complete');
}