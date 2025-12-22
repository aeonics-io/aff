import { Page } from 'ae';
import Node from '../../ae/js/Node.js';
import Notify from '../../ae/js/Notify.js';
import Modal from '../../ae/js/Modal.js';
import Ajax from '../../ae/js/Ajax.js';
import Translator, { locales } from '../../ae/js/Translator.js';
import { css, urlValue, safeHtml } from '../../ae/js/ae.js';

css('page.login');

const URL_TO_CHECK = '/api/admin/';
const page = new Page();

Object.assign(page,
{
        async show()
        {
                await locales('default').catch(() => {});

                let _ok, _nok;
                this.grantor = new Promise((ok, nok) => { _ok = ok; _nok = nok; });
                this.grantor.ok = _ok;
                this.grantor.nok = _nok;

                this.dom.classList.add('login');
                document.body.appendChild(this.dom);

                try {
                        await this.check(false);
                        this.dom.remove();
                        this.grantor.ok();
                } catch(e) {
                        this.showList();
                }

                if( urlValue('auth') == 'fail' ) setTimeout(function() { Notify.error(Translator.get('login.failed')); }, 750);

                return this.grantor;
        },

        showList()
        {
                while( this.dom.firstChild ) this.dom.lastChild.remove();
                const self = this;

                Ajax.post('/api/security/providers', {}).then((result) =>
                {
                        if( result.response.length == 0 ) { self.grantor.ok(); return; }
                        if( result.response.length == 1 )
                        {
                                if( result.response[0].url ) { location.href = result.response[0].url; }
                                else { self.showForm(); }
                        }
                        else
                        {
                                const f = Node.form([Node.span(Translator.get("login.provider"))]);
                                this.dom.append(f);
                                for( let i = 0; i < result.response.length; i++ )
                                {
                                        f.append(Node.button({className: 'raised', dataset: {url: result.response[i].url||''}, click: function(e)
                                                {
                                                        e.preventDefault(); e.stopImmediatePropagation();
                                                        if( this.dataset.url ) { location.href = this.dataset.url; }
                                                        else { self.showForm(true); }
                                                }}, safeHtml(result.response[i].name))
                                        );
                                }
                        }
                }, () => { this.dom.classList.remove('wait');  this.grantor.nok("F1"); });
        },

        showForm(showBackButton)
        {
                while( this.dom.firstChild ) this.dom.lastChild.remove();

                const self = this;
                this.dom.append(
                        Node.form(
                        [
                                Node.input({type: 'text', name: 'name', placeholder: Translator.get('login.name'), required: true,
                                        keyup: function(e) { if( e.keyCode == 13 && this.nextSibling.value.length > 0 ) self.login(this.parentNode); }}),
                                Node.input({type: 'password', name: 'password', placeholder: Translator.get('login.password'), required: true,
                                        keyup: function(e) { if( e.keyCode == 13 && this.previousSibling.value.length > 0 ) self.login(this.parentNode); }}),
                                Node.input({type: 'hidden', name: 'validity', value: "604800000"}),
                                Node.input({type: 'hidden', name: 'exclusive', value: "true"}),
                                Node.button({className: 'raised', click: function(e)
                                {
                                        e.preventDefault(); e.stopImmediatePropagation();
                                        if( this.parentNode.elements['name'].value.length > 0 && this.parentNode.elements['password'].value.length > 0 )
                                                self.login(this.parentNode);
                                }}, Translator.get('login.login')),
                                Node.p({className: '', id: 'login_remember', click: function() { this.classList.toggle('selected'); }}, Translator.get('login.remember'))
                        ])
                );

                if( showBackButton )
                {
                        this.dom.lastChild.append(Node.span({className: "back", click: function() { self.showList(); }}, Translator.get('login.back')));
                }
        },

        check(fresh)
        {
                this.dom.classList.add('wait');
                const self = this;

                return new Promise((ok, nok) =>
                {
                        const auth = fresh ? null : localStorage.getItem('token');
                        const data = {data: {topic: 'http', constraints: JSON.stringify({content: {path: URL_TO_CHECK, ip: '#'}})}};
                        if( auth ) data.headers = {Authorization: 'Bearer ' + auth};

                        Ajax.post('/api/security/check', data).then((result) =>
                        {
                                if( result.response.granted )
                                {
                                        if( !fresh && auth )
                                                Ajax.authorization = 'Bearer ' + auth;
                                        self.dom.classList.remove('wait');
                                        ok();
                                }
                                else { self.dom.classList.remove('wait'); nok("F2"); }
                        }, () => { self.dom.classList.remove('wait'); nok("F1"); });
                });
        },

        login(form)
        {
                this.dom.classList.add('wait');
                const self = this;

                Ajax.post('/api/security/login', {data: form}).then((result) =>
                {
                        if( self.dom.querySelector('#login_remember').classList.contains('selected') )
                                localStorage.setItem('token', result.response.token);
                        Ajax.authorization = 'Bearer ' + result.response.token;
                        self.check(true).then(
                                () => { self.dom.classList.remove('wait'); self.dom.remove(); self.grantor.ok();},
                                () => { self.dom.classList.remove('wait'); Ajax.authorization = null; Notify.error(Translator.get('login.failed')); }
                        );
                }, (error) =>
                {
                        self.dom.classList.remove('wait');
                        if( error.status == 422 )
                        {
                                Modal.prompt(Translator.get('login.otp')).then((f) =>
                                {
                                        if( !f.value.value )
                                        {
                                                self.dom.classList.remove('wait');
                                                Notify.error(Translator.get('login.failed'));
                                                return;
                                        }
                                        form.appendChild(Node.input({type: 'hidden', name: 'otp', value: f.value.value}));
                                        self.login(form);
                                }, () =>
                                {
                                        Notify.error(Translator.get('login.failed'));
                                });
                        }
                        else
                        {
                                Notify.error(Translator.get('login.failed'));
                        }
                });
        }
});

export { page as default };
