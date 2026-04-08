import { Cookie } from './Cookie.js';

export class Ajax
{
	static post(url, options) { return Ajax.fetch(url, {...(options||{}), method: 'POST'}); }
	static get(url, options) { return Ajax.fetch(url, {...(options||{}), method: 'GET'}); }
	static put(url, options) { return Ajax.fetch(url, {...(options||{}), method: 'PUT'}); }
	static patch(url, options) { return Ajax.fetch(url, {...(options||{}), method: 'PATCH'}); }
	static delete(url, options) { return Ajax.fetch(url, {...(options||{}), method: 'DELETE'}); }

	static fetch(url, options)
	{
		if( !url || !options ) throw new RangeError('Invalid url or options for Ajax request');
		if( !options.data ) options.data = {};
		if( options.method === 'GET' && options.noCache ) options.data.v = '_' + Date.now();
		if( !options.headers ) options.headers = {};
		if( !options.headers.hasOwnProperty('Authorization') && Ajax.authorization ) options.headers.Authorization = Ajax.authorization;
		if( !options.headers.hasOwnProperty('Authorization') && options.user && options.password ) options.headers.Authorization = "Basic " + btoa(unescape(encodeURIComponent(options.user + ":" + options.password)));
		if( options.headers.hasOwnProperty('Authorization') && !options.headers.Authorization ) delete options.headers.Authorization;

		return new Promise(async (ok, nok) =>
		{
			const fetchOptions = { method: options.method, headers: options.headers };
			if( options.withCredentials ) fetchOptions.credentials = 'include';
			if( options.mimeType && !fetchOptions.headers.Accept ) fetchOptions.headers.Accept = options.mimeType;

			let controller, timeoutId;
			if( options.timeout )
			{
				controller = new AbortController();
				timeoutId = setTimeout(() => controller.abort(), options.timeout);
				fetchOptions.signal = controller.signal;
			}

			let requestUrl = url;
			if( options.data && options.method === 'GET' )
			{
				let querystring = "";
				Object.keys(options.data).forEach((key) => { querystring += encodeURIComponent(key) + "=" + encodeURIComponent(options.data[key]) + "&"; });
				requestUrl += (requestUrl.includes('?') ? '&' : '?') + querystring.slice(0, -1);
			}
			else if( options.method !== 'GET' )
			{
				let body = options.data;
				if( body instanceof HTMLFormElement ) body = new FormData(body);
				if( typeof body !== 'string' && !(body instanceof FormData) )
				{
					const data = new FormData();
					Object.keys(body || {}).forEach((key) => { data.append(key, body[key]); });
					body = data;
				}
				if( body !== undefined ) fetchOptions.body = body;
			}

			try
			{
				const response = await fetch(requestUrl, fetchOptions);
				if( timeoutId ) clearTimeout(timeoutId);

				const e = { status: response.status, headers: {} };
				response.headers.forEach((value, key) => { e.headers[key] = value; });

				try
				{
					if( options.responseType === 'arraybuffer' )
					{
						e.rawResponse = await response.arrayBuffer();
						e.response = e.rawResponse;
					}
					else if( options.responseType === 'blob' )
					{
						e.rawResponse = await response.blob();
						e.response = e.rawResponse;
					}
					else
					{
						const text = await response.text();
						e.rawResponse = text;
						try { e.response = JSON.parse(text); } catch(ex) { e.response = text; }
					}
				}
				catch(err)
				{
					e.rawResponse = null;
					e.response = null;
				}

				if( e.status === 403 )
				{
					if( !/^(?:[a-z]+:)?\/\//i.test(url) && Ajax.authorization )
					{
						delete Ajax.authorization;
						Cookie.unset('token');
						location.reload();
						return;
					}
				}

				if( e.status >= 400 ) nok(e);
				else ok(e);
			}
			catch(err)
			{
				if( timeoutId ) clearTimeout(timeoutId);
				const e = {};
				if( err && err.name === 'AbortError' )
				{
					e.status = 504;
					e.response = null;
					e.headers = {};
				}
				else
				{
					e.status = 0;
					e.response = null;
					e.headers = {};
				}
				nok(e);
			}
		});
	}
}

export { Ajax as default };
