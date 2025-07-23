// Pre-Generate Popular Car Models Script for Sri Lankan Market
// Run this once to populate your cache with popular models

class PreGenerationManager {
    constructor(buyingGuideService) {
        this.buyingGuideService = buyingGuideService;
        
        // Popular car models in Sri Lankan market with priority levels
        this.popularModels = {
            // TIER 1: Most Popular (Generate first - highest search volume)
            tier1: [
                // Toyota - Most Popular
                'Toyota Aqua', 'Toyota Vitz', 'Toyota Prius', 'Toyota Axio', 'Toyota Allion',
                'Toyota Premio', 'Toyota Corolla', 'Toyota Hiace', 'Toyota C-HR',
                
                // Honda - High Demand
                'Honda Fit', 'Honda Civic', 'Honda Vezel', 'Honda Grace', 'Honda Insight',
                
                // Nissan - Popular SUVs/Compacts
                'Nissan March', 'Nissan Note', 'Nissan X-Trail', 'Nissan Leaf', 'Nissan Tiida',
                
                // Suzuki - Budget Friendly
                'Suzuki Alto', 'Suzuki Wagon R', 'Suzuki Swift', 'Suzuki Baleno', 'Suzuki Vitara'
            ],
            
            // TIER 2: Moderately Popular (Generate second)
            tier2: [
                // Toyota Mid-range
                'Toyota Passo', 'Toyota Wigo', 'Toyota Camry Hybrid', 'Toyota Yaris ATIV',
                'Toyota RAV4', 'Toyota Raize', 'Toyota Rush', 'Toyota Yaris Cross',
                'Toyota Corolla Cross', 'Toyota Lite Ace',
                
                // Honda Extended
                'Honda City', 'Honda Accord', 'Honda CR-V', 'Honda BR-V', 'Honda N-Box',
                
                // Nissan Extended
                'Nissan Almera', 'Nissan Sunny', 'Nissan Bluebird Sylphy', 'Nissan Dayz',
                'Nissan Magnite', 'Nissan Qashqai', 'Nissan AD Wagon',
                
                // Suzuki Extended
                'Suzuki Celerio', 'Suzuki S-Presso', 'Suzuki Ignis', 'Suzuki Hustler',
                'Suzuki Spacia', 'Suzuki Every', 'Suzuki Dzire', 'Suzuki Jimny',
                
                // Mitsubishi Popular
                'Mitsubishi Montero', 'Mitsubishi Pajero', 'Mitsubishi Outlander', 
                'Mitsubishi ASX', 'Mitsubishi Lancer', 'Mitsubishi Mirage'
            ],
            
            // TIER 3: Luxury/Premium (Generate last)
            tier3: [
                // Mercedes-Benz
                'Mercedes-Benz C-Class', 'Mercedes-Benz E-Class', 'Mercedes-Benz GLC',
                'Mercedes-Benz GLE', 'Mercedes-Benz A-Class', 'Mercedes-Benz CLA',
                
                // BMW
                'BMW 3 Series', 'BMW 5 Series', 'BMW X1', 'BMW X3', 'BMW X5',
                
                // Audi
                'Audi A3', 'Audi A4', 'Audi Q3', 'Audi Q5',
                
                // Other Premium
                'Mazda 2', 'Mazda 3', 'Mazda CX-3', 'Mazda CX-5',
                'Subaru Forester', 'Subaru XV', 'Subaru Impreza',
                'Hyundai i10', 'Hyundai Accent', 'Hyundai Elantra', 'Hyundai Tucson',
                'Kia Picanto', 'Kia Rio', 'Kia Sportage', 'Kia Cerato'
            ]
        };
        
        // Common year ranges for each tier
        this.yearRanges = {
            tier1: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'], // Full range
            tier2: ['2016', '2017', '2018', '2019', '2020', '2021'], // Recent focus  
            tier3: ['2018', '2019', '2020', '2021', '2022'] // Latest only
        };
        
        this.generationStats = {
            total: 0,
            successful: 0,
            failed: 0,
            cached: 0
        };

           // Add this to the PreGenerationManager class
           generateCommonAliases(); {
            const commonAliases = [
                // High-priority aliases to pre-generate
                'toyota chr', 'honda hrv', 'honda hr-v', 'nissan xtrail', 'suzuki wagonr',
                'mercedes c class', 'bmw 3 series', 'mazda cx5', 'mazda cx3',
                'honda crv', 'honda cr-v', 'toyota rav 4', 'nissan x trail'
            ];
            
            return commonAliases;
        }
    }

    // Calculate total guides to generate
    getTotalCount() {
        let total = 0;
        Object.keys(this.popularModels).forEach(tier => {
            const models = this.popularModels[tier];
            const years = this.yearRanges[tier];
            total += models.length * (years.length + 1); // +1 for general model (no year)
        });
        return total;
    }

    // Generate guides for a specific tier
    async generateTier(tierName, options = {}) {
        const models = this.popularModels[tierName];
        const years = this.yearRanges[tierName];
        const delay = options.delay || 4000; // 4 seconds between calls to respect rate limits
        
        console.log(`\n🚀 Starting ${tierName.toUpperCase()} generation...`);
        console.log(`📊 Models: ${models.length}, Years: ${years.length}, Total: ${models.length * (years.length + 1)}`);
        
        let tierStats = { total: 0, successful: 0, failed: 0, cached: 0 };
        
        for (const model of models) {
            // Generate general model guide (no specific year)
            await this.generateSingleGuide(model, null, tierStats);
            if (delay > 0) await this.sleep(delay);
            
            // Generate year-specific guides
            for (const year of years) {
                await this.generateSingleGuide(model, year, tierStats);
                if (delay > 0) await this.sleep(delay);
            }
            
            // Progress update every 5 models
            if ((tierStats.total % 50) === 0) {
                this.logProgress(tierName, tierStats);
            }
        }
        
        console.log(`✅ ${tierName.toUpperCase()} completed:`, tierStats);
        return tierStats;
    }

    // Generate a single guide
    async generateSingleGuide(model, year, stats) {
        const searchQuery = year ? `${model} ${year}` : model;
        stats.total++;
        this.generationStats.total++;
        
        try {
            // Check if already cached
            const [make, modelName] = model.split(' ');
            const cacheKey = this.buyingGuideService.getCacheKey(make, modelName, year);
            const cached = this.buyingGuideService.getCachedGuide(cacheKey);
            
            if (cached) {
                console.log(`💾 Cached: ${searchQuery}`);
                stats.cached++;
                this.generationStats.cached++;
                return;
            }
            
            // Generate new guide
            console.log(`🔄 Generating: ${searchQuery}`);
            const result = await this.buyingGuideService.generateBuyingGuide(searchQuery);
            
            if (result.success && !result.fallback) {
                console.log(`✅ Success: ${searchQuery}`);
                stats.successful++;
                this.generationStats.successful++;
            } else if (result.fallback) {
                console.log(`⚠️  Fallback: ${searchQuery}`);
                stats.successful++; // Count fallback as success
                this.generationStats.successful++;
            } else {
                throw new Error('Generation failed');
            }
            
        } catch (error) {
            console.log(`❌ Failed: ${searchQuery} - ${error.message}`);
            stats.failed++;
            this.generationStats.failed++;
        }
    }

    // Utility function for delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Log progress
    logProgress(tier, stats) {
        const progress = ((stats.total / this.getTotalCount()) * 100).toFixed(1);
        console.log(`📈 ${tier} Progress: ${stats.total} completed (${progress}%) - ✅${stats.successful} 💾${stats.cached} ❌${stats.failed}`);
    }

    // Main generation function
    async generateAll(options = {}) {
        const startTime = Date.now();
        console.log('🎯 Starting Pre-Generation of Popular Car Models for Sri Lanka');
        console.log(`📊 Total guides to generate: ${this.getTotalCount()}`);
        console.log(`⏱️  Estimated time: ${Math.ceil(this.getTotalCount() * 4 / 60)} minutes\n`);
        
        try {
            // Generate by priority
            const tier1Stats = await this.generateTier('tier1', options);
            const tier2Stats = await this.generateTier('tier2', options);
            const tier3Stats = await this.generateTier('tier3', options);
            
            const endTime = Date.now();
            const duration = Math.round((endTime - startTime) / 1000 / 60);
            
            console.log('\n🎉 PRE-GENERATION COMPLETE!');
            console.log('📊 Final Statistics:');
            console.log(`   Total Processed: ${this.generationStats.total}`);
            console.log(`   ✅ Successful: ${this.generationStats.successful}`);
            console.log(`   💾 From Cache: ${this.generationStats.cached}`);
            console.log(`   ❌ Failed: ${this.generationStats.failed}`);
            console.log(`   ⏱️  Duration: ${duration} minutes`);
            console.log(`   💰 API Calls Used: ${this.generationStats.successful - this.generationStats.cached}`);
            
            // Save generation report
            this.saveGenerationReport({
                timestamp: new Date().toISOString(),
                duration: duration,
                stats: this.generationStats,
                tiers: { tier1Stats, tier2Stats, tier3Stats }
            });
            
        } catch (error) {
            console.error('❌ Pre-generation failed:', error);
        }
    }

    // Save generation report
    saveGenerationReport(report) {
        try {
            localStorage.setItem('ai_pregeneration_report', JSON.stringify(report));
            console.log('📄 Generation report saved to localStorage');
        } catch (e) {
            console.warn('Could not save generation report:', e);
        }
    }

    // Quick generation for testing (only tier 1, no years)
    async generateQuickTest() {
        console.log('🧪 Quick Test Generation - Tier 1 models only (no years)');
        const models = this.popularModels.tier1.slice(0, 10); // First 10 models only
        
        for (const model of models) {
            await this.generateSingleGuide(model, null, this.generationStats);
            await this.sleep(4000);
        }
        
        console.log('✅ Quick test completed:', this.generationStats);
    }
}

// Usage Examples:

// 1. Quick test (generate 10 most popular models)
async function runQuickTest() {
    const preGen = new PreGenerationManager(buyingGuideService);
    await preGen.generateQuickTest();
}

// 2. Generate only Tier 1 (most popular)
async function generateTier1Only() {
    const preGen = new PreGenerationManager(buyingGuideService);
    await preGen.generateTier('tier1', { delay: 4000 });
}

// 3. Generate everything (full production cache)
async function generateFullCache() {
    const preGen = new PreGenerationManager(buyingGuideService);
    await preGen.generateAll({ delay: 4000 });
}

// 4. Fast generation for development (shorter delays)
async function generateFast() {
    const preGen = new PreGenerationManager(buyingGuideService);
    await preGen.generateAll({ delay: 1000 }); // 1 second delays - use carefully!
}

// Initialize and export
if (typeof buyingGuideService !== 'undefined') {
    window.preGenerationManager = new PreGenerationManager(buyingGuideService);
    
    // Auto-expose functions to global scope for easy console usage
    window.runQuickTest = runQuickTest;
    window.generateTier1Only = generateTier1Only;
    window.generateFullCache = generateFullCache;
    window.generateFast = generateFast;
    
    console.log('🔧 Pre-generation tools loaded! Available commands:');
    console.log('   runQuickTest() - Generate 10 popular models');
    console.log('   generateTier1Only() - Generate most popular models');
    console.log('   generateFullCache() - Generate all models (recommended)');
    console.log('   generateFast() - Fast generation for development');
}