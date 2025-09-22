# 🚀 Future Frames → Strapi Migration Guide

Complete guide to migrate your 23 Future Frames articles to Strapi Cloud with zero data loss.

## 📋 Quick Start

**Option 1: Automated Setup (Recommended)**
```bash
cd /Users/sooryagangaraj/Documents/GitHub/kiantechwise-strapi-cloud
npm run setup
```

**Option 2: Manual Step-by-Step**
Follow the detailed steps below.

## 🛠️ Manual Setup Steps

### 1. Install Dependencies
```bash
cd /Users/sooryagangaraj/Documents/GitHub/kiantechwise-strapi-cloud
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env file with your specific values
```

### 3. Extract Your Blog Data
```bash
npm run extract:data
```
This creates:
- `data/extracted-categories.json` (4 categories)
- `data/extracted-articles.json` (22+ articles)

### 4. Start Strapi Development Server
```bash
npm run develop
```
- Opens admin panel at `http://localhost:1337/admin`
- Create your admin account

### 5. Generate API Token
1. Go to **Settings → API Tokens**
2. Click **"Create new API Token"**
3. Name: `Migration Token`
4. Type: **Full access**
5. Copy the generated token

### 6. Set API Token
Add to your `.env` file:
```bash
STRAPI_API_TOKEN=your_copied_token_here
```

### 7. Migrate All Data
```bash
npm run migrate:data
```

This will:
- ✅ Create 4 categories (News & Updates, Design, Development, Marketing)
- ✅ Migrate all 22+ articles with full content
- ✅ Preserve slugs, dates, and metadata
- ✅ Handle duplicate detection

## 📊 What Gets Migrated

### Categories (4 total)
- **News & Updates** → `news-updates`
- **Design** → `design`  
- **Development** → `development`
- **Marketing** → `marketing`

### Articles (22+ total)
For each article:
- ✅ Title and excerpt
- ✅ Full markdown content  
- ✅ Slug (preserved for URL compatibility)
- ✅ Category assignment
- ✅ Published date
- ✅ Author information
- ✅ Tags array
- ✅ Read time estimate

### Featured Images
⚠️ **Manual Step Required**: Images need to be uploaded to Strapi Media Library separately.

## 🌐 Frontend Integration

Your Next.js app is already configured to:
- ✅ Fetch data from Strapi when available
- ✅ Fallback to static data if Strapi is down
- ✅ Maintain all existing URLs and functionality

### Environment Variables for Next.js
In `/Users/sooryagangaraj/Documents/Kian/KianWebApp/kian-webapp/.env.local`:
```bash
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=your_strapi_api_token
```

## 🚀 Production Deployment

### Strapi Cloud Setup
1. **Deploy to Strapi Cloud**
   - Connect your GitHub repository
   - Strapi Cloud will auto-deploy

2. **Update Production Environment**
   ```bash
   NEXT_PUBLIC_STRAPI_API_URL=https://your-project.strapiapp.com
   STRAPI_API_TOKEN=your_production_token
   ```

3. **Re-run Migration on Production**
   ```bash
   # On your production Strapi instance
   npm run migrate:data
   ```

## 🧪 Testing Your Migration

### Verify Categories
```bash
curl "http://localhost:1337/api/categories"
```

### Verify Articles
```bash
curl "http://localhost:1337/api/articles?populate=*"
```

### Test Frontend Integration
1. Start your Next.js app: `npm run dev`
2. Visit `http://localhost:3000/future-frames`
3. Verify articles load from Strapi
4. Test individual article pages

## 📁 File Structure

```
kiantechwise-strapi-cloud/
├── scripts/
│   ├── extract-articles-json.js    # Extract data from TypeScript
│   ├── simple-seed.js              # Upload to Strapi
│   └── complete-setup.sh           # Automated setup
├── data/
│   ├── extracted-categories.json   # Generated categories
│   └── extracted-articles.json     # Generated articles
├── src/
│   └── api/
│       ├── article/                # Updated schema
│       └── category/               # Updated schema
└── package.json                    # Added migration scripts
```

## 🔧 Troubleshooting

### "STRAPI_API_TOKEN is required"
- Make sure you created an API token in Strapi admin
- Verify it's added to `.env` file
- Restart the migration script

### "Categories not found"  
- Ensure categories were created successfully
- Check Strapi admin → Content Manager → Categories

### "Articles already exist"
- The script handles duplicates safely
- Existing articles are skipped, not overwritten

### "Connection failed"
- Verify Strapi is running: `npm run develop`
- Check URL in .env matches running instance

### TypeScript Errors in Next.js
```bash
# In your Next.js project
npx tsc --noEmit --skipLibCheck
```

## 📊 Migration Success Metrics

After successful migration, you should have:
- ✅ 4 categories in Strapi
- ✅ 22+ articles in Strapi  
- ✅ All articles accessible via API
- ✅ Frontend loading from Strapi
- ✅ Fallback to static data working
- ✅ All existing URLs still working

## 🎯 Next Steps

1. **Upload Images**: Add featured images to Strapi Media Library
2. **Test Thoroughly**: Verify all content displays correctly
3. **Deploy to Production**: Push to Strapi Cloud when ready
4. **Monitor Performance**: Ensure API response times are acceptable

## 🆘 Support

If you encounter issues:

1. Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
2. Verify all environment variables are set correctly
3. Ensure Strapi server is running and accessible
4. Check browser console and server logs for errors

## 📝 Notes

- **Zero Downtime**: Your site continues working during migration
- **Reversible**: Static data remains as permanent fallback
- **Gradual**: You can migrate content in batches if preferred
- **Safe**: No existing data is modified or deleted