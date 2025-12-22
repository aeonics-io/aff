import App from './App.js';
import Page from './Page.js';
import Node from './Node.js';
import Ajax from './Ajax.js';
import Cookie from './Cookie.js';
import Modal from './Modal.js';
import Notify from './Notify.js';
import Translator from './Translator.js';
import * as core from './ae.js';

const ae = {
        App,
        Page,
        Node,
        Ajax,
        Cookie,
        Modal,
        Notify,
        Translator,
        ...core
};

export {
        App,
        Page,
        Node,
        Ajax,
        Cookie,
        Modal,
        Notify,
        Translator
};

export * from './ae.js';
export default ae;
