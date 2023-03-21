
let ae = globalThis.ae;
var x = new Promise((ok, nok) =>
{
	ae.require('Page', 'Node', 'Notify', 'Modal', 'Ajax', 'Translator', 'page.login.css').then(([Page, Node, Notify, Modal, Ajax, Translator]) =>
	{
		// this is the URL that the security much check to decide if the user
		// can proceed
		let URL_TO_CHECK = '/api/admin/';
		
		Translator.load('default').then(() =>
		{
			ok(Object.assign(new Page(), 
			{
				show: function()
				{
					var _ok, _nok;
					this.grantor = new Promise((ok, nok) => 
					{
						_ok = ok;
						_nok = nok;
					});
					this.grantor.ok = _ok;
					this.grantor.nok = _nok;
					
					this.dom.classList.add('login');
					document.body.appendChild(this.dom);
					
					var self = this;
					this.check(false).then(() => { self.dom.remove(); self.grantor.ok(); }, (e) =>
					{
						self.showList();
					});
					
					// special case for fail in url ?auth=fail
					if( ae.urlValue('auth') == 'fail' )
						setTimeout(function() { Notify.error(Translator.get('login.failed')); }, 750);
					
					return this.grantor;
				},
				
				showList: function()
				{
					while( this.dom.firstChild ) this.dom.lastChild.remove();
					var self = this;
					
					Ajax.post('/api/security/providers', {}).then((result) => 
					{
						if( result.response.length == 0 ) { self.grantor.ok(); return; }
						if( result.response.length == 1 )
						{
							if( result.response[0].url ) { location.href = result.response[0].url; }
							else { self.showForm(); }
						}
						else
						{
							var f = Node.form([Node.span(Translator.get("login.provider"))]);
							this.dom.append(f);
							for( var i = 0; i < result.response.length; i++ )
							{
								f.append(Node.button({className: 'raised', dataset: {url: result.response[i].url||''}, click: function(e)
									{
										e.preventDefault(); e.stopImmediatePropagation();
										if( this.dataset.url ) { location.href = this.dataset.url; }
										else { self.showForm(true); }
									}}, ae.safeHtml(result.response[i].name))
								);
							}
						}
					}, () => { self.dom.classList.remove('wait');  nok("F1"); });
				},
				
				showForm: function(showBackButton)
				{
					while( this.dom.firstChild ) this.dom.lastChild.remove();
					
					var self = this;
					this.dom.append(
						Node.form(
						[
							Node.input({type: 'text', name: 'name', placeholder: Translator.get('login.name'), required: true,
								keyup: function(e) { if( e.keyCode == 13 && this.nextSibling.value.length > 0 ) self.login(this.parentNode); }}),
							Node.input({type: 'password', name: 'password', placeholder: Translator.get('login.password'), required: true,
								keyup: function(e) { if( e.keyCode == 13 && this.previousSibling.value.length > 0 ) self.login(this.parentNode); }}),
							Node.input({type: 'hidden', name: 'validity', value: "604800000"}),
							Node.input({type: 'hidden', name: 'exclusive', value: "true"}),
							Node.button({className: 'raised', click: function(e)
							{
								e.preventDefault(); e.stopImmediatePropagation();
								if( this.parentNode.elements['name'].value.length > 0 && this.parentNode.elements['password'].value.length > 0 )
									self.login(this.parentNode);
							}}, Translator.get('login.login')),
							Node.p({className: '', id: 'login_remember', click: function() { this.classList.toggle('selected'); }}, Translator.get('login.remember'))
						])
					);
					
					if( showBackButton )
					{
						this.dom.lastChild.append(Node.span({className: "back", click: function() { self.showList(); }}, Translator.get('login.back')));
					}
				},
				
				check: function(fresh)
				{
					this.dom.classList.add('wait');
					var self = this;
					
					return new Promise((ok, nok) =>
					{
						var auth = fresh ? null : localStorage.getItem('token');
						var data = {data: {topic: 'http', constraints: JSON.stringify({content: {path: URL_TO_CHECK, ip: '#'}})}};
						if( auth ) data.headers = {Authorization: 'Bearer ' + auth};
						
						Ajax.post('/api/security/check', data).then((result) => 
						{
							if( result.response.granted )
							{
								if( !fresh && auth )
									Ajax.authorization = 'Bearer ' + auth;
								self.dom.classList.remove('wait'); 
								ok();
							}
							else { self.dom.classList.remove('wait'); nok("F2"); }
						}, () => { self.dom.classList.remove('wait'); nok("F1"); });
					});
				},
				
				login: function(form)
				{
					this.dom.classList.add('wait');
					var self = this;
					
					Ajax.post('/api/security/login', {data: form}).then((result) => 
					{
						if( self.dom.querySelector('#login_remember').classList.contains('selected') )
							localStorage.setItem('token', result.response.token);
						Ajax.authorization = 'Bearer ' + result.response.token;
						self.check(true).then(
							() => { self.dom.classList.remove('wait'); self.dom.remove(); self.grantor.ok();}, 
							() => { self.dom.classList.remove('wait'); Ajax.authorization = null; Notify.error(Translator.get('login.failed')); }
						);
					}, (error) => 
					{
						self.dom.classList.remove('wait');
						if( error.status == 422 )
						{
							Modal.prompt(Translator.get('login.otp')).then((f) =>
							{
								if( !f.value.value )
								{
									self.dom.classList.remove('wait');
									Notify.error(Translator.get('login.failed'));
									return;
								}
								form.appendChild(Node.input({type: 'hidden', name: 'otp', value: f.value.value}));
								self.login(form);
							}, () =>
							{
								Notify.error(Translator.get('login.failed'));
							});
							return;
						}
						else if( form.lastChild.name == 'otp' ) form.lastChild.remove();
						Notify.error(Translator.get('login.failed'));
					});
				}
			}));
		});
	}, (e) => { nok(e); });
});

export { x as default };