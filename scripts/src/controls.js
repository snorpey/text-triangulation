/*global define, $*/
define(
	function()
	{
		var values = { };
		var is_initialized = false;
		var signals;

		function init( shared )
		{
			signals = shared.signals;

			if ( shared.feature['query-selector-all'] )
			{
				if ( ! shared.feature['input-color'] )
				{
					require( [ 'lib/spectrum' ], pickerLoaded );
				}

				else
				{
					addListeners();
				}
			}
		}

		function pickerLoaded()
		{
			$( 'input[type="color"]' ).change( controlUpdated );
			addListeners();
		}

		function addListeners()
		{
			var wrapper = document.getElementById( 'controls' );
			var controls = document.querySelectorAll( '.control-input' );

			wrapper.className += ' is-active';

			for ( var i = 0; i < controls.length; i++ )
			{
				var control = controls[i];

				control.addEventListener( 'change', controlUpdated, false );

				if ( control.type === 'checkbox' )
				{
					updateValue( control.id, control.checked );
				}

				else
				{
					updateValue( control.id, control.value );
				}
			}

			is_initialized = true;

			signals['control-updated'].dispatch( values );
		}

		function controlUpdated( event )
		{
			var target = event.target;

			if ( target.type === 'checkbox' )
			{
				updateValue( target.id, target.checked );
			}

			else
			{
				updateValue( target.id, target.value );
			}
		}

		function updateValue( key, value )
		{
			values[key] = value;

			if ( is_initialized )
			{
				signals['control-updated'].dispatch( values );
			}
		}

		return { init: init };
	}
);