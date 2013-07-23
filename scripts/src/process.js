/*global define*/
define(
	[
		'lib/superfast-blur.0.5',
		'lib/delaunay',
		'aux/detect-edges',
		'aux/get-edge-points',
		'aux/get-random-vertices',
		'aux/greyscale'
	],
	function( blur, triangulate, detectEdges, getEdgePoints, getRandomVertices, greyscale )
	{
		var tmp_canvas = document.createElement( 'canvas' );
		var tmp_ctx = tmp_canvas.getContext( '2d' );

		var canvas = document.getElementById( 'canvas' );
		var ctx = canvas.getContext( '2d' );

		var is_processing = false;
		var values;
		var signals;
		var triangles;
		var triangle;
		var triangle_center_x;
		var triangle_center_y;
		var px_data;
		var pixel;
		var timeout_id;

		var color_data;
		var blurred_image_data;
		var greyscale_data;
		var edge_image_data;
		var edge_points;
		var edge_vertices;
		var polygons;

		var len;
		var i;

		function init( shared )
		{
			signals = shared.signals;

			signals['text-updated'].add( generate );
			signals['control-updated'].add( controlsUpdated );
			signals['saved'].add( exportData );
		}

		function controlsUpdated( new_values )
		{
			values = getAdjustedValues( new_values );
		}

		function generate( image_data )
		{
			if ( ! is_processing )
			{
				clearTimeout( timeout_id );
				px_data = image_data;
				timeout_id = setTimeout( processImage, 100 );
			}
		}

		function processImage()
		{
			is_processing = true;

			clearCanvas( tmp_canvas, tmp_ctx );
			clearCanvas( canvas, ctx );

			resizeCanvas( tmp_canvas, px_data );
			resizeCanvas( canvas, px_data );

			tmp_ctx.putImageData( px_data, 0, 0 );

			// see https://github.com/snorpey/triangulation/blob/develop/scripts/src/process.js#L86
			// for some more details...
			color_data         = tmp_ctx.getImageData( 0, 0, tmp_canvas.width, tmp_canvas.height );
			blurred_image_data = blur( px_data, values.blur, true );
			greyscale_data     = greyscale( blurred_image_data );
			edge_image_data    = detectEdges( greyscale_data, values.accuracy, 5 );
			edge_points        = getEdgePoints( edge_image_data, 50, values.accuracy );
			edge_vertices      = getRandomVertices( edge_points, values['point-rate'], values['point-count'] );
			polygons           = triangulate( edge_vertices );

			triangles = getColorfulTriangles( polygons, color_data );

			drawTriangles( ctx, triangles );

			is_processing = false;
		}

		function drawTriangles( ctx, triangles )
		{
			len = triangles.length;

			for ( i = 0; i < len; i++ )
			{
				triangle = triangles[i];

				ctx.beginPath();
				ctx.moveTo( triangle.a.x, triangle.a.y );
				ctx.lineTo( triangle.b.x, triangle.b.y );
				ctx.lineTo( triangle.c.x, triangle.c.y );
				ctx.lineTo( triangle.a.x, triangle.a.y );

				ctx.fillStyle = triangle.color;
				ctx.fill();
				ctx.closePath();
			}
		}

		function resizeCanvas( canvas, px_data )
		{
			canvas.width = px_data.width;
			canvas.height = px_data.height;
		}

		function clearCanvas( canvas, ctx )
		{
			ctx.clearRect( ctx, 0, 0, canvas.width, canvas.height );
		}

		function exportData()
		{
			var svg_data = {
				triangles: triangles,
				size : { width: canvas.width, height: canvas.height }
			};

			signals['export-svg'].dispatch( svg_data );
			signals['export-png'].dispatch( canvas.toDataURL( 'image/png' ) );
		}

		function getColorfulTriangles( triangles, color_data )
		{
			len = triangles.length;

			for ( i = 0; i < len; i++ )
			{
				triangle = triangles[i];

				// triangle color = color at center of triangle
				triangle_center_x = ( triangle.a.x + triangle.b.x + triangle.c.x ) * 0.33333;
				triangle_center_y = ( triangle.a.y + triangle.b.y + triangle.c.y ) * 0.33333;

				pixel = ( ( triangle_center_x | 0 ) + ( triangle_center_y | 0 ) * color_data.width ) << 2;

				triangle.color = 'rgba(' + color_data.data[pixel] + ', ' + color_data.data[pixel + 1] + ', ' + color_data.data[pixel + 2] + ', ' + color_data.data[pixel + 2] + ')';
			}

			return triangles;
		}

		function getAdjustedValues( new_values )
		{
			var result = { };

			for ( var key in new_values )
			{
				switch ( key )
				{
					case 'blur' :
						result[key] = parseInt( scaleRange( new_values[key], 0, 100, 0, 50 ), 10 );
						break;

					case 'accuracy' :
						result[key] = scaleRange( new_values[key], 0, 100, 1, 0.1 );
						break;

					case 'point-rate' :
						result[key] = scaleRange( new_values[key], 0, 100, 0.001, 0.1 );
						break;

					case 'point-count' :
						result[key] = parseInt( scaleRange( new_values[key], 0, 100, 100, 5000 ), 10 );
						break;
				}
			}

			return result;
		}

		function scaleRange( value, low_1, high_1, low_2, high_2 )
		{
			return low_2 + ( high_2 - low_2) * ( value - low_1 ) / (high_1 - low_1 );
		}

		return { init: init };
	}
);