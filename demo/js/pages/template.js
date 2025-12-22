import { App, Page, Node, Translator, locale, css } from 'core';
css('page.template');
locale('default');

class TemplatePage extends Page
{
        async show()
        {
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

                App.instance.container = container;
                return Promise.resolve(null);
        }
}

const page = new TemplatePage();
export { page as default };
