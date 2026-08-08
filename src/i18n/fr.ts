import type { Dictionary } from './types';

/** Français */
export const fr: Dictionary = {
  /* --- Brand & navigation ------------------------------------------------- */
  'brand.title': 'On cuisine quoi aujourd’hui',
  'brand.tagline': 'Regarde ce que tu as, puis choisis ce que tu veux cuisiner.',
  'nav.label': 'Navigation principale',
  'nav.tonight': 'Cuisiner aujourd’hui',
  'nav.recipes': 'Mes recettes',
  'nav.add': 'Ajouter une recette',
  'nav.inspiration': 'Inspiration',
  'lang.label': 'Langue',

  /* --- Shared vocabulary --------------------------------------------------- */
  'common.cancel': 'Annuler',
  'common.edit': 'Modifier',
  'common.delete': 'Supprimer',
  'common.view': 'Voir',
  'common.back': 'Retour',
  'common.all': 'Tout',
  'common.optional': 'Facultatif',
  'common.loading': 'Chargement…',
  'common.retry': 'Réessayer',
  'common.minutes': '{count} min',
  'common.hoursMinutes': '{hours} h {minutes}',
  'common.hours': '{hours} h',
  'common.noTime': 'Durée non renseignée',

  /* --- Categories ---------------------------------------------------------- */
  'category.main': 'Plat',
  'category.appetizer': 'Entrée',
  'category.salad': 'Salade',
  'category.soup': 'Soupe',
  'category.dessert': 'Dessert',
  'category.snack': 'En-cas',
  'category.other': 'Autre',

  /* --- Occasions ----------------------------------------------------------- */
  'occasion.weekday_quick': 'Repas rapide en semaine',
  'occasion.normal': 'Dîner normal',
  'occasion.formal': 'Dîner soigné',
  'occasion.weekend': 'Week-end',
  'occasion.short.weekday_quick': 'Rapide',
  'occasion.short.normal': 'Normal',
  'occasion.short.formal': 'Vrai dîner',
  'occasion.short.weekend': 'Week-end',

  /* --- Cuisine ------------------------------------------------------------- */
  'cuisine.label': 'Cuisine',
  'cuisine.home': 'Cuisine maison',
  'cuisine.country': 'D’un pays',
  'cuisine.pickCountry': 'Choisir un pays',

  /* --- Tonight ------------------------------------------------------------- */
  'tonight.q1.title': 'Qu’est-ce que tu as dans la cuisine ?',
  'tonight.q1.hint': 'Sélectionne ce que tu as. Tu peux aussi ne rien choisir.',
  'tonight.q1.add': 'Ajouter un autre ingrédient',
  'tonight.q1.addPlaceholder': 'ex. champignons',
  'tonight.q1.addSubmit': 'Ajouter',
  'tonight.q1.clear': 'Tout désélectionner',
  'tonight.q1.selected': '{count} sélectionnés',
  'tonight.q1.empty':
    'Cette liste se remplit toute seule avec les ingrédients de tes recettes.',
  'tonight.q1.showMore': 'Voir les {count} ingrédients',
  'tonight.q1.showLess': 'Voir moins',

  'tonight.q2.title': 'Tu as combien de temps ?',
  'tonight.q2.noLimit': 'Sans limite',

  'tonight.q3.title': 'Ce soir, ce serait plutôt…',

  'tonight.cta': 'Choisis pour moi',
  'tonight.rolling': 'On choisit…',
  'tonight.poolSize': '{count} recettes conviennent',
  'tonight.poolSizeOne': '1 recette convient',

  'tonight.result.prefix': 'Ce soir',
  'tonight.result.keep': 'C’est parti',
  'tonight.result.again': 'Encore une fois',
  'tonight.result.onlyOne': 'La seule qui convienne ce soir.',

  'tonight.groups.ready': 'Prêt à cuisiner',
  'tonight.groups.almost': 'Presque',
  'tonight.groups.readyHint': 'Tu as tous les ingrédients principaux.',
  'tonight.groups.almostHint': 'Une toute petite course et c’est bon.',
  'tonight.missing': 'Il manque',
  'tonight.match': '{percent}% des ingrédients',
  'tonight.matchFull': 'Tout y est',
  'tonight.candidates': 'Le choix s’est fait parmi',

  'tonight.menu.title': 'Le menu de ce soir',
  'tonight.menu.starter': 'Entrée',
  'tonight.menu.main': 'Plat',
  'tonight.menu.dessert': 'Dessert',
  'tonight.menu.total': 'Temps total estimé : {time}',
  'tonight.menu.mainOnly': 'Seulement le plat',
  'tonight.menu.full': 'Faire un menu complet',

  'tonight.empty.title': 'Rien ne convient vraiment ce soir.',
  'tonight.empty.playful': 'Ton frigo fait des difficultés aujourd’hui.',
  'tonight.empty.showAlmost': 'Voir les recettes où il manque une chose ou deux',
  'tonight.empty.relaxTime': 'Ignorer la limite de temps',
  'tonight.empty.relaxOccasion': 'Accepter n’importe quel type de dîner',
  'tonight.empty.relaxIngredients': 'Ignorer ce que j’ai',
  'tonight.empty.inspiration': 'Chercher l’inspiration',
  'tonight.empty.reasonTime': '{count} écartées par la limite de temps.',
  'tonight.empty.reasonOccasion': '{count} écartées par le type de dîner.',
  'tonight.empty.reasonIngredients': '{count} écartées faute d’ingrédients.',

  'tonight.noRecipes.title': 'Ton carnet de recettes est encore vide.',
  'tonight.noRecipes.body':
    'Ajoute quelques plats que tu cuisines vraiment, et cette page choisira pour toi.',
  'tonight.noRecipes.create': 'Créer ma première recette',
  'tonight.noRecipes.inspiration': 'Chercher l’inspiration',

  /* --- My Recipes ---------------------------------------------------------- */
  'recipes.title': 'Mes recettes',
  'recipes.search': 'Rechercher',
  'recipes.searchPlaceholder': 'Par nom ou par ingrédient',
  'recipes.filterCategory': 'Catégorie',
  'recipes.filterOccasion': 'Occasion',
  'recipes.count': '{count} recettes',
  'recipes.countOne': '1 recette',
  'recipes.exportAll': 'Exporter toutes les recettes',
  'recipes.exportAllJson': 'Sauvegarde JSON',
  'recipes.exportOne': 'Exporter en Markdown',
  'recipes.import': 'Importer du Markdown',
  'recipes.new': 'Ajouter une recette',
  'recipes.deleteConfirm': 'Supprimer « {name} » ? C’est définitif.',
  'recipes.deleted': '« {name} » a été supprimée.',
  'recipes.emptyFiltered': 'Aucune recette ne correspond à ces filtres.',
  'recipes.clearFilters': 'Effacer les filtres',

  /* --- Recipe detail ------------------------------------------------------- */
  'detail.ingredients': 'Ingrédients',
  'detail.seasonings': 'Assaisonnements',
  'detail.instructions': 'Préparation',
  'detail.notes': 'Notes',
  'detail.empty': 'Rien d’écrit ici pour l’instant.',
  'detail.notFound': 'Cette recette n’est plus dans ton carnet.',
  'detail.added': 'Ajoutée le {date}',

  /* --- Recipe form --------------------------------------------------------- */
  'form.createTitle': 'Ajouter une recette',
  'form.editTitle': 'Modifier la recette',
  'form.name': 'Nom de la recette',
  'form.namePlaceholder': 'Tomates aux œufs',
  'form.emoji': 'Icône',
  'form.category': 'Catégorie',
  'form.occasion': 'Tu la cuisinerais quand ?',
  'form.ingredients': 'Ingrédients',
  'form.ingredientsHint':
    'Marquez un ingrédient comme facultatif si le plat marche sans.',
  'form.ingredientPlaceholder': 'Ingrédient',
  'form.quantityPlaceholder': 'Quantité',
  'form.addIngredient': 'Ajouter un ingrédient',
  'form.removeIngredient': 'Retirer l’ingrédient {name}',
  'form.markOptional': 'Marquer {name} comme facultatif',
  'form.seasonings': 'Assaisonnements',
  'form.seasoningsHint':
    'Sel, poivre, sauce soja… ils ne bloquent jamais une recette.',
  'form.seasoningPlaceholder': 'Assaisonnement',
  'form.addSeasoning': 'Ajouter un assaisonnement',
  'form.removeSeasoning': 'Retirer l’assaisonnement {name}',
  'form.duration': 'Combien de temps faut-il ?',
  'form.durationCustom': 'Autre',
  'form.durationCustomLabel': 'Minutes',
  'form.instructions': 'Préparation',
  'form.instructionsPlaceholder': 'Une étape par ligne.',
  'form.notes': 'Notes',
  'form.notesPlaceholder': 'Encore meilleur le lendemain…',
  'form.submitCreate': 'Créer la recette',
  'form.submitUpdate': 'Mettre à jour la recette',
  'form.submitConfirm': 'Confirmer et enregistrer',
  'form.errorName': 'Donnez un nom à cette recette.',
  'form.errorIngredients': 'Ajoutez au moins un ingrédient.',
  'form.errorDuration': 'Indiquez la durée en minutes.',
  'form.errorCountry': 'Choisissez un pays, ou passez en cuisine maison.',
  'form.errorSummary': 'Corrigez les champs signalés.',
  'form.optionalToggle': 'facultatif',
  'form.requiredToggle': 'indispensable',

  /* --- Import -------------------------------------------------------------- */
  'import.title': 'Importer du Markdown',
  'import.subtitle':
    'Un fichier exporté d’ici, ou un fichier que tu as écrit toi-même.',
  'import.drop': 'Déposez un fichier .md ici',
  'import.or': 'ou',
  'import.choose': 'Choisir un fichier',
  'import.foundOne': '1 recette trouvée. Vérifiez-la avant d’enregistrer.',
  'import.foundMany':
    '{count} recettes trouvées. Vérifiez chacune avant d’enregistrer.',
  'import.reviewing': 'Recette {index} sur {total}',
  'import.skip': 'Passer celle-ci',
  'import.finished': '{count} recettes ajoutées à ton carnet.',
  'import.finishedOne': '1 recette ajoutée à ton carnet.',
  'import.errorEmpty': 'Aucune recette n’a pu être lue dans ce fichier.',
  'import.errorRead': 'Ce fichier n’a pas pu être lu.',
  'import.errorType': 'Choisissez un fichier .md ou .json.',
  'import.partial':
    'Certains champs n’ont pas pu être lus. Ils sont vides ci-dessous — vérifiez-les.',
  'import.nothingSaved': 'Rien n’a été importé.',
  'import.formatTitle': 'Le format Markdown',
  'import.formatIntro':
    'Les fichiers exportés d’ici ressemblent à ceci. Tout fichier écrit de la même façon peut être importé.',
  'import.formatNote':
    'Les champs inconnus sont ignorés, et les champs manquants restent vides.',

  /* --- Export -------------------------------------------------------------- */
  'export.downloaded': '{file} téléchargé',
  'export.nothing': 'Il n’y a encore rien à exporter.',

  /* --- Inspiration --------------------------------------------------------- */
  'inspiration.title': 'Inspiration',
  'inspiration.subtitle': 'Des milliers de recettes libres dans la machine ; garde celle qui te plaît.',
  'inspiration.credit':
    'Les recettes libres viennent de Wikibooks ; les titres sont traduits par MyMemory.',
  'inspiration.filterIngredient': 'Plat ou mot-clé',
  'inspiration.filterIngredientPlaceholder': 'ex. poulet, soupe ou 宫保鸡丁',
  'inspiration.filterCuisine': 'Source des recettes',
  'inspiration.filterCategory': 'Catégorie',
  'inspiration.any': 'Peu importe',
  'inspiration.cta': 'Surprends-moi',
  'inspiration.another': 'Une autre',
  'inspiration.rolling': 'On regarde…',
  'inspiration.view': 'Voir la recette',
  'inspiration.hide': 'Masquer',
  'inspiration.addToMine': 'Ajouter à mes recettes',
  'inspiration.sourceLink': 'Ouvrir l’original',
  'inspiration.video': 'Voir la vidéo',
  'inspiration.noDuration': 'Cette source ne donne pas de temps de cuisson.',
  'inspiration.noDurationForm':
    'Wikibooks ne donne pas toujours de durée : complète le champ avec ton estimation.',
  'inspiration.error': 'Impossible de joindre Wikibooks. Vérifiez la connexion.',
  'inspiration.empty': 'Rien à cette source ne correspond à ces filtres.',
  'inspiration.emptyHint': 'Essayez d’enlever un filtre.',
  'inspiration.localNote':
    'Tes propres recettes marchent hors ligne. Seule cette page a besoin d’internet.',
  'inspiration.addNote':
    'Le tirage n’enregistre rien. Si tu l’ajoutes, vérifie d’abord la recette dans sa langue d’origine.',

  /* --- Privacy ------------------------------------------------------------- */
  'privacy.title': 'Où vivent tes recettes',
  'privacy.body1':
    'Tes recettes personnelles sont enregistrées uniquement dans ce navigateur.',
  'privacy.body2':
    'Effacer les données du navigateur, la navigation privée ou un changement d’appareil peut les faire disparaître.',
  'privacy.body3':
    'Exporte toutes tes recettes de temps en temps pour avoir une sauvegarde.',
  'privacy.body4': 'Rien n’est jamais envoyé à un serveur.',
  'privacy.link': 'À propos de tes données',

  /* --- Errors & misc ------------------------------------------------------- */
  'error.storage':
    'Tes recettes n’ont pas pu être enregistrées dans ce navigateur. La navigation privée peut en être la cause.',
  'error.notFound': 'Cette page n’existe pas.',
  'error.backHome': 'Retour aux choix du jour',
  'footer.note':
    'En fait, tu sais faire plein de plats. Choisis-en un.',
};
