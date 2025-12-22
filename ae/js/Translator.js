import Cookie from './Cookie.js';
import { cacheBustUrl, resolveBase } from './ae.js';

class Translator
{
        static get locale()
        {
                return (Cookie.get('locale') || navigator.language || navigator.userLanguage || 'en').substring(0,2).toLowerCase();
        }

        static _makeKey(name, locale, baseUrl)
        {
                return `${baseUrl.href}::${locale}::${name}`;
        }

        static async load(name, base)
        {
                const names = Array.isArray(name) ? name : [name];
                const locale = Translator.locale;
                const fallback = 'en';
                try {
                        await Translator._import(names, locale, base);
                } catch(e) {
                        await Translator._import(names, fallback, base);
                }
        }

        static async _import(names, locale, base)
        {
                const baseUrl = resolveBase(base, './js/locale/');
                for( const n of names )
                {
                        const key = Translator._makeKey(n, locale, baseUrl);
                        if( Translator.loaded.has(key) )
                        {
                                continue;
                        }
                        const pending = Translator.loading.get(key);
                        if( pending )
                        {
                                await pending;
                                continue;
                        }
                        const loadPromise = (async () => {
                                const url = cacheBustUrl(new URL(`${locale}/${n}.js`, baseUrl));
                                const module = await import(url);
                                Translator.append(module.default || {});
                                Translator.loaded.add(key);
                        })();

                        Translator.loading.set(key, loadPromise);
                        try {
                                await loadPromise;
                        } finally {
                                Translator.loading.delete(key);
                        }
                }
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
                Cookie.set('language', (locale || 'en').substring(0,2).toLowerCase());
                location.reload(true);
        }
}

Translator.cache = {};
Translator.loaded = new Set();
Translator.loading = new Map();

async function locales(names, base)
{
        return Translator.load(names, base);
}

export { Translator as default, locales };
