import { Page } from 'ae';
import Node from '../../ae/js/Node.js';
import Ajax from '../../ae/js/Ajax.js';
import Modal from '../../ae/js/Modal.js';
import Notify from '../../ae/js/Notify.js';
import { css } from '../../ae/js/ae.js';

const { config } = globalThis;

css('page.home');
css('ae.tab', config.corePath);

const page = new Page();
Object.assign(page,
{
        async show()
        {
                document.getElementById('title').textContent = 'Home';
                document.getElementById('menu').dataset.current = 'home';
                if( this.dom.children.length === 0 ) this.init();
                return Promise.resolve();
        },
        init()
        {
                this.dom.append(
                        Node.h2("Congratulations"),
                        Node.p("This is your first page using the Aeonics Frontend Framework."),

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
});

export { page as default };
