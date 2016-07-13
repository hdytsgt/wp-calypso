import mockery from 'mockery';
import debug from 'debug';
import noop from 'lodash/noop';

const log = debug( 'calypso:test:use-mockery' );

/**
 * A wrapper that starts up mockery before tests run and spins it down after
 *
 * If the beforeActions or afterActions callbacks return a Promise, that Promise will be passed out
 * of the before or after call, allowing actions to perform async tasks.
 * @param  {Function} beforeActions A callback invoked after mockery has been set up. Called with no params. Can return a Promise to indicate that it's doing async work.
 * @param  {[type]} afterActions  A callback invoked just before mockery has been spun down. Called with no params. Can return a Promise to indicate that it's doing async work.
 */
export default function useMockery( beforeActions = noop, afterActions = noop ) {
	before( function turnOnMockery() {
		log( 'turning on mockery' );
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false,
			useCleanCache: true // have to use this with a large set of tests
		} );
		return beforeActions.call( this, mockery );
	} );

	after( function turnOffMockery() {
		log( 'turning off mockery' );
		const actionReturn = afterActions( mockery );
		mockery.deregisterAll();
		mockery.disable();
		return actionReturn;
	} );
}
