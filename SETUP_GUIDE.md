# Future Frames Strapi Integration Setup Guide

This guide will help you integrate your Future Frames blog with Strapi CMS while ensuring no data is lost.

## 🏗️ Setup Overview

Your Strapi setup has been configured to match your existing Future Frames blog structure:

### ✅ Completed:
1. **Strapi Content Types Updated** - Article and Category schemas match your blog structure
2. **Frontend Integration Created** - Strapi API functions with fallback to static data
3. **Data Migration Scripts Prepared** - Tools to convert your existing data
4. **Environment Configuration** - Development and production setup ready

## 📋 Step-by-Step Setup

### 1. Start Strapi Development Server

```bash
cd /Users/sooryagangaraj/Documents/GitHub/kiantechwise-strapi-cloud
npm install
npm run develop
```

This will start Strapi at `http://localhost:1337` and open the admin panel.

### 2. Create Admin User

When you first access the admin panel, create your admin account.

### 3. Seed Initial Data

Run the seed script to populate categories and basic structure:

```bash
npm run seed:example
```

### 4. Configure Environment Variables

In your Next.js app, create `.env.local`:

```bash
cd /Users/sooryagangaraj/Documents/Kian/KianWebApp/kian-webapp
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=your_strapi_api_token_here
```

To get the API token:
1. Go to Strapi Admin → Settings → API Tokens
2. Create a new token with "Full access" permissions
3. Copy the token to your `.env.local`

### 5. Test the Integration

Start your Next.js development server:

```bash
npm run dev
```

Visit `http://localhost:3000/future-frames` - it should work with fallback to static data.

## 📊 Data Migration Process

### Automatic Fallback
Your site will automatically:
- ✅ Use Strapi data when available
- ✅ Fallback to static data when Strapi is unavailable
- ✅ Maintain all existing functionality

### Manual Data Migration

Since your blog has 23 articles with complex content, here's the recommended approach:

#### Option 1: Admin Interface (Recommended)
1. Go to Strapi Admin → Content Manager → Articles
2. Create each article manually using the admin interface
3. Copy content from your static files
4. Upload featured images to the Media Library

#### Option 2: API Import (Advanced)
1. Use the provided migration scripts
2. Bulk import via Strapi's REST API
3. Handle image uploads separately

## 🗂️ Content Type Structure

### Article Fields:
- **title**: String (required)
- **excerpt**: Text, max 500 chars (required)  
- **slug**: UID based on title (required)
- **content**: Rich text (required)
- **featuredImage**: Media (optional)
- **author**: String (optional)
- **publishedAt**: DateTime (required)
- **readTime**: Integer (optional)
- **category**: Relation to Category (required)
- **tags**: JSON array (optional)

### Category Fields:
- **name**: String (required, unique)
- **slug**: UID based on name (required)
- **description**: Text (optional)

## 🚀 Production Deployment

### Strapi Cloud
1. Deploy your Strapi project to Strapi Cloud
2. Update environment variables:
```env
NEXT_PUBLIC_STRAPI_API_URL=https://your-project.strapiapp.com
STRAPI_API_TOKEN=your_production_token
```

### Vercel/Other Platforms
1. Add environment variables to your deployment platform
2. Ensure the API token has proper permissions
3. Test the integration

## 🔧 Troubleshooting

### Common Issues:

**Strapi not connecting:**
- Check if Strapi server is running
- Verify API URL and token
- Check CORS settings in Strapi

**Images not loading:**
- Ensure images are uploaded to Strapi Media Library
- Check image permissions in Strapi
- Verify image URLs in content

**Build errors:**
- Make sure all imports are correct
- Check TypeScript types match
- Verify environment variables are set

## 📁 File Structure

### Modified Files:
```
kian-webapp/
├── lib/strapi.ts                    # Strapi API integration
├── app/future-frames/
│   ├── page.tsx                     # Updated to use Strapi
│   ├── FutureFramesClient.tsx       # Client-side components
│   └── [slug]/page.tsx              # Updated article page
└── .env.example                     # Environment variables

kiantechwise-strapi-cloud/
├── src/api/article/schema.json      # Updated article schema
├── src/api/category/schema.json     # Updated category schema
├── data/data.json                   # Updated seed data
├── scripts/
│   ├── migrate-future-frames-data.js
│   └── extract-blog-articles.js
└── SETUP_GUIDE.md                   # This guide
```

## ✅ Verification Checklist

- [ ] Strapi server starts without errors
- [ ] Admin panel is accessible
- [ ] Categories are created
- [ ] At least one test article is created
- [ ] Next.js app connects to Strapi
- [ ] Fallback to static data works
- [ ] All existing URLs still work
- [ ] Images display correctly
- [ ] Search and filtering work
- [ ] Related articles work

## 🎯 Next Steps

1. **Test the setup** following this guide
2. **Migrate content** gradually (start with a few articles)
3. **Upload images** to Strapi Media Library
4. **Test thoroughly** before going live
5. **Deploy to production** when ready

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Verify all steps were followed correctly
3. Check Strapi and Next.js logs for errors
4. Ensure environment variables are correctly set

The integration is designed to be safe - your existing static data remains as a fallback, so your site will always work even if Strapi is temporarily unavailable.