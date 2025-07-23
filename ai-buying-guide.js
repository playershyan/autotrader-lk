// AI Buying Guide Service using Google Gemini
class AIBuyingGuideService {
    constructor() {
        this.GEMINI_API_KEY = 'AIzaSyAmGRyTq6P8aBiH70DsETrR7Ny7DjmXPPs'; // Replace with your actual key
        this.GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.cache = new Map(); // Initialize the Map properly
        this.CACHE_DURATION = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
        this.initializeModelAliases();
        this.loadCacheFromStorage();
    }

    initializeModelAliases() {
        this.modelAliases = {
            // Toyota aliases
            'chr': 'c-hr',
            'c hr': 'c-hr',
            'rav 4': 'rav4',
            'rav-4': 'rav4',
            'land cruiser': 'landcruiser',
            'landcruiser': 'land cruiser',
            'camry hybrid': 'camry',
            'yaris ativ': 'yaris',
            'lite ace': 'liteace',
            // Honda aliases
            'hr-v': 'vezel',
            'hrv': 'vezel',
            'hr v': 'vezel',
            'n box': 'n-box',
            'nbox': 'n-box',
            'cr-v': 'crv',
            'cr v': 'crv',
            'crv': 'cr-v',
            'br-v': 'brv',
            'br v': 'brv',
            'brv': 'br-v',
            // Nissan aliases
            'x trail': 'x-trail',
            'xtrail': 'x-trail',
            'x-trail': 'x trail',
            'bluebird sylphy': 'sylphy',
            'bluebird': 'sylphy',
            'ad wagon': 'ad',
            'ad van': 'ad wagon',
            // Suzuki aliases
            'wagon r': 'wagonr',
            'wagonr': 'wagon r',
            'wagon-r': 'wagon r',
            's presso': 's-presso',
            'spresso': 's-presso',
            'sx4': 's-cross',
            's cross': 's-cross',
            'scross': 's-cross',
            'grand vitara': 'vitara',
            // Mitsubishi aliases
            'rvr': 'asx',
            'outlander sport': 'asx',
            'mirage g4': 'attrage',
            'space star': 'mirage',
            'ek wagon': 'ek',
            'ek space': 'ek wagon',
            // Mercedes aliases
            'c class': 'c-class',
            'cclass': 'c-class',
            'e class': 'e-class',
            'eclass': 'e-class',
            's class': 's-class',
            'sclass': 's-class',
            'a class': 'a-class',
            'aclass': 'a-class',
            'g wagon': 'g-class',
            'gwagon': 'g-class',
            'g class': 'g-class',
            'gclass': 'g-class',
            // BMW aliases
            '3 series': '3series',
            '3series': '3 series',
            '5 series': '5series',
            '5series': '5 series',
            '7 series': '7series',
            '7series': '7 series',
            // Hyundai aliases
            'grand i10': 'i10',
            'i 10': 'i10',
            'ioniq 5': 'ioniq5',
            'ioniq5': 'ioniq 5',
            'ioniq 6': 'ioniq6',
            'ioniq6': 'ioniq 6',
            // Mazda aliases
            'demio': '2',
            'mazda 2': 'demio',
            'axela': '3',
            'mazda 3': 'axela',
            'atenza': '6',
            'mazda 6': 'atenza',
            'cx 3': 'cx-3',
            'cx3': 'cx-3',
            'cx 5': 'cx-5',
            'cx5': 'cx-5',
            'cx 8': 'cx-8',
            'cx8': 'cx-8',
            'bt 50': 'bt-50',
            'bt50': 'bt-50',
            // Common variations
            'prado': 'land cruiser prado',
            'fortuner': 'fortuner',
            'hiace': 'hiace',
            'hilux': 'hilux'
        };
    }

    normalizeSearchQuery(searchQuery) {
        let normalized = searchQuery.toLowerCase().trim();
        normalized = normalized.replace(/[^ -\w\s-]/g, '').replace(/\s+/g, ' ');
        for (const [alias, canonical] of Object.entries(this.modelAliases)) {
            const aliasRegex = new RegExp(`\\b${alias}\\b`, 'gi');
            if (aliasRegex.test(normalized)) {
                normalized = normalized.replace(aliasRegex, canonical);
                break;
            }
        }
        return normalized;
    }

    loadCacheFromStorage() {
        try {
            const stored = localStorage.getItem('ai_guide_cache');
            if (stored) {
                const cacheData = JSON.parse(stored);
                for (const [key, value] of Object.entries(cacheData)) {
                    if (Date.now() - value.timestamp < this.CACHE_DURATION) {
                        this.cache.set(key, value);
                    }
                }
            }
        } catch (e) {
            console.warn('Could not load cache from localStorage:', e);
            this.cache = new Map();
        }
    }

    shouldShowGuide(searchQuery, filters) {
        const query = searchQuery.toLowerCase().trim();
        const carBrands = ['toyota', 'nissan', 'honda', 'suzuki', 'mitsubishi', 'mazda', 'bmw', 'mercedes', 'audi', 'hyundai', 'kia', 'ford'];
        const hasBrand = carBrands.some(brand => query.includes(brand));
        const hasSpecificFilters = filters && (filters.make || filters.model);
        return hasBrand || hasSpecificFilters || query.length > 4;
    }

    extractVehicleDetails(searchQuery, filters) {
        const normalizedQuery = this.normalizeSearchQuery(searchQuery);
        const query = normalizedQuery.toLowerCase();
        let make = '', model = '', year = '';
        if (filters) {
            make = filters.make || '';
            model = filters.model || '';
            year = filters.year || '';
            if (model) {
                model = this.normalizeSearchQuery(model);
            }
        }
        if (!make || !model) {
            const patterns = {
                'toyota': ['prius', 'corolla', 'camry', 'aqua', 'vitz', 'axio', 'premio', 'allion', 'fielder', 'c-hr', 'hiace', 'rav4', 'land cruiser', 'fortuner', 'yaris', 'raize', 'rush'],
                'honda': ['civic', 'accord', 'vezel', 'fit', 'insight', 'pilot', 'cr-v', 'br-v', 'city', 'grace', 'freed', 'n-box'],
                'nissan': ['x-trail', 'qashqai', 'leaf', 'march', 'note', 'tiida', 'sylphy', 'almera', 'sunny', 'magnite', 'juke', 'kicks', 'patrol'],
                'mitsubishi': ['montero', 'pajero', 'lancer', 'outlander', 'asx', 'xpander', 'attrage', 'mirage', 'galant'],
                'suzuki': ['alto', 'wagon r', 'swift', 'baleno', 'vitara', 'jimny', 'celerio', 's-presso', 'ignis', 'hustler', 'spacia', 'every', 'dzire', 's-cross'],
                'mazda': ['2', '3', '6', 'cx-3', 'cx-5', 'cx-8', 'bt-50', 'demio', 'axela', 'atenza'],
                'bmw': ['3 series', '5 series', '7 series', 'x1', 'x3', 'x5', 'x7', '1 series'],
                'mercedes': ['c-class', 'e-class', 's-class', 'a-class', 'glc', 'gle', 'gls', 'g-class', 'cla'],
                'audi': ['a3', 'a4', 'a6', 'q3', 'q5', 'q7', 'a1', 'q2']
            };
            for (const [brandName, models] of Object.entries(patterns)) {
                if (query.includes(brandName)) {
                    make = brandName;
                    for (const modelName of models) {
                        if (query.includes(modelName)) {
                            model = modelName;
                            break;
                        }
                    }
                    break;
                }
            }
        }
        if (!year) {
            const yearMatch = query.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) {
                year = yearMatch[0];
            }
        }
        return { make, model, year };
    }

    getCacheKey(make, model, year) {
        return `${make}-${model}-${year || 'any'}`.toLowerCase();
    }

    getCachedGuide(cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
            return cached.data;
        }
        return null;
    }

    setCachedGuide(cacheKey, data) {
        this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        try {
            const existingCache = localStorage.getItem('ai_guide_cache');
            let cacheData = {};
            if (existingCache) {
                cacheData = JSON.parse(existingCache);
            }
            cacheData[cacheKey] = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem('ai_guide_cache', JSON.stringify(cacheData));
        } catch (e) {
            console.warn('Could not save to localStorage cache:', e);
        }
    }

    createPrompt(make, model, year) {
        const vehicleName = `${make} ${model}${year ? ` ${year}` : ''}`.trim();
        return `You are an automotive expert providing buying guidance for used car buyers in Sri Lanka. Generate a comprehensive buying guide for the ${vehicleName}.

IMPORTANT REQUIREMENTS:
- Focus on factual, well-documented information only
- Use phrases like "commonly reported" rather than definitive statements
- Be specific about inspection points that matter for this model
- Include Sri Lankan market context where relevant
- Keep response concise but informative

Please provide the following information in JSON format:

{
  "overview": "2-3 sentence summary of this vehicle's market position, reliability, and suitability",
  "strengths": [
    "List 3-4 key strengths/selling points of this model",
    "Focus on reliability, features, value retention, fuel economy etc"
  ],
  "inspection_points": [
    "List 3-4 critical things buyers should inspect when viewing this model",
    "Be specific to known weak points or areas that commonly need attention"
  ],
  "common_issues": [
    "List 3-4 well-documented common issues for this model",
    "Include approximate years affected if known (e.g., 'Early 2018-2019 models')",
    "Focus on mechanical/electrical issues, not cosmetic"
  ],
  "price_context": "Brief context about typical pricing for this model in Sri Lankan market"
}

Vehicle: ${vehicleName}`;
    }

    async callGeminiAPI(prompt) {
        try {
            const response = await fetch(this.GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': this.GEMINI_API_KEY
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 2048,
                    }
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API call failed: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid API response structure');
            }
            const textContent = data.candidates[0].content.parts[0].text;
            const jsonMatch = textContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in API response');
            }
            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }

    generateFallbackContent(make, model, year) {
        const vehicleName = `${make} ${model}${year ? ` ${year}` : ''}`.trim();
        return {
            overview: `The ${vehicleName} is a popular choice in the Sri Lankan market. Check the vehicle's maintenance history and overall condition before purchasing.`,
            strengths: [
                'Widely available parts and service support',
                'Good resale value retention',
                'Proven reliability in local conditions'
            ],
            inspection_points: [
                'Check engine performance and service history',
                'Inspect air conditioning system functionality',
                'Verify all electrical systems are working',
                'Examine tire wear patterns and suspension'
            ],
            common_issues: [
                'Regular maintenance items may be due',
                'Check for any pending recalls or service bulletins',
                'Verify proper cooling system operation'
            ],
            price_context: 'Prices vary based on condition, mileage, and market demand.'
        };
    }

    async generateBuyingGuide(searchQuery, filters = null) {
        try {
            const { make, model, year } = this.extractVehicleDetails(searchQuery, filters);
            if (!make && !model) {
                throw new Error('Unable to identify specific vehicle model');
            }
            const cacheKey = this.getCacheKey(make, model, year);
            const cached = this.getCachedGuide(cacheKey);
            if (cached) {
                console.log('Using cached buying guide');
                return {
                    success: true,
                    data: cached,
                    vehicleName: `${make} ${model}${year ? ` ${year}` : ''}`.trim(),
                    cached: true
                };
            }
            console.log('Generating new buying guide via API');
            const prompt = this.createPrompt(make, model, year);
            const apiResponse = await this.callGeminiAPI(prompt);
            this.setCachedGuide(cacheKey, apiResponse);
            return {
                success: true,
                data: apiResponse,
                vehicleName: `${make} ${model}${year ? ` ${year}` : ''}`.trim(),
                cached: false
            };
        } catch (error) {
            console.error('Error generating buying guide:', error);
            const { make, model, year } = this.extractVehicleDetails(searchQuery, filters);
            const fallbackData = this.generateFallbackContent(make, model, year);
            return {
                success: true,
                data: fallbackData,
                vehicleName: `${make} ${model}${year ? ` ${year}` : ''}`.trim(),
                fallback: true
            };
        }
    }
}

// Initialize the service (for browser usage)
window.buyingGuideService = new AIBuyingGuideService();