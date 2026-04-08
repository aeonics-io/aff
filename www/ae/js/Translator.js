import { Cookie } from './Cookie.js';
import { config } from './ae.js';

const loadedLocales = new Map();
export class Translator
{
	static get locale()
	{
		return (Cookie.get('locale') || navigator.language || navigator.userLanguage || config.defaultLocale || 'en').substring(0,2).toLowerCase();
	}

	static async load(name, base = config.sitePath)
	{
		const locale = Translator.locale;
		const fallback = config.defaultLocale || 'en';
		try
		{
			await Translator._import(name, locale, base);
		}
		catch(e)
		{
			await Translator._import(name, fallback, base);
		}
	}

	static async _import(name, locale, base)
	{
		let path = name;
		if( !path.endsWith('.js') ) path += '.js';
		if( !/^(https?:)?\/\//i.test(path) )
		{
			const href = new URL((base || config.sitePath || location.href) + 'js/locale/' + locale + '/', location.href);
			path = new URL(path, href).href;
		}
		
		if( config.noCache )
			path += '?_', Date.now();
		else if( loadedLocales.has(path) )
			return loadedLocales.get(path);
		
		const p = import(path);
		if( !config.noCache )
			loadedLocales.set(path, p);
		
		const module = await p;
		Translator.append(module.default || {});
		return p;
	}

	static append(translations)
	{
		Translator.cache = Object.assign(Translator.cache, translations);
	}

	static get(key)
	{
		if( !Translator.cache[key] )
		{
			console.warn("Undefined translation of " + key);
			return '';
		}
		let i = 0, a = arguments;
		return Translator.cache[key].replace(/\{\}/g, function() { const v = a[++i]; return (typeof v != 'undefined' && v !== null ? v : ''); });
	}

	static change(locale)
	{
		Cookie.set('locale', (locale || config.defaultLocale || 'en').substring(0,2).toLowerCase());
		location.reload(true);
	}
}

Translator.cache = {};

export async function locale(name, base)
{
	return Translator.load(name, base);
}

export { Translator as default };
