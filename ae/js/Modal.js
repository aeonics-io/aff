import Node from './Node.js';
import Translator from './Translator.js';
import { loadCss, getConfig } from './ae.js';

let cssLoaded = false;
function ensureCss()
{
        if( cssLoaded ) return Promise.resolve();
        cssLoaded = true;
        const config = getConfig();
        return loadCss(new URL('./css/ae.modal.css', config.corePath));
}

class Modal
{
        static async alert(message)
        {
                        await ensureCss();
                        const p = Modal.custom(
                        [
                                Node.p(message),
                                Node.button({click: function()
                                {
                                        p.ok(0);
                                }}, Translator.get('ok'))
                        ], false);

                        p.dom.classList.add('promptable');
                        return p;
        }

        static async confirm(message, buttons, escapable)
        {
                        await ensureCss();
                        if( !buttons || !Array.isArray(buttons) || buttons.length == 0 )
                                buttons = [Translator.get('ok'), Translator.get('cancel')];

                        let p;
                        const nodes = [ Node.p(message) ];
                        const l = buttons.length - 1;
                        buttons.slice().reverse().forEach((b, i) =>
                        {
                                nodes.push( Node.button({click: function() { p.ok(l - i); }}, typeof b == "string" ? b : b) );
                        });

                        p = Modal.custom(nodes, escapable||false);
                        p.dom.classList.add('promptable');
                        return p;
        }

        static async prompt(message, form)
        {
                        await ensureCss();
                        let p;
                        if( !form || !(form instanceof HTMLElement) )
                                form = Node.form(Node.input({type: 'text', name: 'value', value: ""+(form||""), keydown: function(e) { if( e.keyCode === 13 ) { p.ok(form); e.stopImmediatePropagation(); e.preventDefault(); return false; } }}));

                        p = Modal.custom(
                        [
                                Node.p(message),
                                form,
                                Node.button({click: function() { try { p.nok("canceled"); } catch(x) { } }}, Translator.get('cancel')),
                                Node.button({click: function() { p.ok(form); }}, Translator.get('ok'))
                        ], true);

                        const escHandler = function() { p.nok('escaped') };
                        document.addEventListener("escape", escHandler);
                        const enterHandler = function(e)
                        {
                                e.preventDefault();
                                e.stopImmediatePropagation();
                                p.ok(form);
                                return false;
                        };
                        form.addEventListener("submit", enterHandler);

                        p.finally(() =>
                        {
                                document.removeEventListener('escape', escHandler);
                                form.removeEventListener('enter', enterHandler);
                        }).catch(() => {});

                        p.dom.classList.add('promptable');
                        return p;
        }

        static custom(nodes, escapable)
        {
                        let ok, nok;
                        const p  = new Promise((_ok, _nok) => { ok = _ok; nok = _nok; });
                        p.ok = ok;
                        p.nok = nok;
                        p.dom = Node.div({className: 'modal'}, Node.div(nodes));

                        if( escapable )
                        {
                                p.dom.firstChild.appendChild(Node.aside({className: 'close', click: function() { p.nok("closed"); }}, "&times;"));
                                p._handler_1 = function(){ const n = document.querySelectorAll('body > div.modal'); if( n && p.dom == n[n.length-1] ) p.nok("escaped"); };
                                p._handler_2 = function(e)
                                {
                                        const dialog = p.dom.firstElementChild;
                                        const clickedBackdrop = (e.target === p.dom) && (!dialog || !dialog.contains(e.target));
                                        const clickedDialog = dialog && dialog.contains(e.target);
                                        p.isDownOnBackdrop = clickedBackdrop && !clickedDialog;
                                };
                                p._handler_3 = function(e)
                                {
                                        if( e.target === p.dom && p.isDownOnBackdrop ) p._handler_1();
                                        p.isDownOnBackdrop = false;
                                };
                                document.addEventListener('escape', p._handler_1);
                                document.body.addEventListener('mousedown', p._handler_2);
                                document.body.addEventListener('mouseup', p._handler_3);
                        }

                        document.body.appendChild(p.dom);

                        p.finally(() =>
                        {
                                p.dom.remove();
                                if( p._handler_1 ) document.removeEventListener('escape', p._handler_1);
                                if( p._handler_2 ) document.body.removeEventListener('mousedown', p._handler_2);
                                if( p._handler_3 ) document.body.removeEventListener('mouseup', p._handler_3);
                        }).catch(() => {});

                        return p;
        }
}

export { Modal as default };
