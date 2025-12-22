const defaultConfig = {
        cacheBust: false,
        corePath: new URL('..', import.meta.url),
        sitePath: new URL('../demo/', import.meta.url),
        coreCss: ['ae.app.css', 'ae.modal.css', 'ae.notify.css']
};

let activeConfig = {...defaultConfig};

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

function setConfig(config = {}) {
        const overrides = {...config};
        const corePath = overrides.corePath ? new URL(overrides.corePath, location.href) : defaultConfig.corePath;
        const sitePath = overrides.sitePath ? new URL(overrides.sitePath, location.href) : defaultConfig.sitePath;

        activeConfig = {
                ...defaultConfig,
                ...overrides,
                corePath,
                sitePath
        };
}

function getConfig() {
        return activeConfig;
}

function cacheBustUrl(url) {
        const href = url instanceof URL ? url : new URL(url, location.href);
        if( !activeConfig.cacheBust ) return href.toString();
        href.searchParams.set('_', Date.now());
        return href.toString();
}

function loadCss(path) {
        const url = cacheBustUrl(path instanceof URL ? path : new URL(path, location.href));
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

export { ready, setConfig, getConfig, cacheBustUrl, loadCss, safeHtml, urlValue };
