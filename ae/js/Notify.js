import Node from './Node.js';
import { loadCss, getConfig, safeHtml } from './ae.js';

let cssLoaded = false;
function ensureCss()
{
        if( cssLoaded ) return Promise.resolve();
        cssLoaded = true;
        const config = getConfig();
        return loadCss(new URL('./css/ae.notify.css', config.corePath));
}

class Notify
{
        static async info(message) { await Notify.show(message, 'info'); }
        static async warning(message) { await Notify.show(message, 'warning'); }
        static async success(message) { await Notify.show(message, 'success'); }
        static async error(message) { await Notify.show(message, 'error'); }

        static async show(message, level)
        {
                if( !message ) return;
                await ensureCss();
                if( Notify.dom.children.length > 3 ) { console.warn(message); return; }

                let timeout;
                const li = Notify.dom.appendChild(Node.li({
                        className: level||'none',
                        click: function() { this.classList.remove('show'); const self = this; setTimeout(() => { self.remove(); }, 400); },
                        mouseover: function() { clearTimeout(timeout); },
                        mouseout: function() { const self = this; timeout = setTimeout(() => { self.classList.remove('show'); setTimeout(() => { self.remove(); }, 400); }, 3000); }
                        }, safeHtml(message)));
                window.requestAnimationFrame(function() { li.classList.add('show'); });
                li.dispatchEvent(new Event('mouseout'));
        }
}

Notify.dom = document.body.appendChild(Node.ol({id: 'notifyArea'}));

export { Notify as default };
