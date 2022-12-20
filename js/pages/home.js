
let ae = globalThis.ae;
var x = new Promise((ok, nok) =>
{
	ae.require('Page', 'Node', 'Ajax', 'Translator', 'Modal', 'Notify', 'page.home.css', 'ae.tab.css').then(([Page, Node, Ajax, Translator, Modal, Notify]) =>
	{
		var page = new Page();
		Object.assign(page, 
		{
			show: function()
			{
				// set the page title in the header
				document.getElementById('title').textContent = 'Home';
				
				// set the highlighted menu
				document.getElementById('menu').dataset.current = 'home';
				
				if( this.dom.children.length == 0 ) this.init();
				
				return Promise.resolve();
			},
			init: function()
			{
				var self = this;
				
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
						}}, [ // TAB TITLES
							Node.span("Modal"),
							Node.span("Notify")
						]),
						Node.div([ // TAB CONTENT
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
		
		ok(page);
	}, (e) => { nok(e); });
});

export { x as default };