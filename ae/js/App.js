import Page from './Page.js';
import Notify from './Notify.js';
import { locales } from './Translator.js';
import { ready, css, cacheBustUrl, resolveBase } from './ae.js';

const { config } = globalThis;

class App
{
        constructor(overrides = {})
        {
                Object.assign(config, overrides);
                App.instance = this;
                this.container = document.body;
                this.current = null;
                this.siteBase = resolveBase(config.sitePath);
                this.pagesBase = new URL('./js/pages/', this.siteBase);
        }

        async setup()
        {
                await ready;
                config.coreCss.forEach((sheet) => css(sheet, config.corePath).catch(() => {}));
                await locales('default').catch(() => {});

                window.addEventListener('hashchange', () => { this.navigate(location.hash || '#'); });
                await this.bootstrapPages();
        }

        async bootstrapPages()
        {
                const hash = location.hash || '#';
                try
                {
                        const login = await this.importPage('login', true);
                        if( login ) await login.show();
                }
                catch(e) { console.warn(e); }

                try
                {
                        const template = await this.importPage('template', true);
                        if( template ) await template.show();
                }
                catch(e) { console.warn(e); }

                await this.navigate(hash);
        }

        setContainer(container)
        {
                this.container = container;
        }

        static setContainer(container)
        {
                if( App.instance ) App.instance.setContainer(container);
        }

        async navigate(hash)
        {
                const name = (/^#([^?]*)/.exec(hash||'#')||['','home'])[1]||'home';
                try {
                        if( this.current ) await this.current.hide();
                        if( this.current && this.current.dom ) this.current.dom.remove();

                        this.container.classList.add('wait');
                        const page = await this.importPage(name);
                        this.current = page;
                        await page.show();
                        this.container.appendChild(page.dom);
                } catch(e) {
                        Notify.error('' + e);
                        console.warn(e);
                } finally {
                        this.container.classList.remove('wait');
                }
        }

        async importPage(name, optional = false)
        {
                try {
                        const url = cacheBustUrl(new URL(`./${name}.js`, this.pagesBase));
                        const module = await import(url);
                        if( module.default instanceof Page ) return module.default;
                        if( typeof module.default === 'function' ) return new module.default();
                        if( module.default ) return Object.assign(new Page(), module.default);
                        throw new Error(`Page "${name}" has no default export`);
                } catch(e) {
                        if( optional ) return null;
                        throw e;
                }
        }
}

export { App as default };
