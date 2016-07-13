/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import {
	LAYOUT_SET_FOCUS,
	LAYOUT_NEXT_FOCUS_ACTIVATE,
	LAYOUT_SET_NEXT_FOCUS,
	SELECTED_SITE_SET,
	SECTION_SET,
	PREVIEW_IS_SHOWING,
	PREVIEW_URL_CLEAR,
	PREVIEW_URL_SET,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { createReducer } from 'state/utils';
import editor from './editor/reducer';
import guidedTour from './guided-tours/reducer';
import reader from './reader/reducer';
import olark from './olark/reducer';
import actionLog from './action-log/reducer';

/**
 * Tracks the currently selected site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function selectedSiteId( state = null, action ) {
	switch ( action.type ) {
		case SELECTED_SITE_SET:
			return action.siteId || null;
	}

	return state;
}

/**
 * Tracks the four most recently selected site IDs.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function recentlySelectedSiteIds( state = [], action ) {
	switch ( action.type ) {
		case SELECTED_SITE_SET:
			state = [ action.siteId, ...state ];
			if ( state.length === 3 ) {
				state.pop();
			}
			return state;
	}

	return state;
}

//TODO: do we really want to mix strings and booleans?
export function section( state = false, action ) {
	switch ( action.type ) {
		case SECTION_SET:
			return ( action.section !== undefined ) ? action.section : state;
	}
	return state;
}

export function hasSidebar( state = true, action ) {
	switch ( action.type ) {
		case SECTION_SET:
			return ( action.hasSidebar !== undefined ) ? action.hasSidebar : state;
	}
	return state;
}

export function isLoading( state = false, action ) {
	switch ( action.type ) {
		case SECTION_SET:
			return ( action.isLoading !== undefined ) ? action.isLoading : state;
	}
	return state;
}

export const isPreviewShowing = createReducer( false, {
	[ PREVIEW_IS_SHOWING ]: ( state, { isShowing } ) =>
		isShowing !== undefined ? isShowing : state,
} );

export function currentPreviewUrl( state = null, action ) {
	switch ( action.type ) {
		case PREVIEW_URL_SET:
			return action.url;
		case PREVIEW_URL_CLEAR:
			return null;
	}
	return state;
}

export function layoutFocus( state = { current: null, previous: null, next: null }, action ) {
	const validAreas = [ 'content', 'sidebar', 'sites', 'preview' ];
	const isValidArea = area => includes( validAreas, area );
	switch ( action.type ) {
		case LAYOUT_SET_FOCUS:
			if ( ! isValidArea( action.area ) ) {
				return state;
			}
			return Object.assign( {}, state, { current: action.area, previous: state.current } );
		case LAYOUT_SET_NEXT_FOCUS:
			if ( ! isValidArea( action.area ) ) {
				return state;
			}
			return Object.assign( {}, state, { next: action.area } );
		case LAYOUT_NEXT_FOCUS_ACTIVATE:
			// If we don't have a change queued and the focus has changed
			// previously, set it to `content`. This avoids having to set the
			// focus to content on all navigation links because it becomes the
			// default after focus has shifted.
			if ( ! state.previous ) {
				return state;
			}
			return Object.assign( {}, state, { current: state.next || 'content', previous: state.current, next: null } );
	}
	return state;
}

const reducer = combineReducers( {
	section,
	isLoading,
	layoutFocus,
	hasSidebar,
	isPreviewShowing,
	currentPreviewUrl,
	selectedSiteId,
	recentlySelectedSiteIds,
	guidedTour,
	editor,
	reader,
	olark,
	actionLog,
} );

export default function( state, action ) {
	if ( SERIALIZE === action.type || DESERIALIZE === action.type ) {
		return {};
	}

	return reducer( state, action );
}
