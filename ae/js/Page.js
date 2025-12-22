import Node from './Node.js';

class Page
{
        constructor()
        {
                this._dom = null;
        }

        get dom()
        {
                if( !this._dom ) this._dom = Node.section({className: 'page'});
                return this._dom;
        }

        async show()
        {
                return null;
        }

        async hide()
        {
                return null;
        }
}

export { Page as default };
