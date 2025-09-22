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

console.log('🏭 Seeding Industries content to Strapi...');
console.log(`📍 Strapi URL: ${STRAPI_URL}`);

// Industries data from constants
const industriesData = {
  categories: [
    { name: "Technology", slug: "technology", description: "Technology industry insights and trends" },
    { name: "Healthcare", slug: "healthcare", description: "Healthcare sector analysis and innovations" },
    { name: "Finance", slug: "finance", description: "Financial services and FinTech developments" },
    { name: "Retail", slug: "retail", description: "Retail industry trends and consumer insights" },
    { name: "Manufacturing", slug: "manufacturing", description: "Manufacturing and industrial automation" },
    { name: "Education", slug: "education", description: "Educational technology and learning trends" }
  ],
  articles: [
    {
      title: "FinTech Revolution: Digital Transformation in Financial Services 2025",
      slug: "fintech-digital-transformation-2025",
      excerpt: "The financial services industry is undergoing unprecedented digital transformation. From AI-powered fraud detection to blockchain-based payments, discover how FinTech innovations are reshaping banking, insurance, and investment management.",
      content: `The financial services industry is experiencing a digital revolution that's fundamentally changing how we bank, invest, and manage money. In 2025, FinTech innovations are not just supplementing traditional banking—they're completely reimagining the financial landscape.

## The Digital Banking Evolution

Traditional banks are rapidly adopting digital-first strategies to compete with nimble FinTech startups. Key developments include:

### AI-Powered Customer Service
- **Intelligent chatbots** handling 80% of customer inquiries
- **Predictive analytics** for personalized financial advice
- **Risk assessment algorithms** making loan decisions in minutes

### Blockchain and Cryptocurrency Integration
- **Digital wallets** supporting multiple cryptocurrencies
- **Smart contracts** automating insurance claims
- **Cross-border payments** completed in seconds, not days

## RegTech: Regulatory Technology Revolution

Financial institutions are leveraging technology to streamline compliance:

- **Automated reporting** reduces manual work by 75%
- **Real-time monitoring** for suspicious transactions
- **AI-driven KYC** (Know Your Customer) processes

## The Rise of Embedded Finance

Non-financial companies are integrating financial services directly into their platforms:

- **E-commerce payment solutions**
- **Buy-now-pay-later** services at checkout
- **Banking-as-a-Service** APIs

## Challenges and Opportunities

While FinTech offers tremendous opportunities, it also presents challenges:

### Security Concerns
- Increased cyber threats
- Data privacy regulations
- Need for robust authentication

### Market Competition
- Traditional banks vs. FinTech startups
- Big Tech companies entering finance
- Regulatory compliance costs

## Future Outlook

The FinTech sector is projected to grow 25% annually through 2025, driven by:

- **Open banking** initiatives worldwide
- **Central bank digital currencies** (CBDCs)
- **Sustainable finance** and ESG investing
- **Financial inclusion** in emerging markets

The convergence of technology and finance is creating unprecedented opportunities for innovation, efficiency, and financial inclusion. Organizations that embrace these changes will lead the industry transformation.`,
      category: "Finance",
      author: "Kiantechwise Team",
      publishedAt: "2025-01-15",
      readTime: 8,
      tags: ["FinTech", "Digital Banking", "Blockchain", "AI", "Financial Services"]
    },
    {
      title: "AI-Powered Diagnostics: The Healthcare Revolution of 2025",
      slug: "healthcare-ai-diagnostics-revolution",
      excerpt: "Artificial Intelligence is transforming healthcare diagnostics with unprecedented accuracy and speed. Explore how machine learning algorithms are revolutionizing medical imaging, drug discovery, and personalized treatment plans.",
      content: `Healthcare is experiencing a technological renaissance, with AI-powered diagnostics leading the charge. In 2025, artificial intelligence is not just assisting doctors—it's revolutionizing how we detect, diagnose, and treat diseases.

## Medical Imaging Revolution

AI algorithms are now capable of analyzing medical images with superhuman accuracy:

### Radiology Breakthroughs
- **99.5% accuracy** in detecting early-stage cancers
- **Real-time analysis** of CT scans and MRIs
- **Automated report generation** saving radiologists hours daily

### Pathology Innovations
- **Digital pathology** with AI-assisted diagnosis
- **Biomarker identification** for personalized medicine
- **Predictive modeling** for disease progression

## Drug Discovery Acceleration

AI is dramatically reducing the time and cost of drug development:

- **Molecule identification** in weeks instead of years
- **Clinical trial optimization** through patient matching
- **Side effect prediction** before human testing

## Personalized Medicine

Healthcare is becoming increasingly personalized through AI:

### Genomic Analysis
- **DNA sequencing** analysis in hours
- **Genetic risk assessment** for preventive care
- **Targeted therapy** based on genetic profiles

### Treatment Optimization
- **Dosage calculation** based on individual factors
- **Treatment response prediction**
- **Medication interaction analysis**

## Remote Patient Monitoring

AI-powered devices are enabling continuous health monitoring:

- **Wearable sensors** tracking vital signs 24/7
- **Predictive alerts** for health emergencies
- **Chronic disease management** from home

## Challenges in Healthcare AI

Despite tremendous progress, challenges remain:

### Data Privacy and Security
- Patient data protection
- HIPAA compliance
- Cybersecurity threats

### Regulatory Approval
- FDA approval processes
- Clinical validation requirements
- Liability concerns

### Integration Challenges
- Legacy system compatibility
- Staff training requirements
- Cost of implementation

## The Future of Healthcare AI

Looking ahead, we can expect:

- **Preventive care** becoming the primary focus
- **Global health equity** through accessible AI tools
- **Mental health** AI assistants and therapy bots
- **Robotic surgery** with AI precision

The integration of AI in healthcare is creating a future where diseases are detected earlier, treatments are more precise, and healthcare is more accessible to everyone. This technological revolution is not just improving patient outcomes—it's saving lives and transforming the entire healthcare ecosystem.`,
      category: "Healthcare",
      author: "Kiantechwise Team",
      publishedAt: "2025-01-14",
      readTime: 7,
      tags: ["Healthcare", "AI", "Medical Diagnostics", "Digital Health", "Machine Learning"]
    },
    {
      title: "Omnichannel Retail: Creating Seamless Customer Experiences in 2025",
      slug: "retail-omnichannel-experience-2025",
      excerpt: "The retail landscape is evolving beyond traditional boundaries. Discover how leading retailers are creating unified customer experiences across online, mobile, and physical stores through advanced technology integration.",
      content: `The retail industry in 2025 is defined by one principle: seamless customer experience across all channels. Omnichannel retail is no longer a competitive advantage—it's a necessity for survival in today's market.

## The Omnichannel Imperative

Modern consumers expect consistency whether they're shopping online, in-store, or on mobile apps:

### Unified Customer Journey
- **Single customer profile** across all touchpoints
- **Consistent pricing** and promotions everywhere
- **Seamless transitions** between channels

### Real-Time Inventory Management
- **Live inventory** visibility across stores and warehouses
- **Buy online, pickup in-store** (BOPIS) capabilities
- **Ship from store** for faster delivery

## Technology Enablers

Several technologies are making true omnichannel experiences possible:

### Cloud-Based POS Systems
- **Real-time synchronization** across all locations
- **Mobile payment** acceptance anywhere
- **Customer data integration**

### AI and Machine Learning
- **Personalized recommendations** based on cross-channel behavior
- **Demand forecasting** for inventory optimization
- **Dynamic pricing** based on market conditions

### Augmented Reality (AR)
- **Virtual try-on** experiences
- **In-store navigation** and product information
- **Interactive product demonstrations**

## Customer Experience Innovations

Retailers are reimagining every touchpoint:

### Personalization at Scale
- **Individual customer journeys**
- **Customized product offerings**
- **Targeted marketing campaigns**

### Social Commerce Integration
- **Shoppable social media** posts
- **Influencer partnerships**
- **User-generated content** integration

### Subscription and Loyalty Programs
- **Tiered membership** benefits
- **Cross-channel rewards**
- **Predictive customer lifetime value**

## Supply Chain Revolution

Omnichannel retail requires sophisticated supply chain management:

### Micro-Fulfillment Centers
- **Local distribution** for same-day delivery
- **Automated picking** and packing
- **Urban warehouse** strategies

### Last-Mile Delivery Innovation
- **Drone delivery** pilots
- **Autonomous vehicle** fleets
- **Crowdsourced delivery** networks

## Data Analytics and Insights

Success in omnichannel retail depends on data:

### Customer Analytics
- **360-degree customer view**
- **Behavioral pattern analysis**
- **Predictive modeling**

### Operational Analytics
- **Channel performance** metrics
- **Inventory turnover** optimization
- **Staff productivity** insights

## Challenges and Solutions

Implementing omnichannel strategies presents several challenges:

### Technology Integration
- **Legacy system** modernization
- **API-first** architecture
- **Cloud migration** strategies

### Organizational Alignment
- **Cross-functional teams**
- **Unified KPIs**
- **Change management**

### Customer Privacy
- **Data protection** compliance
- **Transparent privacy** policies
- **Secure payment** processing

## Future Trends

The future of omnichannel retail includes:

- **Voice commerce** integration
- **IoT-enabled** smart stores
- **Blockchain** for supply chain transparency
- **Sustainable retail** practices

## Measuring Success

Key metrics for omnichannel success:

- **Customer lifetime value** (CLV)
- **Cross-channel conversion** rates
- **Average order value** across channels
- **Customer satisfaction** scores

The retailers winning in 2025 are those who have successfully broken down channel silos to create truly unified customer experiences. By leveraging technology, data, and customer insights, they're not just meeting expectations—they're setting new standards for what retail can be.`,
      category: "Retail",
      author: "Kiantechwise Team",
      publishedAt: "2025-01-13",
      readTime: 9,
      tags: ["Retail", "Omnichannel", "Customer Experience", "E-commerce", "Digital Transformation"]
    },
    {
      title: "Industry 4.0: The Smart Manufacturing Revolution of 2025",
      slug: "manufacturing-industry-4-automation",
      excerpt: "Manufacturing is being transformed by IoT, AI, and automation technologies. Explore how Industry 4.0 is creating intelligent factories, predictive maintenance systems, and mass customization capabilities.",
      content: `Manufacturing in 2025 represents the full realization of Industry 4.0 principles. Smart factories powered by IoT, AI, and advanced automation are revolutionizing production efficiency, quality, and customization capabilities.

## The Smart Factory Ecosystem

Modern manufacturing facilities are becoming interconnected ecosystems:

### IoT-Connected Equipment
- **Real-time monitoring** of all machinery
- **Predictive maintenance** algorithms
- **Energy optimization** systems

### Digital Twins
- **Virtual factory replicas** for simulation
- **Process optimization** before implementation
- **Training environments** for workers

### Autonomous Production Lines
- **Self-adjusting** manufacturing parameters
- **Quality control** integration
- **Minimal human intervention** required

## Predictive Maintenance Revolution

AI-powered maintenance is eliminating unexpected downtime:

### Sensor Networks
- **Vibration analysis** for early fault detection
- **Temperature monitoring** for overheating prevention
- **Acoustic signatures** for equipment health

### Machine Learning Models
- **Failure prediction** with 95% accuracy
- **Optimal maintenance** scheduling
- **Parts inventory** optimization

## Mass Customization Capabilities

Technology is enabling personalized production at scale:

### Flexible Manufacturing Systems
- **Quick changeovers** between product variants
- **Modular production** lines
- **On-demand manufacturing**

### 3D Printing Integration
- **Rapid prototyping**
- **Custom components** production
- **Distributed manufacturing**

## Supply Chain Integration

Industry 4.0 extends beyond the factory floor:

### Real-Time Visibility
- **End-to-end** supply chain tracking
- **Supplier performance** monitoring
- **Demand forecasting** accuracy

### Collaborative Networks
- **Supplier integration** platforms
- **Shared inventory** management
- **Risk mitigation** strategies

## Quality Management Evolution

AI and automation are revolutionizing quality control:

### Automated Inspection
- **Computer vision** for defect detection
- **100% inspection** capability
- **Real-time** quality metrics

### Statistical Process Control
- **Advanced analytics** for process optimization
- **Root cause analysis** automation
- **Continuous improvement** cycles

## Workforce Transformation

Industry 4.0 is changing the nature of manufacturing work:

### Upskilling Requirements
- **Digital literacy** training
- **Data analysis** capabilities
- **Human-machine collaboration**

### New Roles
- **Data scientists** in manufacturing
- **Digital twin** specialists
- **Automation engineers**

## Sustainability Integration

Smart manufacturing is driving environmental responsibility:

### Energy Efficiency
- **Optimized energy** consumption
- **Renewable energy** integration
- **Carbon footprint** reduction

### Waste Reduction
- **Circular economy** principles
- **Material optimization**
- **Recycling automation**

## Cybersecurity Considerations

Connected factories require robust security:

### Network Protection
- **Segmented networks**
- **Endpoint security**
- **Intrusion detection**

### Data Security
- **Encrypted communications**
- **Access controls**
- **Backup systems**

## Implementation Strategies

Successful Industry 4.0 transformation requires:

### Phased Approach
- **Pilot projects** for proof of concept
- **Gradual scaling** across facilities
- **Change management**

### Technology Partners
- **Vendor selection** criteria
- **Integration expertise**
- **Ongoing support**

## ROI and Benefits

Manufacturers implementing Industry 4.0 see:

- **30% reduction** in maintenance costs
- **25% improvement** in overall equipment effectiveness
- **20% decrease** in time-to-market
- **15% increase** in production flexibility

## Future Outlook

The next phase of manufacturing will include:

- **Autonomous factories** with minimal human oversight
- **AI-designed** products and processes
- **Quantum computing** for complex optimization
- **Sustainable manufacturing** as standard practice

Industry 4.0 is not just about technology—it's about creating a more efficient, flexible, and sustainable manufacturing ecosystem. Companies that embrace these changes are positioning themselves for long-term success in an increasingly competitive global market.`,
      category: "Manufacturing",
      author: "Kiantechwise Team",
      publishedAt: "2025-01-12",
      readTime: 10,
      tags: ["Manufacturing", "Industry 4.0", "IoT", "Automation", "Smart Factory"]
    }
  ]
};

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
    await strapiAPI('/industry-articles?pagination[limit]=1');
    console.log('✅ Strapi connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// Seed industry categories
async function seedIndustryCategories() {
  console.log('\n📂 Seeding industry categories...');
  const categoryMap = {};
  
  for (const category of industriesData.categories) {
    try {
      // Check if category exists
      const existing = await strapiAPI(`/industry-categories?filters[name][$eq]=${encodeURIComponent(category.name)}`);
      
      if (existing.data.length > 0) {
        categoryMap[category.name] = existing.data[0].documentId;
        console.log(`✅ Found existing: ${category.name}`);
      } else {
        // Create new category
        const response = await strapiAPI('/industry-categories', 'POST', {
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

// Seed industry articles
async function seedIndustryArticles(categoryMap) {
  console.log('\n📄 Seeding industry articles...');
  
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  for (let i = 0; i < industriesData.articles.length; i++) {
    const article = industriesData.articles[i];
    
    try {
      // Check if article already exists
      const existing = await strapiAPI(`/industry-articles?filters[slug][$eq]=${article.slug}`);
      
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
      
      // Prepare article data
      const articleData = {
        data: {
          title: article.title,
          excerpt: article.excerpt,
          slug: article.slug,
          content: article.content,
          author: article.author,
          publishedAt: new Date(article.publishedAt).toISOString(),
          readTime: article.readTime,
          category: categoryId,
          tags: article.tags || []
        }
      };
      
      console.log(`➕ Creating ${i + 1}/${industriesData.articles.length}: "${article.title}"`);
      
      const response = await strapiAPI('/industry-articles', 'POST', articleData);
      
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

// Main seeding function
async function runIndustriesSeeding() {
  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) process.exit(1);
    
    // Seed categories first
    const categoryMap = await seedIndustryCategories();
    console.log(`✅ Categories ready: ${Object.keys(categoryMap).length}`);
    
    // Seed all articles
    const results = await seedIndustryArticles(categoryMap);
    
    // Final summary
    console.log('\n🎉 Industries seeding complete!');
    console.log('='.repeat(50));
    console.log(`📊 Results:`);
    console.log(`   📂 Categories: ${Object.keys(categoryMap).length}`);
    console.log(`   ✅ Articles created: ${results.created}`);
    console.log(`   ⚠️  Articles skipped: ${results.skipped}`);
    console.log(`   ❌ Articles failed: ${results.errors}`);
    console.log(`   📄 Total processed: ${industriesData.articles.length}`);
    
    if (results.errors === 0 && results.created > 0) {
      console.log('\n🎊 SUCCESS! Your Industries section is now fully loaded in Strapi!');
      console.log('\n🔗 Next steps:');
      console.log('1. Visit http://localhost:3000/industries to see the new section');
      console.log('2. Upload featured images in Strapi Admin → Media Library');
      console.log('3. Test individual industry article pages');
    } else if (results.created === 0 && results.skipped > 0) {
      console.log('\n✅ All industry articles were already in Strapi - no changes needed!');
    } else {
      console.log('\n⚠️  Some issues occurred - check the logs above');
    }
    
  } catch (error) {
    console.error('❌ Industries seeding failed:', error.message);
    process.exit(1);
  }
}

// Check requirements
if (typeof fetch === 'undefined') {
  console.error('❌ Node.js 18+ required');
  process.exit(1);
}

// Run the seeding
runIndustriesSeeding();