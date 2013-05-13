/*global require, requirejs, define, Modernizr, _basepath_ */
// http://requirejs.org/docs/api.html#config 
var path = typeof _basepath_ === 'string' ? _basepath_ + '/' : '';
requirejs.config(
	{
		baseUrl: path + 'scripts/',
		waitSeconds: 5,
		urlArgs: 'bust=' +  ( new Date() ).getTime(),
		shim: {
			'lib/delaunay': { exports: 'triangulate' },
			'lib/spectrum':  { exports: 'spectrum', deps: [ 'lib/jquery-2.0.0' ] }
		}
	}
);

require(
	[
		'src/process',
		'src/text',
		'src/controls',
		'src/export-svg',
		'src/export-png',
		'src/save-button',
		'aux/feature-test',
		'lib/signals-1.0.0',
		'lib/html5slider'
	],
	function(
		process,
		text,
		controls,
		svg,
		png,
		save_button,
		testFeatures,
		Signal
	)
	{
		var shared;

		testFeatures( init, showError );

		function init( supported_features )
		{
			shared = {
				feature: supported_features,
				signals: {
					'set-new-src'     : new Signal(),
					'control-updated' : new Signal(),
					'export-png'      : new Signal(),
					'export-svg'      : new Signal(),
					'saved'           : new Signal(),
					'resized'         : new Signal(),
					'text-updated'    : new Signal()
				}
			};

			window.addEventListener( 'resize', resized );

			process.init( shared );
			svg.init( shared );
			png.init( shared );
			save_button.init( shared );
			text.init( shared );
			controls.init( shared );
		}

		function showError( required_features )
		{
			var message = document.createElement( 'div' );
			var message_text = 'sorry. it looks like your browser is missing some of the features ';

			message_text += '(' + required_features.join( ', ' ) + ') that are required to run this ';
			message_text += 'experiment.';

			message.innerText = message_text;
			message.className = 'missing-feature';

			document.getElementsByTagName( 'body' )[0].appendChild( message );
		}

		function resized()
		{
			var size = {
				width: window.outerWidth,
				height: window.outerHeight
			};

			shared.signals['resized'].dispatch( size );
		}
	}
);