var Util = require( 'findhit-util' ),
	tUtil = require( './tests.util' ),
	Promise = require( 'bluebird' ),

	sinon = require( 'sinon' ),
	chai = require( 'chai' ),
	expect = chai.expect;

describe( "PROXY Protocol v1", function () {

	describe( 'net', function () {
		var server = tUtil.createServer( 'net', { strict: true });

		v1tests( 'net', server );
	});

	describe( 'http', function () {
		var server = tUtil.createServer( 'http', { strict: true });

		v1tests( 'http', server );
	});

	/*
	describe( 'https', function () {
		var server = tUtil.createServer( 'https', { strict: true });

		v1tests( server );
	});

	describe( 'spdy', function () {
		var server = tUtil.createServer( 'spdy', { strict: true });

		v1tests( server );
	});
	*/

});


function v1tests ( proto, server ) {

	it( "Check socket is stablished correctly", function () {
		return tUtil.fakeConnect( server );
	});

	it( "Check with another socket parameters", function () {
		return tUtil.fakeConnect(
			server,
			{
				clientAddress: '192.168.0.1',
				clientPort: 3350,
				proxyAddress: '192.168.0.254',
				proxyPort: 443,
			}
		);
	});

	it( "Check with another socket parameters as a string", function () {
		return tUtil.fakeConnect(
			server,
			{
				header: 'PROXY TCP4 192.168.0.1 192.168.0.254 3350 443',
			}
		);
	});

	describe( "Should detect a malformed PROXY headers", function () {

		it( "Header without IP's", function () {
			return tUtil.fakeConnect( server, {
				header: 'PROXY HACK ATTEMPT',
			})
				.then(function () {
					throw new Error("It shouldn't get fulfilled");
				}, function ( err ) {
					expect( err ).to.be.equal( "PROXY protocol error" );
				});

		});

		if ( proto === 'net' ) {

			it( "non-proxy connection when in non-strict mode should not be destroyed #7", function () {
				return tUtil.fakeConnect( tUtil.createServer( proto, { strict: false }), {
					header: 'TELNET BABY',
				})
					.then( null, function ( err ) {
						throw new Error("It shouldn't get rejected");
					});
			});

		}

		it( "Restore emitted events after socket.destroy #5", function () {
			return tUtil.fakeConnect( server, {
				header: 'PRO',
				autoCloseSocket: false,
				testAttributes: false,
			})
				.then(function () {
					throw new Error("It shouldn't get fulfilled");
				}, function ( err ) {
					expect( err ).to.be.equal( "PROXY protocol error" );
				});

		});

	});
}
