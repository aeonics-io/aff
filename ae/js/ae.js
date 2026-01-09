export const config = globalThis.config || (globalThis.config = {});
export const now = new Date().getTime();

export const ready = new Promise((resolve) => 
{
	if( document.readyState === 'interactive' || document.readyState === 'complete' )
		resolve();
	else
		document.addEventListener('DOMContentLoaded', resolve, {once: true});
});

document.addEventListener('keyup', function(e)
{
	if( e.key == "Enter" )
	{
		const ev = new Event('enter', {cancelable: true});
		ev.origin = e;
		this.dispatchEvent(ev);
	}
	else if( e.key == "Escape" )
	{
		const ev = new Event('escape', {cancelable: true});
		ev.origin = e;
		this.dispatchEvent(ev);
	}
	else if( e.key == "Delete" )
	{
		const ev = new Event('delete', {cancelable: true});
		ev.origin = e;
		this.dispatchEvent(ev);
	}
});

if( typeof Array.prototype.last === 'undefined' )
{
	Object.defineProperty(Array.prototype, 'last', { get: function() { return (this.length > 0 ? this[this.length-1] : null); } });
}

const loadedStyles = new Set();
export function css(path, base = config.sitePath)
{
	if( !path.endsWith('.css') ) path += '.css';
	if( !/^(https?:)?\/\//i.test(path) )
	{
		const href = base instanceof URL ? base : new URL((base || location.href) + 'css/', location.href);
		path = new URL(path, href).href;
	}
	if( config.noCache )
	{
		path += '?_' + now;
	}
	else
	{
		if( loadedStyles.has(path) ) return;
		loadedStyles.add(path);
	}

	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = path;
	document.head.appendChild(link);
}

export function safeHtml(text)
{
	if( !text ) return '';
	if( typeof text !== 'string' ) text = '' + text;
	return text.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function urlValue(key)
{
	const params = new URLSearchParams(location.search);
	const value = params.get(key);
	if( value ) return value;
	const hashParams = new URLSearchParams((/\?(.*)/.exec(location.hash || '') || ['', ''])[1] || '');
	return hashParams.get(key);
}
