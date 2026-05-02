export interface WeightEntry {
  name: string;
  cup: number | null;
  tbsp: number | null;
  tsp: number | null;
}

export interface WeightCategory {
  label: string;
  entries: WeightEntry[];
}

export const WEIGHT_CHART: WeightCategory[] = [
  {
    label: "Flours & Starches",
    entries: [
      { name: "All-purpose flour", cup: 120, tbsp: 7.5, tsp: 2.5 },
      { name: "Bread flour", cup: 120, tbsp: 7.5, tsp: 2.5 },
      { name: "Whole wheat flour", cup: 113, tbsp: 7.1, tsp: 2.4 },
      { name: "Cake flour", cup: 120, tbsp: 7.5, tsp: 2.5 },
      { name: "Self-rising flour", cup: 113, tbsp: 7.1, tsp: 2.4 },
      { name: "Pastry flour", cup: 106, tbsp: 6.6, tsp: 2.2 },
      { name: "Almond flour", cup: 96, tbsp: 6, tsp: 2 },
      { name: "Oat flour", cup: 92, tbsp: 5.75, tsp: 1.9 },
      { name: "Rye / medium rye flour", cup: 106, tbsp: 6.6, tsp: 2.2 },
      { name: "Buckwheat flour", cup: 120, tbsp: 7.5, tsp: 2.5 },
      { name: "Coconut flour", cup: 128, tbsp: 8, tsp: 2.7 },
      { name: "Rice flour", cup: 142, tbsp: 8.9, tsp: 3 },
      { name: "Brown rice flour", cup: 128, tbsp: 8, tsp: 2.7 },
      { name: "Semolina", cup: 163, tbsp: 10.2, tsp: 3.4 },
      { name: "Cornmeal", cup: 138, tbsp: 8.6, tsp: 2.9 },
      { name: "Chickpea flour", cup: 85, tbsp: 5.3, tsp: 1.8 },
      { name: "Spelt flour", cup: 99, tbsp: 6.2, tsp: 2.1 },
      { name: "Masa harina", cup: 93, tbsp: 5.8, tsp: 1.9 },
      { name: "Cornstarch", cup: 112, tbsp: 7, tsp: 2.3 },
      { name: "Potato starch", cup: 152, tbsp: 9.5, tsp: 3.2 },
      { name: "Tapioca starch", cup: 113, tbsp: 7.1, tsp: 2.4 },
      { name: "Arrowroot", cup: 112, tbsp: 7, tsp: 2.3 },
      { name: "Potato flour", cup: 184, tbsp: 11.5, tsp: 3.8 },
    ],
  },
  {
    label: "Sugars",
    entries: [
      { name: "Granulated sugar", cup: 198, tbsp: 12.4, tsp: 4.1 },
      { name: "Brown sugar (packed)", cup: 213, tbsp: 13.3, tsp: 4.4 },
      { name: "Powdered / confectioners' sugar", cup: 113, tbsp: 7.1, tsp: 2.4 },
      { name: "Coconut sugar", cup: 154, tbsp: 9.6, tsp: 3.2 },
      { name: "Maple sugar", cup: 156, tbsp: 9.75, tsp: 3.25 },
      { name: "Turbinado / raw sugar", cup: 180, tbsp: 11.25, tsp: 3.75 },
      { name: "Demerara sugar", cup: 220, tbsp: 13.75, tsp: 4.6 },
    ],
  },
  {
    label: "Fats & Oils",
    entries: [
      { name: "Butter", cup: 226, tbsp: 14.1, tsp: 4.7 },
      { name: "Ghee", cup: 176, tbsp: 11, tsp: 3.7 },
      { name: "Shortening", cup: 184, tbsp: 11.5, tsp: 3.8 },
      { name: "Coconut oil", cup: 226, tbsp: 14.1, tsp: 4.7 },
      { name: "Vegetable / canola oil", cup: 198, tbsp: 12.4, tsp: 4.1 },
      { name: "Olive oil", cup: 200, tbsp: 12.5, tsp: 4.2 },
    ],
  },
  {
    label: "Nut Butters & Spreads",
    entries: [
      { name: "Peanut butter", cup: 270, tbsp: 16.9, tsp: 5.6 },
      { name: "Almond butter", cup: 272, tbsp: 17, tsp: 5.7 },
      { name: "Tahini", cup: 256, tbsp: 16, tsp: 5.3 },
      { name: "Nutella / hazelnut spread", cup: 298, tbsp: 18.6, tsp: 6.2 },
    ],
  },
  {
    label: "Dairy",
    entries: [
      { name: "Milk / buttermilk", cup: 227, tbsp: 14.2, tsp: 4.7 },
      { name: "Heavy cream", cup: 227, tbsp: 14.2, tsp: 4.7 },
      { name: "Sour cream / yogurt", cup: 227, tbsp: 14.2, tsp: 4.7 },
      { name: "Cream cheese", cup: 227, tbsp: 14.2, tsp: 4.7 },
      { name: "Ricotta / mascarpone", cup: 227, tbsp: 14.2, tsp: 4.7 },
      { name: "Condensed milk", cup: 312, tbsp: 19.5, tsp: 6.5 },
      { name: "Evaporated milk", cup: 226, tbsp: 14.1, tsp: 4.7 },
      { name: "Coconut milk", cup: 241, tbsp: 15.1, tsp: 5 },
    ],
  },
  {
    label: "Syrups & Liquid Sweeteners",
    entries: [
      { name: "Honey", cup: 336, tbsp: 21, tsp: 7 },
      { name: "Maple syrup", cup: 312, tbsp: 19.5, tsp: 6.5 },
      { name: "Molasses", cup: 340, tbsp: 21.25, tsp: 7.1 },
      { name: "Corn syrup", cup: 312, tbsp: 19.5, tsp: 6.5 },
      { name: "Agave syrup", cup: 336, tbsp: 21, tsp: 7 },
    ],
  },
  {
    label: "Chocolate & Cocoa",
    entries: [
      { name: "Cocoa powder", cup: 84, tbsp: 5.25, tsp: 1.75 },
      { name: "Chocolate chips", cup: 170, tbsp: 10.6, tsp: 3.5 },
      { name: "Mini chocolate chips", cup: 177, tbsp: 11.1, tsp: 3.7 },
    ],
  },
  {
    label: "Oats & Grains",
    entries: [
      { name: "Rolled oats (old-fashioned)", cup: 89, tbsp: 5.6, tsp: 1.9 },
      { name: "Quick oats", cup: 89, tbsp: 5.6, tsp: 1.9 },
      { name: "Steel-cut oats", cup: 140, tbsp: 8.75, tsp: 2.9 },
      { name: "Breadcrumbs (dried)", cup: 112, tbsp: 7, tsp: 2.3 },
      { name: "Panko", cup: 50, tbsp: 3.1, tsp: 1 },
      { name: "White rice (dry)", cup: 198, tbsp: 12.4, tsp: 4.1 },
      { name: "Quinoa (dry)", cup: 177, tbsp: 11.1, tsp: 3.7 },
      { name: "Chia seeds", cup: 148, tbsp: 9.25, tsp: 3.1 },
      { name: "Flaxseed", cup: 140, tbsp: 8.75, tsp: 2.9 },
      { name: "Sesame seeds", cup: 142, tbsp: 8.9, tsp: 3 },
    ],
  },
  {
    label: "Nuts",
    entries: [
      { name: "Almonds (whole)", cup: 142, tbsp: 8.9, tsp: 3 },
      { name: "Walnuts (chopped)", cup: 113, tbsp: 7.1, tsp: 2.4 },
      { name: "Pecans (chopped)", cup: 105, tbsp: 6.6, tsp: 2.2 },
      { name: "Hazelnuts", cup: 142, tbsp: 8.9, tsp: 3 },
      { name: "Cashews", cup: 113, tbsp: 7.1, tsp: 2.4 },
      { name: "Pistachios", cup: 120, tbsp: 7.5, tsp: 2.5 },
    ],
  },
  {
    label: "Dried Fruit",
    entries: [
      { name: "Raisins", cup: 149, tbsp: 9.3, tsp: 3.1 },
      { name: "Dried cranberries", cup: 114, tbsp: 7.1, tsp: 2.4 },
      { name: "Dried apricots", cup: 128, tbsp: 8, tsp: 2.7 },
      { name: "Dates", cup: 149, tbsp: 9.3, tsp: 3.1 },
    ],
  },
  {
    label: "Leaveners & Spices",
    entries: [
      { name: "Baking powder", cup: null, tbsp: 12, tsp: 4 },
      { name: "Baking soda", cup: null, tbsp: 18, tsp: 6 },
      { name: "Table salt", cup: null, tbsp: 18, tsp: 6 },
      { name: "Kosher salt (Diamond Crystal)", cup: null, tbsp: 12, tsp: 4 },
      { name: "Instant yeast", cup: null, tbsp: 9, tsp: 3 },
      { name: "Cinnamon", cup: null, tbsp: 8, tsp: 2.7 },
      { name: "Cumin", cup: null, tbsp: 6, tsp: 2 },
      { name: "Black pepper", cup: null, tbsp: 6, tsp: 2 },
      { name: "Paprika", cup: null, tbsp: 7, tsp: 2.3 },
      { name: "Espresso powder", cup: null, tbsp: 7, tsp: 2.3 },
      { name: "Matcha powder", cup: null, tbsp: 6, tsp: 2 },
    ],
  },
];

export const BUILTIN_SUBSTITUTIONS = [
  {
    ingredient: "Allspice (1 tsp)",
    substitute: "½ tsp cinnamon + ¼ tsp ginger + ¼ tsp cloves",
    notes: null,
  },
  {
    ingredient: "Baking powder (1 tsp)",
    substitute: "¼ tsp baking soda + ½ tsp cream of tartar",
    notes: null,
  },
  {
    ingredient: "Baking soda (1 tsp)",
    substitute: "4 tsp baking powder",
    notes: "Only if the recipe has no acidic ingredients like buttermilk, yogurt, or citrus juice",
  },
  {
    ingredient: "Beer (1 cup)",
    substitute: "1 cup chicken or beef broth, or 1 cup nonalcoholic beer",
    notes: null,
  },
  {
    ingredient: "Bread crumbs (1 cup)",
    substitute: "1 cup cracker crumbs, matzo meal, or ground oats",
    notes: null,
  },
  {
    ingredient: "Bread flour (1 cup)",
    substitute: "1 cup all-purpose flour + 1 tsp vital wheat gluten",
    notes: null,
  },
  {
    ingredient: "Broth or stock (1 cup)",
    substitute: "1 bouillon cube dissolved in 1 cup boiling water",
    notes: null,
  },
  {
    ingredient: "Brown sugar (1 cup)",
    substitute: "1 cup granulated sugar + 1 tbsp molasses",
    notes: "For dark brown sugar, use 2 tbsp molasses",
  },
  {
    ingredient: "Butter, salted (1 cup)",
    substitute: "⅞ cup vegetable oil + ½ tsp salt, or 1 cup shortening + ½ tsp salt",
    notes: null,
  },
  {
    ingredient: "Butter, unsalted (1 cup)",
    substitute: "1 cup salted butter — reduce added salt by ½ tsp",
    notes: null,
  },
  {
    ingredient: "Buttermilk (1 cup)",
    substitute: "1 cup milk + 1 tbsp lemon juice or white vinegar",
    notes: "Let sit 5 minutes until slightly curdled before using",
  },
  {
    ingredient: "Cake flour (1 cup)",
    substitute: "1 cup all-purpose flour minus 2 tbsp, plus 2 tbsp cornstarch",
    notes: "Sift together well",
  },
  {
    ingredient: "Chocolate, semisweet (1 oz)",
    substitute: "1 oz unsweetened chocolate + 4 tsp granulated sugar",
    notes: null,
  },
  {
    ingredient: "Chocolate, unsweetened (1 oz)",
    substitute: "3 tbsp unsweetened cocoa powder + 1 tbsp vegetable oil or shortening",
    notes: null,
  },
  {
    ingredient: "Cocoa powder — natural vs. dutch-process",
    substitute: "Swap 1:1 in most recipes",
    notes: "Add ⅛ tsp baking soda per 3 tbsp when using natural in place of dutch-process",
  },
  {
    ingredient: "Corn syrup (1 cup)",
    substitute: "1¼ cup granulated sugar + ⅓ cup water, or 1 cup honey",
    notes: null,
  },
  {
    ingredient: "Cornstarch as thickener (1 tbsp)",
    substitute: "2 tbsp all-purpose flour",
    notes: "Flour needs longer cooking to lose raw taste",
  },
  {
    ingredient: "Cream, half and half (1 cup)",
    substitute: "⅞ cup milk + 1 tbsp butter",
    notes: null,
  },
  {
    ingredient: "Cream of tartar (½ tsp)",
    substitute: "1½ tsp lemon juice or white vinegar",
    notes: "Use when stabilizing egg whites or preventing sugar crystallization",
  },
  {
    ingredient: "Crème fraîche (1 cup)",
    substitute: "1 cup heavy cream + 1 tbsp plain yogurt, stirred together",
    notes: "Let stand at room temperature for 6 hours until thickened",
  },
  {
    ingredient: "Egg (1 large)",
    substitute: "3 tbsp aquafaba, or 1 tbsp ground flaxseed + 3 tbsp water",
    notes: "Flax egg: let sit 5 minutes. Good in muffins, quick breads, cookies",
  },
  {
    ingredient: "Fats for baking (1 cup)",
    substitute: "1 cup unsweetened applesauce or fruit purée",
    notes: "Reduces fat; may make baked goods denser and more moist",
  },
  {
    ingredient: "Garlic (1 clove)",
    substitute: "⅛ tsp garlic powder, or ½ tsp granulated garlic",
    notes: null,
  },
  {
    ingredient: "Gelatin (1 tbsp granulated)",
    substitute: "2 tsp agar-agar",
    notes: "Agar sets firmer than gelatin and works at room temperature",
  },
  {
    ingredient: "Ginger, fresh (1 tsp minced)",
    substitute: "½ tsp ground dried ginger",
    notes: null,
  },
  {
    ingredient: "Ginger, ground (1 tsp)",
    substitute: "2 tsp fresh minced ginger",
    notes: null,
  },
  {
    ingredient: "Heavy cream (1 cup, for cooking)",
    substitute: "⅔ cup whole milk + ⅓ cup melted butter",
    notes: "Won't whip; good for sauces and baking",
  },
  {
    ingredient: "Herbs, fresh (1 tbsp chopped)",
    substitute: "1 tsp dried herbs (crumbled)",
    notes: null,
  },
  {
    ingredient: "Honey (1 cup)",
    substitute: "1¼ cup granulated sugar + ¼ cup water",
    notes: "Reduce oven temp by 25°F; expect slightly different texture",
  },
  {
    ingredient: "Hot pepper sauce (1 tsp)",
    substitute: "¾ tsp cayenne pepper + 1 tsp vinegar",
    notes: null,
  },
  {
    ingredient: "Lard (1 cup)",
    substitute: "1 cup shortening, or 1 cup butter",
    notes: null,
  },
  {
    ingredient: "Lemon juice (1 tsp)",
    substitute: "1 tsp lime juice, or ½ tsp white vinegar",
    notes: null,
  },
  {
    ingredient: "Lemon zest (1 tsp)",
    substitute: "½ tsp lemon extract, or 2 tbsp fresh lemon juice",
    notes: null,
  },
  {
    ingredient: "Mace (1 tsp)",
    substitute: "1 tsp nutmeg",
    notes: null,
  },
  {
    ingredient: "Mayonnaise (1 cup)",
    substitute: "1 cup sour cream or 1 cup plain yogurt",
    notes: null,
  },
  {
    ingredient: "Molasses (1 cup)",
    substitute: "¾ cup brown sugar + 1 tsp cream of tartar",
    notes: null,
  },
  {
    ingredient: "Mustard, prepared (1 tbsp)",
    substitute: "1 tbsp dry mustard + 1 tsp water + 1 tsp vinegar + 1 tsp sugar, mixed",
    notes: null,
  },
  {
    ingredient: "Powdered sugar (1 cup)",
    substitute: "1 cup granulated sugar + 1 tbsp cornstarch, blended until fine",
    notes: null,
  },
  {
    ingredient: "Ricotta (1 cup)",
    substitute: "1 cup dry cottage cheese, or 1 cup silken tofu (blended smooth)",
    notes: null,
  },
  {
    ingredient: "Saffron (¼ tsp)",
    substitute: "¼ tsp turmeric",
    notes: "Adds color but a different flavor; works best in savory dishes",
  },
  {
    ingredient: "Self-rising flour (1 cup)",
    substitute: "1 cup all-purpose flour + 1½ tsp baking powder + ¼ tsp salt",
    notes: null,
  },
  {
    ingredient: "Shortening (1 cup)",
    substitute: "1 cup butter (reduce added salt in recipe by ½ tsp)",
    notes: null,
  },
  {
    ingredient: "Sour cream (1 cup)",
    substitute: "1 cup plain full-fat yogurt",
    notes: "Works well in baked goods, dips, and sauces",
  },
  {
    ingredient: "Soy sauce (½ cup)",
    substitute: "¼ cup Worcestershire sauce mixed with 1 tbsp water",
    notes: null,
  },
  {
    ingredient: "Sweetened condensed milk (14 oz can)",
    substitute: "¾ cup white sugar + ½ cup water + 1⅛ cups dry powdered milk",
    notes: "Combine and cook over medium heat, stirring, until thickened (~20 min)",
  },
  {
    ingredient: "Vanilla extract (1 tsp)",
    substitute: "½ tsp vanilla bean paste, or seeds from ½ vanilla bean",
    notes: "Or 1 tsp vanilla powder",
  },
  {
    ingredient: "Vegetable oil (1 cup)",
    substitute: "1 cup melted butter or melted coconut oil",
    notes: "Butter adds richness; coconut oil may add subtle flavor",
  },
  {
    ingredient: "White sugar (1 cup)",
    substitute: "1 cup brown sugar, or ¾ cup honey (reduce liquid in recipe by ¼ cup)",
    notes: null,
  },
  {
    ingredient: "Whole milk (1 cup)",
    substitute: "½ cup evaporated milk + ½ cup water, or any non-dairy milk 1:1",
    notes: null,
  },
  {
    ingredient: "Wine (1 cup)",
    substitute: "1 cup chicken or beef broth, or 1 cup fruit juice + 2 tsp vinegar",
    notes: null,
  },
  {
    ingredient: "Yeast, active dry (1 packet / 2¼ tsp)",
    substitute: "2¼ tsp instant or rapid-rise yeast",
    notes: "Instant yeast can be mixed directly into dry ingredients without proofing",
  },
  {
    ingredient: "Yogurt (1 cup)",
    substitute: "1 cup sour cream or 1 cup buttermilk",
    notes: null,
  },
];
