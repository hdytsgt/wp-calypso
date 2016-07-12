/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { truncate } from 'lodash';

/**
 * Internal dependencies
 */
import { successNotice, errorNotice } from 'state/notices/actions';
import { getSitePost } from 'state/posts/selectors';
import {
	POST_DELETE_FAILURE,
	POST_DELETE_SUCCESS,
	POST_SAVE_SUCCESS
} from 'state/action-types';

/**
 * Utility
 */

const dispatchSuccess = ( message ) => ( { dispatch } ) => dispatch( successNotice( message ) );

export const HANDLERS = {
	[ POST_DELETE_FAILURE ]: ( { dispatch, getState, action } ) => {
		const post = getSitePost( getState(), action.siteId, action.postId );

		let message;
		if ( post ) {
			message = translate( 'An error occurred while deleting "%s"', {
				args: [ truncate( post.title, { length: 24 } ) ]
			} );
		} else {
			message = translate( 'An error occurred while deleting the post' );
		}

		dispatch( errorNotice( message ) );
	},
	[ POST_DELETE_SUCCESS ]: dispatchSuccess( translate( 'Post successfully deleted' ) ),
	[ POST_SAVE_SUCCESS ]: ( { dispatch, action } ) => {
		let text;
		switch ( action.post.status ) {
			case 'trash':
				text = translate( 'Post successfully moved to trash' );
				break;

			case 'publish':
				text = translate( 'Post successfully published' );
				break;
		}

		if ( text ) {
			dispatch( successNotice( text ) );
		}
	}
};

export default ( { dispatch, getState } ) => ( next ) => ( action ) => {
	if ( HANDLERS.hasOwnProperty( action.type ) ) {
		HANDLERS[ action.type ]( { dispatch, getState, action } );
	}

	return next( action );
};
