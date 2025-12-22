const defaultConfig = {
        cacheBust: false,
        corePath: new URL('..', import.meta.url).href,
        sitePath: new URL('../demo/', import.meta.url).href,
        coreCss: ['ae.app.css', 'ae.modal.css', 'ae.notify.css']
};

const config = globalThis.config || (globalThis.config = {});
for( const [key, value] of Object.entries(defaultConfig) )
{
        if( !(key in config) ) config[key] = value;
}

const ready = new Promise((resolve) => {
        if( document.readyState === 'interactive' || document.readyState === 'complete' ) {
                resolve();
        } else {
                document.addEventListener('DOMContentLoaded', resolve, {once: true});
        }
});

document.addEventListener('keyup', function(e)
{
        if( e.keyCode == 13 )
        {
                const ev = new Event('enter', {cancelable: true});
                ev.origin = e;
                this.dispatchEvent(ev);
        }
        else if( e.keyCode == 27 )
        {
                const ev = new Event('escape', {cancelable: true});
                ev.origin = e;
                this.dispatchEvent(ev);
        }
        else if( e.keyCode == 46 )
        {
                const ev = new Event('delete', {cancelable: true});
                ev.origin = e;
                this.dispatchEvent(ev);
        }
});

if( typeof Array.prototype.last === 'undefined' ) {
        Object.defineProperty(Array.prototype, 'last', { get: function() { return (this.length > 0 ? this[this.length-1] : null); } });
}

const loadedStyles = new Set();

function resolveBase(root, subpath = '') {
        const base = root || config.sitePath;
        const href = base instanceof URL ? base : new URL(base || location.href, location.href);
        return subpath ? new URL(subpath, href) : href;
}

function cacheBustUrl(url) {
        const href = url instanceof URL ? url : new URL(url, location.href);
        if( !config.cacheBust ) return href.toString();
        href.searchParams.set('_', Date.now());
        return href.toString();
}

function css(path, base = config.sitePath) {
        const cssPath = (typeof path === 'string' && !path.split(/[?#]/)[0].endsWith('.css')) ? `${path}.css` : path;
        const href = cssPath instanceof URL ? cssPath : new URL(cssPath, resolveBase(base, './css/'));
        const url = cacheBustUrl(href);
        if( loadedStyles.has(url) ) return Promise.resolve(document.querySelector(`link[href="${url}"]`));

        return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = url;
                link.addEventListener('load', () => { loadedStyles.add(url); resolve(link); });
                link.addEventListener('error', reject);
                document.head.appendChild(link);
        });
}

function safeHtml(text) {
        if( !text ) return '';
        return text.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
}

function urlValue(key) {
        const params = new URLSearchParams(location.search);
        const value = params.get(key);
        if( value ) return value;
        const hashParams = new URLSearchParams((/\?(.*)/.exec(location.hash || '') || ['', ''])[1] || '');
        return hashParams.get(key);
}

export { ready, config, cacheBustUrl, css, safeHtml, urlValue, resolveBase };
