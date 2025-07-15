import React from 'react';
import { Printer } from 'lucide-react';
import { Recipe } from '../../types';

interface PrintRecipeProps {
  recipe: Recipe;
  scale?: number;
  className?: string;
}

export const PrintRecipe: React.FC<PrintRecipeProps> = ({ 
  recipe, 
  scale = 1, 
  className = '' 
}) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generatePrintHTML(recipe, scale);
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <button
      onClick={handlePrint}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      aria-label="Print recipe"
    >
      <Printer className="h-4 w-4" />
      <span>Print</span>
    </button>
  );
};

const generatePrintHTML = (recipe: Recipe, scale: number): string => {
  const scaledIngredients = recipe.ingredients.map(ingredient => ({
    ...ingredient,
    quantity: ingredient.quantity 
      ? (parseFloat(ingredient.quantity) * scale).toString()
      : ingredient.quantity
  }));

  const scaledServings = recipe.servings ? Math.round(recipe.servings * scale) : undefined;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${recipe.title} - Recipe</title>
      <style>
        @media print {
          body { 
            font-family: 'Georgia', serif; 
            font-size: 12pt; 
            line-height: 1.4; 
            color: #000; 
            margin: 0; 
            padding: 20px; 
          }
          
          .recipe-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          
          .recipe-title {
            font-size: 24pt;
            font-weight: bold;
            margin: 0 0 10px 0;
          }
          
          .recipe-meta {
            font-size: 11pt;
            color: #666;
            margin: 5px 0;
          }
          
          .recipe-section {
            margin: 20px 0;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .ingredients-list {
            columns: 2;
            column-gap: 30px;
            margin: 0;
            padding: 0;
          }
          
          .ingredient-item {
            list-style: none;
            margin: 5px 0;
            padding: 3px 0;
            border-bottom: 1px dotted #ccc;
            break-inside: avoid;
          }
          
          .ingredient-quantity {
            font-weight: bold;
            display: inline-block;
            width: 60px;
          }
          
          .directions-list {
            counter-reset: step-counter;
            margin: 0;
            padding: 0;
          }
          
          .direction-item {
            counter-increment: step-counter;
            list-style: none;
            margin: 15px 0;
            padding-left: 30px;
            position: relative;
            page-break-inside: avoid;
          }
          
          .direction-item::before {
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 0;
            width: 20px;
            height: 20px;
            background: #000;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 10pt;
          }
          
          .nutrition-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 10px 0;
          }
          
          .nutrition-item {
            text-align: center;
            padding: 8px;
            border: 1px solid #000;
          }
          
          .nutrition-value {
            font-weight: bold;
            font-size: 11pt;
          }
          
          .nutrition-label {
            font-size: 9pt;
            color: #666;
          }
          
          .tags {
            margin: 10px 0;
          }
          
          .tag {
            display: inline-block;
            background: #f0f0f0;
            padding: 2px 8px;
            margin: 2px;
            border-radius: 3px;
            font-size: 10pt;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #000;
            font-size: 10pt;
            text-align: center;
            color: #666;
          }
          
          .page-break {
            page-break-before: always;
          }
        }
      </style>
    </head>
    <body>
      <div class="recipe-header">
        <h1 class="recipe-title">${recipe.title}</h1>
        ${recipe.rating ? `<div class="recipe-meta">Rating: ${'★'.repeat(recipe.rating)}${'☆'.repeat(5 - recipe.rating)}</div>` : ''}
        ${scaledServings ? `<div class="recipe-meta">Serves: ${scaledServings}</div>` : ''}
        ${recipe.prepTime ? `<div class="recipe-meta">Prep Time: ${recipe.prepTime} minutes</div>` : ''}
        ${recipe.cookTime ? `<div class="recipe-meta">Cook Time: ${recipe.cookTime} minutes</div>` : ''}
        ${recipe.difficulty ? `<div class="recipe-meta">Difficulty: ${recipe.difficulty}</div>` : ''}
        ${scale !== 1 ? `<div class="recipe-meta">Scaled: ${scale}x original recipe</div>` : ''}
      </div>
      
      <div class="recipe-section">
        <h2 class="section-title">Ingredients</h2>
        <ul class="ingredients-list">
          ${scaledIngredients.map(ingredient => `
            <li class="ingredient-item">
              <span class="ingredient-quantity">${ingredient.quantity || ''} ${ingredient.unit || ''}</span>
              ${ingredient.item}
            </li>
          `).join('')}
        </ul>
      </div>
      
      <div class="recipe-section">
        <h2 class="section-title">Instructions</h2>
        <ol class="directions-list">
          ${recipe.directions.map(direction => `
            <li class="direction-item">${direction.instruction}</li>
          `).join('')}
        </ol>
      </div>
      
      ${recipe.nutrition && Object.keys(recipe.nutrition).length > 0 ? `
        <div class="recipe-section">
          <h2 class="section-title">Nutrition Information</h2>
          <div class="nutrition-grid">
            ${recipe.nutrition.calories ? `
              <div class="nutrition-item">
                <div class="nutrition-value">${recipe.nutrition.calories}</div>
                <div class="nutrition-label">Calories</div>
              </div>
            ` : ''}
            ${recipe.nutrition.protein ? `
              <div class="nutrition-item">
                <div class="nutrition-value">${recipe.nutrition.protein}g</div>
                <div class="nutrition-label">Protein</div>
              </div>
            ` : ''}
            ${recipe.nutrition.carbohydrates ? `
              <div class="nutrition-item">
                <div class="nutrition-value">${recipe.nutrition.carbohydrates}g</div>
                <div class="nutrition-label">Carbs</div>
              </div>
            ` : ''}
            ${recipe.nutrition.fat ? `
              <div class="nutrition-item">
                <div class="nutrition-value">${recipe.nutrition.fat}g</div>
                <div class="nutrition-label">Fat</div>
              </div>
            ` : ''}
            ${recipe.nutrition.fiber ? `
              <div class="nutrition-item">
                <div class="nutrition-value">${recipe.nutrition.fiber}g</div>
                <div class="nutrition-label">Fiber</div>
              </div>
            ` : ''}
            ${recipe.nutrition.sodium ? `
              <div class="nutrition-item">
                <div class="nutrition-value">${recipe.nutrition.sodium}mg</div>
                <div class="nutrition-label">Sodium</div>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
      
      ${recipe.tags && recipe.tags.length > 0 ? `
        <div class="recipe-section">
          <h2 class="section-title">Tags</h2>
          <div class="tags">
            ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="footer">
        <p>Recipe from Recipe Keeper</p>
        <p>Printed on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;
};

export default PrintRecipe;