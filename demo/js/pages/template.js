import App from '../../ae/js/App.js';
import { Page } from 'ae';
import Node from '../../ae/js/Node.js';
import Translator from '../../ae/js/Translator.js';
import { loadCss } from '../../ae/js/ae.js';

let cssLoaded = false;
function ensureCss()
{
        if( cssLoaded ) return Promise.resolve();
        cssLoaded = true;
        return loadCss(new URL('../css/page.template.css', import.meta.url));
}

class TemplatePage extends Page
{
        async show()
        {
                await ensureCss();
                await Translator.load('default').catch(() => {});

                const container = Node.main({id: "app_container"});

                document.body.append(
                        Node.header([
                                Node.h1({id: 'title'})
                        ]),
                        Node.nav({id: 'menu', dataset: {current: ''}}, Node.ul([
                                Node.li({dataset: {page: 'home'}}, Node.a({href: '#home'}, 'Home')),
                                Node.li({dataset: {page: 'page1'}}, Node.a({href: '#page1'}, 'Page 1')),
                                Node.li({dataset: {page: 'page2'}}, Node.a({href: '#page2'}, 'Page 2')),
                                Node.li({dataset: {page: 'page3'}}, Node.a({href: '#page3'}, 'Page 3'))
                        ])),
                        container
                );

                App.setContainer(container);
                return Promise.resolve(null);
        }
}

const page = new TemplatePage();

export { page as default };
