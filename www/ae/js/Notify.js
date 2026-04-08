import { Node } from './Node.js';
import { css, config, safeHtml } from './ae.js';
css('ae.notify', config.corePath);

export class Notify
{
	static async info(message) { await Notify.show(message, 'info'); }
	static async warning(message) { await Notify.show(message, 'warning'); }
	static async success(message) { await Notify.show(message, 'success'); }
	static async error(message) { await Notify.show(message, 'error'); }

	static async show(message, level)
	{
		if( !message ) return;
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
