import { Page, Node, Ajax, Modal, Notify, Translator } from 'core';
import { css, config, locale } from 'core';
css('page.home');
css('ae.tab', config.corePath);
locale('default');

class HomePage extends Page
{
        async show()
        {
                document.getElementById('title').textContent = 'Home';
                document.getElementById('menu').dataset.current = 'home';
                if( this.dom.children.length === 0 ) this.init();
                return Promise.resolve();
        }

        init()
        {
                this.dom.append(
                        Node.h2(Translator.get('home.title')),
                        Node.p(Translator.get('home.text')),

                        Node.div({className: 'tab', dataset: {tab: 1}},
                        [
                                Node.div({click: function(e)
                                {
                                        if( e.target == this || !this.contains(e.target) ) return;
                                        this.parentNode.dataset.tab = Array.from(this.children).indexOf(e.target)+1;
                                        this.parentNode.className = this.parentNode.className;
                                }}, [
                                        Node.span("Modal"),
                                        Node.span("Notify")
                                ]),
                                Node.div([
                                        Node.div([
                                                Node.button({className: 'raised', click: function() { Modal.alert('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'); }}, 'Alert'),
                                                Node.button({className: 'raised', click: function() { Modal.confirm('Lorem ipsum dolor sit amet ?'); }}, 'Confirm'),
                                                Node.button({className: 'raised', click: function() { Modal.prompt('Lorem ipsum dolor sit amet.'); }}, 'Prompt')
                                        ]),
                                        Node.div([
                                                Node.button({className: 'raised', click: function() { Notify.success('Lorem ipsum'); }}, 'Success'),
                                                Node.button({className: 'raised', click: function() { Notify.warning('Lorem ipsum'); }}, 'Warning'),
                                                Node.button({className: 'raised', click: function() { Notify.error('Lorem ipsum'); }}, 'Error'),
                                                Node.button({className: 'raised', click: function() { Notify.info('Lorem ipsum'); }}, 'Info')
                                        ])
                                ])
                        ])
                );
        }
}

const page = new HomePage();

export { page as default };
