/*global define, require*/
define(
	[ 'require' ],
	function( require )
	{
		var signals;
		var text;
		var canvas;
		var ctx;
		var input;
		var values = { };
		var default_size = { width: window.outerWidth, height: 200 };
		var size = { width: 100, height: 100 };

		function init( shared )
		{
			signals = shared.signals;
			input = document.getElementById( 'text-input' );
			canvas = document.getElementById( 'text-canvas' );
			ctx = canvas.getContext( '2d' );

			input.addEventListener( 'change', textUpdated, false );
			input.addEventListener( 'keydown', textUpdated, false );
			input.addEventListener( 'keyup', textUpdated, false );

			updateSize( default_size );

			signals['resized'].add( updateSize );
			signals['resized'].add( textUpdated );
			signals['control-updated'].add( controlsUpdated );
			signals['control-updated'].add( textUpdated );
			// 4. add font size and style contols
		}

		function textUpdated()
		{
			text = input.value;

			updateCanvas();
		}

		function controlsUpdated( new_values )
		{
			values.font_size = new_values['font-size'] || 60;
			values.font_family = new_values['font-family'] || 'sans-serif';
			values.color = new_values['text-color'] || '#333';

			updateSize();
		}

		function updateCanvas()
		{
			ctx.clearRect( 0, 0, size.width, size.height );

			if ( typeof text === 'string' && text )
			{
				ctx.fillStyle = values.color;
				ctx.textBaseline = 'middle';
				ctx.font = 'normal ' + values.font_size + 'px ' + values.font_family;
				ctx.fillText( text, 0, size.height / 2 );

				var image_data = ctx.getImageData( 0, 0, canvas.width, canvas.height );
				signals['text-updated'].dispatch( image_data );
			}
		}

		function updateSize( new_size )
		{
			new_size = new_size || default_size;

			var height = values.font_size > default_size.height ? values.font_size : default_size.height;
			var width = new_size.width - 100;

			if (
				width !== size.width ||
				height !== size.height
			)
			{
				size = {
					width: width,
					height: height
				};

				canvas.width = size.width;
				canvas.height = size.height;
			}
		}

		return { init: init };
	}
);