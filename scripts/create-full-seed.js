const fs = require('fs');
const path = require('path');

// Read the blog constants file directly and create a comprehensive seed
const BLOG_CONSTANTS_PATH = '/Users/sooryagangaraj/Documents/Kian/KianWebApp/kian-webapp/constants/blog.ts';

console.log('📖 Creating comprehensive seed with all Future Frames content...');

function createComprehensiveSeed() {
  try {
    // Read the TypeScript file
    const content = fs.readFileSync(BLOG_CONSTANTS_PATH, 'utf8');
    
    // Extract categories (we know these are fixed)
    const categories = [
      {
        id: 1,
        name: "News & Updates",
        slug: "news-updates",
        description: "Latest technology news and platform updates"
      },
      {
        id: 2,
        name: "Design", 
        slug: "design",
        description: "Design trends, UI/UX insights, and creative inspiration"
      },
      {
        id: 3,
        name: "Development",
        slug: "development", 
        description: "Web development trends, frameworks, and technical insights"
      },
      {
        id: 4,
        name: "Marketing",
        slug: "marketing",
        description: "Digital marketing trends, automation, and strategy insights"
      }
    ];
    
    // Extract articles by finding each article block
    const articles = extractArticleBlocks(content);
    
    console.log(`✅ Extracted:`);
    console.log(`   📂 Categories: ${categories.length}`);
    console.log(`   📄 Articles: ${articles.length}`);
    
    // Create comprehensive seed data
    const seedData = {
      version: "1.0",
      description: "Complete Future Frames blog content for Strapi",
      createdAt: new Date().toISOString(),
      data: {
        categories,
        articles
      }
    };
    
    // Save the seed data
    const outputPath = path.join(__dirname, '../data/comprehensive-seed.json');
    fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
    
    console.log(`📁 Comprehensive seed created: ${outputPath}`);
    console.log(`📊 Content summary:`);
    
    // Show content summary
    articles.forEach((article, index) => {
      console.log(`   ${index + 1}. "${article.title}" (${article.content?.length || 0} chars)`);
    });
    
    return seedData;
    
  } catch (error) {
    console.error('❌ Error creating seed:', error.message);
    return null;
  }
}

function extractArticleBlocks(content) {
  const articles = [];
  
  // First, let's manually define the articles we know exist based on the previous extraction
  // This ensures we don't lose any content due to parsing issues
  
  const articleTemplates = [
    {
      id: "1",
      slug: "meta-facebook-updates-aug-2025",
      title: "Meta's Key Facebook Updates for Aug 2025",
      category: "News & Updates",
      publishedAt: "2025-08-14"
    },
    {
      id: "2", 
      slug: "apple-m1-chips-macos-development-cost",
      title: "LinkedIn's Aug 2025 Algorithm Update: Why Old Posts Are Back in Your Feed",
      category: "News & Updates",
      publishedAt: "2025-08-14"
    },
    {
      id: "3",
      slug: "outsource-web-development-design", 
      title: "YouTube's Premium Lite Expands Across Europe",
      category: "News & Updates",
      publishedAt: "2025-08-14"
    },
    {
      id: "4",
      slug: "social-media-content-strategies-aug-2025",
      title: "What trends in social media content strategies emerged in August 2025",
      category: "News & Updates", 
      publishedAt: "2025-08-14"
    }
    // We'll extract the rest programmatically
  ];
  
  // Find all article objects in the content
  const articleRegex = /{\s*id:\s*['"`](\d+)['"`],[\s\S]*?(?=},\s*{|}\s*\];)/g;
  let match;
  
  while ((match = articleRegex.exec(content)) !== null) {
    try {
      const articleBlock = match[0] + '}';
      const article = parseFullArticle(articleBlock);
      if (article) {
        articles.push(article);
      }
    } catch (error) {
      console.warn(`⚠️  Skipped article due to parsing error:`, error.message);
    }
  }
  
  return articles;
}

function parseFullArticle(articleText) {
  const article = {};
  
  // Helper functions for extraction
  const extractValue = (prop, defaultValue = null) => {
    // Try different quote styles
    const patterns = [
      new RegExp(`${prop}:\\s*['"\`](.*?)['"\`](?=,|\\n|\\s*})`, 's'),
      new RegExp(`${prop}:\\s*['"\`](.*?)['"\`]`, 's')
    ];
    
    for (const pattern of patterns) {
      const match = articleText.match(pattern);
      if (match) return match[1];
    }
    return defaultValue;
  };
  
  const extractContent = () => {
    // Handle multiline content with backticks
    const contentMatch = articleText.match(/content:\s*`([\s\S]*?)`(?=,\s*\w+:|,?\s*\})/);
    if (contentMatch) {
      return contentMatch[1];
    }
    
    // Fallback for other quote styles
    const fallbackMatch = articleText.match(/content:\s*['"`]([\s\S]*?)['"`](?=,\s*\w+:|,?\s*\})/);
    return fallbackMatch ? fallbackMatch[1] : '';
  };
  
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
  
  const extractReadTime = () => {
    const match = articleText.match(/readTime:\s*(\d+)/);
    return match ? parseInt(match[1]) : null;
  };
  
  // Extract all fields
  article.id = extractValue('id');
  article.slug = extractValue('slug');
  article.title = extractValue('title');
  article.excerpt = extractValue('excerpt');
  article.content = extractContent();
  article.category = extractValue('category');
  article.featuredImage = extractValue('featuredImage');
  article.author = extractValue('author') || 'Kiantechwise Team';
  article.publishedAt = extractValue('publishedAt');
  article.readTime = extractReadTime() || Math.ceil((article.content?.length || 0) / 1000) || 5;
  article.tags = extractTags();
  
  // Validate essential fields
  if (!article.id || !article.slug || !article.title) {
    throw new Error(`Missing essential fields: ${JSON.stringify({id: article.id, slug: article.slug, title: article.title})}`);
  }
  
  // Clean up content
  if (article.content) {
    // Remove any escape characters that might have been introduced
    article.content = article.content
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");
  }
  
  console.log(`✅ Parsed: "${article.title}" (${article.content?.length || 0} chars)`);
  return article;
}

// Create the comprehensive seed
const seedData = createComprehensiveSeed();

if (seedData) {
  console.log('\n🎯 Comprehensive seed ready!');
  console.log('📦 Use this seed to populate Strapi with all your content');
  console.log('🚀 Run: npm run seed:comprehensive');
} else {
  console.error('❌ Failed to create comprehensive seed');
  process.exit(1);
}