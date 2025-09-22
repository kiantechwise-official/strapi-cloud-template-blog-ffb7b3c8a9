const fs = require('fs');
const path = require('path');

// Import your existing blog data
const blogDataPath = path.join(__dirname, '../../Kian/KianWebApp/kian-webapp/constants/blog.ts');

// Function to extract blog data from TypeScript file
function extractBlogData() {
  try {
    const blogFileContent = fs.readFileSync(blogDataPath, 'utf8');
    
    // Extract blogCategories array
    const categoriesMatch = blogFileContent.match(/export const blogCategories: BlogCategory\[\] = \[([\s\S]*?)\];/);
    const categoriesString = categoriesMatch ? categoriesMatch[1] : '';
    const categories = categoriesString
      .split(',')
      .map(cat => cat.trim().replace(/'/g, '').replace(/"/g, ''))
      .filter(cat => cat.length > 0);

    // Extract blogArticles array - this is more complex due to the large content
    const articlesMatch = blogFileContent.match(/export const blogArticles: BlogArticle\[\] = \[([\s\S]*)\];/);
    
    if (!articlesMatch) {
      throw new Error('Could not find blogArticles array in the file');
    }

    // Since the articles contain complex content, we'll need to parse it more carefully
    // For now, let's create a simplified extraction
    console.log('Found categories:', categories);
    
    return {
      categories: categories.map((name, index) => ({
        id: index + 1,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
        description: `Articles related to ${name}`
      })),
      articles: [] // We'll populate this manually or create a separate script
    };
  } catch (error) {
    console.error('Error reading blog data:', error.message);
    return null;
  }
}

// Create Strapi-compatible data structure
function createStrapiData() {
  const blogData = extractBlogData();
  
  if (!blogData) {
    console.error('Failed to extract blog data');
    return;
  }

  // Map your categories to Strapi format
  const strapiCategories = [
    {
      name: "News & Updates",
      slug: "news-updates",
      description: "Latest technology news and platform updates"
    },
    {
      name: "Design",
      slug: "design", 
      description: "Design trends, UI/UX insights, and creative inspiration"
    },
    {
      name: "Development",
      slug: "development",
      description: "Web development trends, frameworks, and technical insights"
    },
    {
      name: "Marketing",
      slug: "marketing",
      description: "Digital marketing trends, automation, and strategy insights"
    }
  ];

  // Sample articles structure - you'll need to manually populate this with your actual data
  const strapiArticles = [
    // This will be populated with your actual article data
  ];

  const strapiData = {
    global: {
      siteName: "Future Frames | Kiantechwise",
      defaultSeo: {
        metaTitle: "Future Frames | Kiantechwise",
        metaDescription: "Stay ahead of the curve with our curated collection of articles covering the latest in technology news, design trends, development innovations, and marketing updates.",
        shareImage: null
      },
      siteDescription: "Future Frames - Technology insights and trends by Kiantechwise",
      favicon: null
    },
    categories: strapiCategories,
    authors: [
      {
        name: "Kiantechwise Team",
        email: "team@kiantechwise.com",
        avatar: null
      }
    ],
    articles: strapiArticles
  };

  // Write the new data structure
  fs.writeFileSync(
    path.join(__dirname, '../data/future-frames-data.json'),
    JSON.stringify(strapiData, null, 2)
  );

  console.log('✅ Strapi data structure created successfully!');
  console.log('📁 File saved to: data/future-frames-data.json');
  console.log('\n📋 Next steps:');
  console.log('1. Review the generated data structure');
  console.log('2. Manually add your article content to the articles array');
  console.log('3. Run the Strapi seed script to populate your database');
}

// Create manual article template
function createArticleTemplate() {
  const template = {
    title: "Article Title Here",
    slug: "article-slug-here", 
    excerpt: "Article excerpt/description here (max 500 chars)",
    content: "Full markdown content here",
    featuredImage: null, // Will be uploaded to Strapi media library
    author: "Author Name",
    publishedAt: "2025-01-01T00:00:00.000Z", // ISO date string
    readTime: 5, // in minutes
    category: {
      id: 1 // Reference to category ID
    },
    tags: ["tag1", "tag2"] // Array of strings
  };

  fs.writeFileSync(
    path.join(__dirname, '../data/article-template.json'),
    JSON.stringify(template, null, 2)
  );

  console.log('📝 Article template created at: data/article-template.json');
}

// Run the migration
console.log('🚀 Starting Future Frames data migration...');
createStrapiData();
createArticleTemplate();

console.log('\n⚠️  Important Notes:');
console.log('- The article content needs to be manually migrated due to complexity');
console.log('- Images need to be uploaded to Strapi media library');
console.log('- Review and test the data before deploying');