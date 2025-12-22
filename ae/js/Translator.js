import Cookie from './Cookie.js';
import { cacheBustUrl, getConfig } from './ae.js';

class Translator
{
        static get locale()
        {
                return (Cookie.get('locale') || navigator.language || navigator.userLanguage || 'en').substring(0,2).toLowerCase();
        }

        static async load(name)
        {
                const names = Array.isArray(name) ? name : [name];
                const locale = Translator.locale;
                const fallback = 'en';
                try {
                        await Translator._import(names, locale);
                } catch(e) {
                        await Translator._import(names, fallback);
                }
        }

        static async _import(names, locale)
        {
                const config = getConfig();
                for( const n of names )
                {
                        const url = cacheBustUrl(new URL(`./js/locale/${locale}/${n}.js`, config.sitePath));
                        const module = await import(url);
                        Translator.append(module.default || {});
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

export { Translator as default };
