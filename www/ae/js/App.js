import { Page } from './Page.js';
import { Notify } from './Notify.js';
import { ready, config, css, now } from './ae.js';
css('ae.app', config.corePath);

export class App
{
	constructor()
	{
		App.instance = this;
		this.container = document.body;
		this.current = null;
	}

	async setup()
	{
		await ready;

		window.addEventListener('hashchange', () => { this.navigate(location.hash || '#'); });

		const hash = location.hash || '#';
		try
		{
			const preload = this.importPage('template', true);
			const login = await this.importPage('login', true);
			if( login )
			{
				try
				{
					await login.show();
					await login.hide();
				}
				catch(e) { console.warn(e); return; }
			}
			
			const template = await preload;
			if( template )
			{
				await template.show();
			}
		}
		catch(e) { console.warn(e); return; }

		await this.navigate(hash);
	}

	async navigate(hash)
	{
		const name = (/^#([^\/?]*)/.exec(hash||'#')||['',null])[1]||config.defaultPage||'home';
		try
		{
			if( this.current ) await this.current.hide();
			if( this.current && this.current.dom ) this.current.dom.remove();

			this.container.classList.add('wait');
			const page = await this.importPage(name);
			this.current = page;
			await page.show();
			this.container.appendChild(page.dom);
		}
		catch(e)
		{
			Notify.warning('Page "' + name + '" not found');
			console.warn(e);
		}
		finally
		{
			this.container.classList.remove('wait');
		}
	}

	async importPage(name, optional = false)
	{
		try
		{
			let path = name;
			if( !path.endsWith('.js') ) path += '.js';
			if( !/^(https?:)?\/\//i.test(path) )
			{
				const href = new URL((config.sitePath || location.href) + 'js/pages/' , location.href);
				path = new URL(path, href).href;
			}
			if( config.noCache )
			{
				path += '?_' + now;
			}
			
			const module = await import(path);
			if( module.default instanceof Page )
				return module.default;
			else
				throw new Error("Page '" + name + "' is not valid");
		}
		catch(e)
		{
			console.warn(e);
			if( optional ) return null;
			throw e;
		}
	}
}

export { App as default };
