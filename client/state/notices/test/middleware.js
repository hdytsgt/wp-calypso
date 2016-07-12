/**
 * External dependencies
 */
import { expect } from 'chai';
import { createStore } from 'redux';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import noticesMiddleware, { HANDLERS } from '../middleware';
import { useSandbox } from 'test/helpers/use-sinon';
import { successNotice } from 'state/notices/actions';
import {
	NOTICE_CREATE,
	POST_DELETE_FAILURE,
	POST_DELETE_SUCCESS,
	POST_SAVE_SUCCESS
} from 'state/action-types';

describe( 'middleware', () => {
	describe( 'noticesMiddleware()', () => {
		let store;
		useSandbox( ( sandbox ) => {
			store = createStore( () => 'Hello' );
			sandbox.spy( store, 'dispatch' );
		} );

		before( () => {
			HANDLERS.DUMMY_TYPE = ( { action, dispatch, getState } ) => {
				dispatch( successNotice( `${ getState() } ${ action.target }` ) );
			};
		} );

		after( () => {
			delete HANDLERS.DUMMY_TYPE;
		} );

		it( 'should trigger the observer corresponding to the dispatched action type', () => {
			noticesMiddleware( store )( noop )( { type: 'DUMMY_TYPE', target: 'World' } );

			expect( store.dispatch ).to.have.been.calledWithMatch( {
				type: NOTICE_CREATE,
				notice: {
					text: 'Hello World'
				}
			} );
		} );
	} );

	describe( 'HANDLERS', () => {
		let spy;
		useSandbox( ( sandbox ) => {
			spy = sandbox.spy();
		} );

		context( '.POST_DELETE_FAILURE', () => {
			it( 'should dispatch error notice with truncated title if known', () => {
				HANDLERS[ POST_DELETE_FAILURE ]( {
					dispatch: spy,
					action: {
						type: POST_DELETE_FAILURE,
						siteId: 2916284,
						postId: 841
					},
					getState: () => ( {
						posts: {
							items: {
								'3d097cb7c5473c169bba0eb8e3c6cb64': {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									title: 'Hello World, This Should Be Truncated'
								}
							}
						}
					} )
				} );

				expect( spy ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: 'An error occurred while deleting "Hello World, This Sho..."'
					}
				} );
			} );

			it( 'should dispatch error notice with unknown title', () => {
				HANDLERS[ POST_DELETE_FAILURE ]( {
					dispatch: spy,
					action: {
						type: POST_DELETE_FAILURE,
						siteId: 2916284,
						postId: 841
					},
					getState: () => ( {
						posts: {
							items: {}
						}
					} )
				} );

				expect( spy ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: 'An error occurred while deleting the post'
					}
				} );
			} );
		} );

		context( '.POST_DELETE_SUCCESS', () => {
			it( 'should dispatch success notice', () => {
				HANDLERS[ POST_DELETE_SUCCESS ]( {
					dispatch: spy,
					action: {
						type: POST_DELETE_SUCCESS
					}
				} );

				expect( spy ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-success',
						text: 'Post successfully deleted'
					}
				} );
			} );
		} );

		context( '.POST_SAVE_SUCCESS', () => {
			it( 'should not dispatch if status has no corresponding text', () => {
				HANDLERS[ POST_SAVE_SUCCESS ]( {
					dispatch: spy,
					action: {
						type: POST_SAVE_SUCCESS,
						post: {
							title: 'Hello World',
							status: 'invalid'
						}
					}
				} );

				expect( spy ).to.not.have.been.calledWithMatch( {
					type: NOTICE_CREATE
				} );
			} );

			it( 'should dispatch success notice for trash', () => {
				HANDLERS[ POST_SAVE_SUCCESS ]( {
					dispatch: spy,
					action: {
						type: POST_SAVE_SUCCESS,
						post: { status: 'trash' }
					}
				} );

				expect( spy ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-success',
						text: 'Post successfully moved to trash'
					}
				} );
			} );

			it( 'should dispatch success notice for publish', () => {
				HANDLERS[ POST_SAVE_SUCCESS ]( {
					dispatch: spy,
					action: {
						type: POST_SAVE_SUCCESS,
						post: { status: 'publish' }
					}
				} );

				expect( spy ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-success',
						text: 'Post successfully published'
					}
				} );
			} );
		} );
	} );
} );
