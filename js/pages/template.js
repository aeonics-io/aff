
let ae = globalThis.ae;
var x = new Promise((ok, nok) =>
{
	ae.require('App', 'Page', 'Node', 'Translator').then(([App, Page, Node, Translator]) =>
	{
		// make sure that the default translation is loaded before proceeding
		Translator.load('default').then(() =>
		{
			var page = new Page();
			Object.assign(page, 
			{
				show: function()
				{
					var container = Node.main({id: "app_container"});
					
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
					
					App.container = container;
					return Promise.resolve(null);
				}
			});
			ok(page);
		});
	}, (e) => { nok(e); });
});

export { x as default };