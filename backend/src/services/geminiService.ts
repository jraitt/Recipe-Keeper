import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';

// Rate limiting
interface RateLimitInfo {
  count: number;
  resetTime: number;
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private rateLimits: Map<string, RateLimitInfo> = new Map();
  private readonly maxRequestsPerMinute = 60;
  private readonly maxRequestsPerDay = 1000;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Check rate limits for API calls
   */
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const minuteKey = `${userId}:minute:${Math.floor(now / 60000)}`;
    const dayKey = `${userId}:day:${Math.floor(now / 86400000)}`;

    // Check minute limit
    const minuteLimit = this.rateLimits.get(minuteKey);
    if (minuteLimit && minuteLimit.count >= this.maxRequestsPerMinute) {
      return false;
    }

    // Check day limit
    const dayLimit = this.rateLimits.get(dayKey);
    if (dayLimit && dayLimit.count >= this.maxRequestsPerDay) {
      return false;
    }

    // Update counters
    this.rateLimits.set(minuteKey, {
      count: (minuteLimit?.count || 0) + 1,
      resetTime: now + 60000
    });

    this.rateLimits.set(dayKey, {
      count: (dayLimit?.count || 0) + 1,
      resetTime: now + 86400000
    });

    // Clean up old entries
    this.cleanupRateLimits();

    return true;
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, limit] of this.rateLimits.entries()) {
      if (limit.resetTime < now) {
        this.rateLimits.delete(key);
      }
    }
  }

  /**
   * Create photo analysis prompt
   */
  private getPhotoAnalysisPrompt(): string {
    return `
Analyze this food photo and extract recipe information. You are a professional chef and food analyst.

Please return a JSON object with the following structure:
{
  "title": "Recipe name (required)",
  "servings": "Number of servings (estimate if not visible)",
  "prepTime": "Preparation time in minutes (estimate)",
  "cookTime": "Cooking time in minutes (estimate)",
  "difficulty": "easy|medium|hard|expert",
  "ingredients": [
    {
      "quantity": "Amount as string",
      "unit": "Unit of measurement",
      "item": "Ingredient name"
    }
  ],
  "directions": [
    {
      "step": 1,
      "instruction": "Step-by-step instruction"
    }
  ],
  "nutrition": {
    "calories": "Estimated calories per serving",
    "protein": "Protein in grams",
    "carbohydrates": "Carbs in grams",
    "fat": "Fat in grams",
    "fiber": "Fiber in grams",
    "sodium": "Sodium in milligrams"
  },
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": "A number from 0-100 indicating how confident you are in this analysis"
}

Rules:
1. If you cannot identify the dish, return a confidence score below 50
2. Make reasonable estimates for missing information based on similar dishes
3. Include cooking techniques in the directions
4. Add relevant tags (cuisine type, dietary restrictions, meal type, etc.)
5. Ensure ingredients are realistic and proportional
6. If it's not a food photo, return {"error": "Not a food image", "confidence": 0}
7. Be specific with measurements and cooking times
8. Return only valid JSON, no additional text

Analyze the image now:
`;
  }

  /**
   * Create URL content analysis prompt
   */
  private getUrlAnalysisPrompt(): string {
    return `
Extract recipe information from this webpage content. You are a professional chef and recipe parser.

Please return a JSON object with the following structure:
{
  "title": "Recipe name (required)",
  "servings": "Number of servings",
  "prepTime": "Preparation time in minutes",
  "cookTime": "Cooking time in minutes",
  "difficulty": "easy|medium|hard|expert",
  "ingredients": [
    {
      "quantity": "Amount as string",
      "unit": "Unit of measurement",
      "item": "Ingredient name"
    }
  ],
  "directions": [
    {
      "step": 1,
      "instruction": "Step-by-step instruction"
    }
  ],
  "nutrition": {
    "calories": "Calories per serving",
    "protein": "Protein in grams",
    "carbohydrates": "Carbs in grams",
    "fat": "Fat in grams",
    "fiber": "Fiber in grams",
    "sodium": "Sodium in milligrams"
  },
  "tags": ["tag1", "tag2", "tag3"],
  "imageUrl": "Primary recipe image URL from the Images section (REQUIRED if Images section exists)",
  "confidence": "A number from 0-100 indicating parsing confidence"
}

Rules:
1. Parse structured data (JSON-LD, microdata) if available
2. Clean up ingredient lists and normalize units
3. Convert directions to numbered steps
4. Extract nutrition information if available
5. Add relevant tags based on content
6. If Images section is provided, YOU MUST include the imageUrl field with the first/best recipe image URL
7. Ensure image URLs are complete and valid (start with http/https)
8. NEVER omit the imageUrl field if Images section exists
9. If no recipe is found, return {"error": "No recipe found", "confidence": 0}
10. Return only valid JSON, no additional text

Parse this content:
`;
  }

  /**
   * Analyze recipe from photo
   */
  async analyzeRecipeFromPhoto(imageBuffer: Buffer, userId: string): Promise<any> {
    try {
      // Check cache first
      const cachedResult = await cacheService.getCachedPhotoAnalysis(imageBuffer);
      if (cachedResult) {
        logger.info(`Returning cached photo analysis for user ${userId}`);
        return cachedResult;
      }

      // Check rate limits
      if (!this.checkRateLimit(userId)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      logger.info(`Starting photo analysis for user ${userId}`);

      // Prepare image for Gemini
      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: 'image/jpeg'
        }
      };

      // Get analysis prompt
      const prompt = this.getPhotoAnalysisPrompt();

      // Call Gemini API
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      logger.info(`Gemini API response received for user ${userId}`);

      // Parse JSON response
      const parsedResponse = this.parseGeminiResponse(text);
      
      // Validate and enrich response
      const validatedResponse = this.validateAndEnrichResponse(parsedResponse);

      // Cache the result
      await cacheService.setCachedPhotoAnalysis(imageBuffer, validatedResponse);

      logger.info(`Photo analysis completed for user ${userId}`);
      return validatedResponse;

    } catch (error) {
      logger.error(`Photo analysis failed for user ${userId}:`, error);
      throw this.handleGeminiError(error);
    }
  }

  /**
   * Analyze recipe from URL content
   */
  async analyzeRecipeFromUrl(urlContent: string, userId: string, originalUrl?: string): Promise<any> {
    try {
      // Check cache first
      const cacheKey = originalUrl || urlContent;
      const cachedResult = await cacheService.getCachedUrlAnalysis(cacheKey);
      if (cachedResult) {
        logger.info(`Returning cached URL analysis for user ${userId}`);
        return cachedResult;
      }

      // Check rate limits
      if (!this.checkRateLimit(userId)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      logger.info(`Starting URL analysis for user ${userId}`);

      // Get analysis prompt
      const prompt = this.getUrlAnalysisPrompt();
      const fullPrompt = `${prompt}\n\n${urlContent}`;

      // Log the content being sent to AI for debugging
      logger.info(`Sending content to AI (first 500 chars): ${fullPrompt.substring(0, 500)}...`);

      // Call Gemini API
      const result = await this.model.generateContent([fullPrompt]);
      const response = await result.response;
      const text = response.text();

      logger.info(`Gemini API response received for user ${userId}`);
      logger.info(`Raw AI response: ${text}`);

      // Parse JSON response
      const parsedResponse = this.parseGeminiResponse(text);
      
      // Validate and enrich response
      const validatedResponse = this.validateAndEnrichResponse(parsedResponse);

      // Cache the result
      await cacheService.setCachedUrlAnalysis(cacheKey, validatedResponse);

      logger.info(`URL analysis completed for user ${userId}`);
      return validatedResponse;

    } catch (error) {
      logger.error(`URL analysis failed for user ${userId}:`, error);
      throw this.handleGeminiError(error);
    }
  }

  /**
   * Parse Gemini API response
   */
  private parseGeminiResponse(text: string): any {
    try {
      // Clean up response text
      const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
      
      // Parse JSON
      const parsed = JSON.parse(cleanedText);
      
      return parsed;
    } catch (error) {
      logger.error('Failed to parse Gemini response:', error);
      throw new Error('Invalid response format from AI service');
    }
  }

  /**
   * Validate and enrich AI response
   */
  private validateAndEnrichResponse(response: any): any {
    // Check for error responses
    if (response.error) {
      throw new Error(response.error);
    }

    // Validate required fields
    if (!response.title) {
      throw new Error('Recipe title is required');
    }

    // Set defaults for missing values
    const enriched = {
      title: response.title,
      servings: response.servings || 4,
      prepTime: response.prepTime || 30,
      cookTime: response.cookTime || 30,
      difficulty: response.difficulty || 'medium',
      ingredients: response.ingredients || [],
      directions: response.directions || [],
      nutrition: response.nutrition || {},
      tags: response.tags || [],
      imageUrl: response.imageUrl || '', // Include imageUrl from AI response
      confidence: response.confidence || 70,
      aiGenerated: true,
      generatedAt: new Date().toISOString()
    };

    // Validate ingredients structure
    enriched.ingredients = enriched.ingredients.map((ingredient: any, index: number) => ({
      quantity: ingredient.quantity || '1',
      unit: ingredient.unit || '',
      item: ingredient.item || `Ingredient ${index + 1}`
    }));

    // Validate directions structure
    enriched.directions = enriched.directions.map((direction: any, index: number) => ({
      step: direction.step || index + 1,
      instruction: direction.instruction || `Step ${index + 1}`
    }));

    // Validate nutrition structure
    enriched.nutrition = {
      calories: this.parseNumber(enriched.nutrition.calories),
      protein: this.parseNumber(enriched.nutrition.protein),
      carbohydrates: this.parseNumber(enriched.nutrition.carbohydrates),
      fat: this.parseNumber(enriched.nutrition.fat),
      fiber: this.parseNumber(enriched.nutrition.fiber),
      sodium: this.parseNumber(enriched.nutrition.sodium)
    };

    return enriched;
  }

  /**
   * Parse number from string or number
   */
  private parseNumber(value: any): number | undefined {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^\d.]/g, ''));
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }

  /**
   * Handle Gemini API errors
   */
  private handleGeminiError(error: any): Error {
    if (error.message?.includes('rate limit')) {
      return new Error('AI service rate limit exceeded. Please try again later.');
    }
    
    if (error.message?.includes('API key')) {
      return new Error('AI service configuration error. Please contact support.');
    }
    
    if (error.message?.includes('quota')) {
      return new Error('AI service quota exceeded. Please try again later.');
    }
    
    return new Error('AI service temporarily unavailable. Please try again later.');
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(userId: string): { minuteRemaining: number; dayRemaining: number } {
    const now = Date.now();
    const minuteKey = `${userId}:minute:${Math.floor(now / 60000)}`;
    const dayKey = `${userId}:day:${Math.floor(now / 86400000)}`;

    const minuteLimit = this.rateLimits.get(minuteKey);
    const dayLimit = this.rateLimits.get(dayKey);

    return {
      minuteRemaining: this.maxRequestsPerMinute - (minuteLimit?.count || 0),
      dayRemaining: this.maxRequestsPerDay - (dayLimit?.count || 0)
    };
  }
}

export const geminiService = new GeminiService();