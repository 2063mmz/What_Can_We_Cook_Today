/**
 * English dictionary — the source of truth.
 *
 * Every visible interface string lives here. Components must never contain a
 * hard-coded user-facing string. Adding a language means adding one file that
 * satisfies the `Dictionary` type derived from this object.
 *
 * Placeholders use {braces} and are filled by `t(key, { name: value })`.
 */
export const en = {
  /* --- Brand & navigation ------------------------------------------------- */
  'brand.title': 'What Can We Cook Today',
  'brand.tagline': 'See what you have. Pick what you can cook.',
  'nav.label': 'Main',
  'nav.tonight': 'Cook Today',
  'nav.recipes': 'My Recipes',
  'nav.add': 'Add Recipe',
  'nav.inspiration': 'Inspiration',
  'lang.label': 'Language',

  /* --- Shared vocabulary --------------------------------------------------- */
  'common.cancel': 'Cancel',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.view': 'View',
  'common.back': 'Back',
  'common.all': 'All',
  'common.optional': 'Optional',
  'common.loading': 'Loading…',
  'common.retry': 'Try again',
  'common.minutes': '{count} min',
  'common.hoursMinutes': '{hours} h {minutes}',
  'common.hours': '{hours} h',
  'common.noTime': 'Time not set',

  /* --- Categories ---------------------------------------------------------- */
  'category.main': 'Main',
  'category.appetizer': 'Appetizer',
  'category.salad': 'Salad',
  'category.soup': 'Soup',
  'category.dessert': 'Dessert',
  'category.snack': 'Snack',
  'category.other': 'Other',

  /* --- Occasions ----------------------------------------------------------- */
  'occasion.weekday_quick': 'Quick weekday meal',
  'occasion.normal': 'Normal dinner',
  'occasion.formal': 'Formal dinner',
  'occasion.weekend': 'Weekend',
  'occasion.short.weekday_quick': 'Quick',
  'occasion.short.normal': 'Normal',
  'occasion.short.formal': 'Proper dinner',
  'occasion.short.weekend': 'Weekend',

  /* --- Cuisine ------------------------------------------------------------- */
  'cuisine.label': 'Cuisine',
  'cuisine.home': 'Home cooking',
  'cuisine.country': 'From a country',
  'cuisine.pickCountry': 'Choose a country',

  /* --- Tonight ------------------------------------------------------------- */
  'tonight.q1.title': "What's in your kitchen?",
  'tonight.q1.hint': 'Tap what you have. Skip this if you want anything.',
  'tonight.q1.add': 'Add another ingredient',
  'tonight.q1.addPlaceholder': 'e.g. mushrooms',
  'tonight.q1.addSubmit': 'Add',
  'tonight.q1.clear': 'Clear selection',
  'tonight.q1.selected': '{count} selected',
  'tonight.q1.empty':
    'This list fills itself from the ingredients in your recipes.',
  'tonight.q1.showMore': 'Show all {count} ingredients',
  'tonight.q1.showLess': 'Show fewer',

  'tonight.q2.title': 'How much time?',
  'tonight.q2.noLimit': 'No limit',

  'tonight.q3.title': 'Tonight feels like…',

  'tonight.cta': 'Pick for me',
  'tonight.rolling': 'Choosing…',
  'tonight.poolSize': '{count} recipes fit right now',
  'tonight.poolSizeOne': '1 recipe fits right now',

  'tonight.result.prefix': 'Tonight',
  'tonight.result.keep': "That's it",
  'tonight.result.again': 'Roll again',
  'tonight.result.onlyOne': 'The only one that fits tonight.',

  'tonight.groups.ready': 'Ready to cook',
  'tonight.groups.almost': 'Almost there',
  'tonight.groups.readyHint': 'You have every main ingredient.',
  'tonight.groups.almostHint': 'A short shopping list away.',
  'tonight.missing': 'Missing',
  'tonight.match': '{percent}% match',
  'tonight.matchFull': 'Everything you need',
  'tonight.candidates': 'What it picked from',

  'tonight.menu.title': "Tonight's menu",
  'tonight.menu.starter': 'Starter',
  'tonight.menu.main': 'Main',
  'tonight.menu.dessert': 'Dessert',
  'tonight.menu.total': 'Estimated total time: {time}',
  'tonight.menu.mainOnly': 'Just the main course',
  'tonight.menu.full': 'Make it a full menu',

  'tonight.empty.title': 'Nothing fits perfectly tonight.',
  'tonight.empty.playful': 'Your fridge is being a little difficult today.',
  'tonight.empty.showAlmost': 'Show recipes missing one or two things',
  'tonight.empty.relaxTime': 'Ignore the time limit',
  'tonight.empty.relaxOccasion': 'Allow any kind of dinner',
  'tonight.empty.relaxIngredients': 'Ignore what I have',
  'tonight.empty.inspiration': 'Find inspiration',
  'tonight.empty.reasonTime': '{count} ruled out by the time limit.',
  'tonight.empty.reasonOccasion': '{count} ruled out by the kind of dinner.',
  'tonight.empty.reasonIngredients': '{count} ruled out by missing ingredients.',

  'tonight.noRecipes.title': 'Your recipe book is still empty.',
  'tonight.noRecipes.body':
    'Add a few dishes you actually cook, and this page will start deciding for you.',
  'tonight.noRecipes.create': 'Create my first recipe',
  'tonight.noRecipes.inspiration': 'Find inspiration',

  /* --- My Recipes ---------------------------------------------------------- */
  'recipes.title': 'My Recipes',
  'recipes.search': 'Search recipes',
  'recipes.searchPlaceholder': 'Search by name or ingredient',
  'recipes.filterCategory': 'Category',
  'recipes.filterOccasion': 'Occasion',
  'recipes.count': '{count} recipes',
  'recipes.countOne': '1 recipe',
  'recipes.exportAll': 'Export all recipes',
  'recipes.exportAllJson': 'Backup as JSON',
  'recipes.exportOne': 'Export as Markdown',
  'recipes.import': 'Import Markdown',
  'recipes.new': 'Add a recipe',
  'recipes.deleteConfirm': 'Delete “{name}”? This cannot be undone.',
  'recipes.deleted': '“{name}” was deleted.',
  'recipes.emptyFiltered': 'No recipe matches those filters.',
  'recipes.clearFilters': 'Clear filters',

  /* --- Recipe detail ------------------------------------------------------- */
  'detail.ingredients': 'Ingredients',
  'detail.seasonings': 'Seasonings',
  'detail.instructions': 'Instructions',
  'detail.notes': 'Notes',
  'detail.empty': 'Nothing written here yet.',
  'detail.notFound': 'That recipe is no longer in your book.',
  'detail.added': 'Added {date}',

  /* --- Recipe form --------------------------------------------------------- */
  'form.createTitle': 'Add a recipe',
  'form.editTitle': 'Edit recipe',
  'form.name': 'Recipe name',
  'form.namePlaceholder': 'Tomato and egg',
  'form.emoji': 'Icon',
  'form.category': 'Category',
  'form.occasion': 'When would you cook it?',
  'form.ingredients': 'Ingredients',
  'form.ingredientsHint':
    'Mark an ingredient optional when the dish still works without it.',
  'form.ingredientPlaceholder': 'Ingredient',
  'form.quantityPlaceholder': 'Amount',
  'form.addIngredient': 'Add ingredient',
  'form.removeIngredient': 'Remove ingredient {name}',
  'form.markOptional': 'Mark {name} as optional',
  'form.seasonings': 'Seasonings',
  'form.seasoningsHint': 'Salt, pepper, soy sauce… these never block a match.',
  'form.seasoningPlaceholder': 'Seasoning',
  'form.addSeasoning': 'Add seasoning',
  'form.removeSeasoning': 'Remove seasoning {name}',
  'form.duration': 'How long does it take?',
  'form.durationCustom': 'Custom',
  'form.durationCustomLabel': 'Minutes',
  'form.instructions': 'Instructions',
  'form.instructionsPlaceholder': 'One step per line.',
  'form.notes': 'Notes',
  'form.notesPlaceholder': 'Tastes better the next day…',
  'form.submitCreate': 'Create recipe',
  'form.submitUpdate': 'Update recipe',
  'form.submitConfirm': 'Confirm and save',
  'form.errorName': 'Please give this recipe a name.',
  'form.errorIngredients': 'Add at least one ingredient.',
  'form.errorDuration': 'Enter the time in minutes.',
  'form.errorCountry': 'Choose a country, or switch to home cooking.',
  'form.errorSummary': 'Please fix the highlighted fields.',
  'form.optionalToggle': 'optional',
  'form.requiredToggle': 'required',

  /* --- Import -------------------------------------------------------------- */
  'import.title': 'Import Markdown',
  'import.subtitle':
    'Bring in a recipe file exported from here, or one you wrote yourself.',
  'import.drop': 'Drop a .md file here',
  'import.or': 'or',
  'import.choose': 'Choose a file',
  'import.foundOne': 'Found 1 recipe. Check it before saving.',
  'import.foundMany': 'Found {count} recipes. Check each one before saving.',
  'import.reviewing': 'Recipe {index} of {total}',
  'import.skip': 'Skip this one',
  'import.finished': '{count} recipes added to your book.',
  'import.finishedOne': '1 recipe added to your book.',
  'import.errorEmpty': 'No recipe could be read from this file.',
  'import.errorRead': 'That file could not be read.',
  'import.errorType': 'Please choose a .md or .json file.',
  'import.partial':
    'Some fields could not be read. They are empty below — please check them.',
  'import.nothingSaved': 'Nothing was imported.',
  'import.formatTitle': 'The Markdown format',
  'import.formatIntro':
    'Files exported from here look like this. Anything you write in the same shape can be imported.',
  'import.formatNote':
    'Unknown fields are ignored, and missing fields are simply left empty for you to fill in.',

  /* --- Export -------------------------------------------------------------- */
  'export.downloaded': 'Downloaded {file}',
  'export.nothing': 'There is nothing to export yet.',

  /* --- Inspiration --------------------------------------------------------- */
  'inspiration.title': 'Inspiration',
  'inspiration.subtitle': 'Spin through thousands of open recipes, then keep one only if you want to.',
  'inspiration.credit': 'Open recipes are provided by Wikibooks; recipe titles are translated by MyMemory.',
  'inspiration.filterIngredient': 'Dish or keyword',
  'inspiration.filterIngredientPlaceholder': 'e.g. chicken, soup or 宫保鸡丁',
  'inspiration.filterCuisine': 'Recipe source',
  'inspiration.filterCategory': 'Category',
  'inspiration.any': 'Anything',
  'inspiration.cta': 'Surprise me',
  'inspiration.another': 'Another one',
  'inspiration.rolling': 'Looking around…',
  'inspiration.view': 'View recipe',
  'inspiration.hide': 'Hide details',
  'inspiration.addToMine': 'Add to my recipes',
  'inspiration.sourceLink': 'Open the original',
  'inspiration.video': 'Watch the video',
  'inspiration.noDuration': 'This source does not provide a cooking time.',
  'inspiration.noDurationForm':
    'Wikibooks may not provide a cooking time, so this field is empty — add your own estimate.',
  'inspiration.error': 'Could not reach Wikibooks. Check your connection.',
  'inspiration.empty': 'Nothing at this source matches those filters.',
  'inspiration.emptyHint': 'Try removing one filter.',
  'inspiration.localNote':
    'Your own recipes work offline. Only this page needs a connection.',
  'inspiration.addNote':
    'The spin does not save anything. If you choose to add it, review the original-language recipe first.',

  /* --- Privacy ------------------------------------------------------------- */
  'privacy.title': 'Where your recipes live',
  'privacy.body1':
    'Your personal recipes are stored only in this browser by default.',
  'privacy.body2':
    'Clearing browser data, private windows, or switching devices can remove them.',
  'privacy.body3':
    'Export all recipes now and then so you have a backup you control.',
  'privacy.body4': 'Nothing is ever uploaded to a server.',
  'privacy.link': 'About your data',

  /* --- Errors & misc ------------------------------------------------------- */
  'error.storage':
    'Your recipes could not be saved in this browser. Private browsing can cause this.',
  'error.notFound': 'That page does not exist.',
  'error.backHome': 'Back to today’s choices',
  'footer.note': 'You know how to make lots of dishes. Pick one.',
} as const;
