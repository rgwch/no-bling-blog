import { addMessages, init, locale } from 'svelte-i18n';

import en from './en.json'
import de from './de.json'
import fr from './fr.json'

addMessages('en', en);
addMessages('de', de);
addMessages('fr', fr);

init({
    fallbackLocale: 'en',
    initialLocale: 'de'
})

// To change the locale for testing:
// locale.set('fr') 

