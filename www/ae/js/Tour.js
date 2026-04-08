import { Node } from './Node.js';
import { Translator, locale } from './Translator.js';
import { config, css, safeHtml } from './ae.js';
css('ae.tour', config.corePath);
locale('default', config.corePath);

export class Tour
{
	static start(steps, options)
	{
		if( !steps || !Array.isArray(steps) || steps.length === 0 )
			throw new Error('Tour requires at least one step');

		const opts = Object.assign({ escapable: false, storageKey: null, padding: 8, scrollMargin: 20 }, options);

		if( opts.storageKey && localStorage.getItem('tour.' + opts.storageKey) === 'done' )
			return Promise.resolve('already_completed');

		let ok, nok;
		const p = new Promise((_ok, _nok) => { ok = _ok; nok = _nok; });
		p.ok = ok;
		p.nok = nok;

		let current = 0;
		let destroyed = false;
		let savedStyles = null;
		let interactiveHandler = null;

		// DOM elements
		const overlay = Node.div({className: 'tour-overlay'});
		const spotlight = Node.div({className: 'tour-spotlight'});
		const tooltip = Node.div({className: 'tour-tooltip'});

		document.body.appendChild(overlay);
		document.body.appendChild(spotlight);
		document.body.appendChild(tooltip);

		// Block clicks outside the target, tooltip, and any open modal
		function onDocumentClick(e)
		{
			if( overlay.style.display === 'none' ) return;
			if( tooltip.contains(e.target) ) return;
			const modal = document.querySelector('body > div.modal');
			if( modal && modal.contains(e.target) ) return;
			const step = steps[current];
			if( step && step.interactive )
			{
				const el = resolveTarget(step);
				if( el && (el === e.target || el.contains(e.target)) ) return;
			}
			e.preventDefault();
			e.stopImmediatePropagation();
		}
		document.addEventListener('click', onDocumentClick, true);

		function resolveTarget(step)
		{
			if( typeof step.target === 'function' ) return step.target();
			if( typeof step.target === 'string' ) return document.querySelector(step.target);
			return step.target;
		}

		function saveTargetStyles(el)
		{
			if( !el ) return;
			const modal = el.closest('div.modal');
			savedStyles = { element: el };
			if( modal )
			{
				savedStyles.modal = modal;
				savedStyles.modalZIndex = modal.style.zIndex;
				modal.style.zIndex = '1001';
			}
		}

		function restoreTargetStyles()
		{
			if( !savedStyles ) return;
			if( savedStyles.modal )
				savedStyles.modal.style.zIndex = savedStyles.modalZIndex;
			savedStyles = null;
		}

		function removeInteractiveHandler()
		{
			if( interactiveHandler && savedStyles )
			{
				savedStyles.element.removeEventListener('click', interactiveHandler);
				interactiveHandler = null;
			}
		}

		function positionSpotlight(el)
		{
			if( !el )
			{
				spotlight.style.display = 'none';
				return;
			}
			spotlight.style.display = '';
			const rect = el.getBoundingClientRect();
			const pad = opts.padding;
			spotlight.style.top = (rect.top - pad) + 'px';
			spotlight.style.left = (rect.left - pad) + 'px';
			spotlight.style.width = (rect.width + pad * 2) + 'px';
			spotlight.style.height = (rect.height + pad * 2) + 'px';
		}

		function positionTooltip(el, step)
		{
			const pos = step.position || 'bottom';
			tooltip.dataset.position = pos;

			// Reset for measurement
			tooltip.style.top = '';
			tooltip.style.left = '';

			const ttRect = tooltip.getBoundingClientRect();
			const pad = opts.padding;
			let top, left, finalPos = pos;

			if( !el )
			{
				// Center in viewport
				top = (window.innerHeight - ttRect.height) / 2;
				left = (window.innerWidth - ttRect.width) / 2;
				finalPos = 'center';
			}
			else
			{
				const elRect = el.getBoundingClientRect();
				const gap = 12;

				const placements = {
					bottom: { top: elRect.bottom + pad + gap, left: elRect.left + (elRect.width - ttRect.width) / 2 },
					top: { top: elRect.top - pad - gap - ttRect.height, left: elRect.left + (elRect.width - ttRect.width) / 2 },
					right: { top: elRect.top + (elRect.height - ttRect.height) / 2, left: elRect.right + pad + gap },
					left: { top: elRect.top + (elRect.height - ttRect.height) / 2, left: elRect.left - pad - gap - ttRect.width }
				};

				const fits = function(p)
				{
					const pl = placements[p];
					return pl.top >= 0 && pl.left >= 0
						&& (pl.top + ttRect.height) <= window.innerHeight
						&& (pl.left + ttRect.width) <= window.innerWidth;
				};

				const opposite = { bottom: 'top', top: 'bottom', left: 'right', right: 'left' };
				const fallbackOrder = [pos, opposite[pos], 'bottom', 'top', 'right', 'left'];

				finalPos = pos;
				for( const p of fallbackOrder )
				{
					if( fits(p) ) { finalPos = p; break; }
				}

				top = placements[finalPos].top;
				left = placements[finalPos].left;
			}

			// Clamp to viewport
			left = Math.max(8, Math.min(left, window.innerWidth - ttRect.width - 8));
			top = Math.max(8, Math.min(top, window.innerHeight - ttRect.height - 8));

			tooltip.dataset.position = finalPos;
			tooltip.style.top = top + 'px';
			tooltip.style.left = left + 'px';
		}

		function renderTooltip(step, index)
		{
			tooltip.innerHTML = '';
			const nodes = [];

			if( step.title )
				nodes.push(Node.h3(safeHtml(step.title)));

			nodes.push(Node.p(step.text || ''));

			const navChildren = [];
			navChildren.push(Node.span((index + 1) + ' / ' + steps.length));

			if( step.interactive )
			{
				navChildren.push(Node.span({className: 'tour-hint'}, 'Click the highlighted element'));
			}
			else
			{
				const navButtons = [];
				if( index > 0 )
				{
					navButtons.push(Node.button({className: 'tour-back', click: function(e)
					{
						e.preventDefault();
						goTo(current - 1);
					}}, 'Back'));
				}
				navButtons.push(Node.button({className: 'tour-next', click: function(e)
				{
					e.preventDefault();
					goTo(current + 1);
				}}, index === steps.length - 1 ? 'Done' : 'Next'));
				navChildren.push(Node.div(navButtons));
			}

			if( opts.escapable )
			{
				nodes.push(Node.aside({className: 'tour-skip', click: function(e)
				{
					e.preventDefault();
					cleanup();
					p.nok('skipped');
				}}, 'Skip'));
			}

			nodes.push(Node.div({className: 'tournav'}, navChildren));
			Node.append(tooltip, nodes);
		}

		async function showStep(index)
		{
			if( destroyed ) return;

			const step = steps[index];
			if( !step ) return;

			if( step.before )
				await step.before();

			if( destroyed ) return;

			removeInteractiveHandler();
			restoreTargetStyles();

			const el = resolveTarget(step);

			if( el )
			{
				el.scrollIntoView({ behavior: 'smooth', block: 'center' });
				// Allow scroll to settle
				await new Promise(r => setTimeout(r, 350));
				if( destroyed ) return;
			}

			saveTargetStyles(el);
			positionSpotlight(el);
			renderTooltip(step, index);
			positionTooltip(el, step);

			if( step.interactive && el )
			{
				interactiveHandler = function()
				{
					goTo(current + 1);
				};
				el.addEventListener('click', interactiveHandler);
			}

			if( step.await )
			{
				step.await(function(direction)
				{
					if( destroyed ) return;
					if( direction === 'prev' ) goTo(current - 1);
					else goTo(current + 1);
				});
			}
		}

		async function goTo(index)
		{
			if( destroyed ) return;

			const prevStep = steps[current];

			if( prevStep && prevStep.after )
				await prevStep.after();

			if( destroyed ) return;

			if( index >= steps.length )
			{
				cleanup();
				if( opts.storageKey )
					localStorage.setItem('tour.' + opts.storageKey, 'done');
				p.ok('completed');
				return;
			}

			if( index < 0 ) index = 0;
			current = index;
			await showStep(current);
		}

		function updatePositions()
		{
			if( destroyed ) return;
			const step = steps[current];
			if( !step ) return;
			const el = resolveTarget(step);
			positionSpotlight(el);
			positionTooltip(el, step);
		}

		let resizeTimeout;
		function onResize()
		{
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(updatePositions, 50);
		}

		function onScroll()
		{
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(updatePositions, 50);
		}

		function onEscape()
		{
			if( !opts.escapable ) return;
			cleanup();
			p.nok('escaped');
		}

		window.addEventListener('resize', onResize);
		window.addEventListener('scroll', onScroll, true);
		document.addEventListener('escape', onEscape);

		function cleanup()
		{
			if( destroyed ) return;
			destroyed = true;
			removeInteractiveHandler();
			restoreTargetStyles();
			clearTimeout(resizeTimeout);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('scroll', onScroll, true);
			document.removeEventListener('escape', onEscape);
			document.removeEventListener('click', onDocumentClick, true);
			overlay.remove();
			spotlight.remove();
			tooltip.remove();
		}

		p.finally(() => { cleanup(); }).catch(() => {});

		showStep(0);

		return p;
	}
}

export { Tour as default };
