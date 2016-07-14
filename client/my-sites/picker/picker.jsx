/**
 * External dependencies
 */
var React = require( 'react' ),
	wrapWithClickOutside = require( 'react-click-outside' ),
	noop = require( 'lodash/noop' ),
	closeOnEsc = require( 'lib/mixins/close-on-esc' );

import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
var SiteSelector = require( 'components/site-selector' ),
	hasTouch = require( 'lib/touch-detect' ).hasTouch;

import { setLayoutFocus, setNextLayoutFocus } from 'state/ui/actions';
import { getCurrentLayoutFocus } from 'state/ui/selectors';

const SitePicker = React.createClass( {
	displayName: 'SitePicker',

	mixins: [ closeOnEsc( 'closePicker' ) ],

	propTypes: {
		onClose: React.PropTypes.func,
		setNextLayoutFocus: React.PropTypes.func.isRequired,
		setLayoutFocus: React.PropTypes.func.isRequired,
	},

	getInitialState: function() {
		return {
			isAutoFocused: false
		};
	},

	getDefaultProps: function() {
		return {
			onClose: noop
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! nextProps.currentLayoutFocus || hasTouch() ) {
			return;
		}

		// The 200ms delay here is necessary to accomodate for LayoutFocus
		// toggling the visibility of inactive views via `setFocusHideClass`
		clearTimeout( this._autofocusTimeout );
		this._autofocusTimeout = setTimeout( function() {
			this.setState( {
				isAutoFocused: nextProps.currentLayoutFocus === 'sites'
			} );
		}.bind( this ), 200 );
	},

	componentWillUnmount: function() {
		clearTimeout( this._autofocusTimeout );
		this._autofocusTimeout = null;
	},

	onClose: function( event ) {
		if ( event.key === 'Escape' ) {
			this.closePicker();
		} else {
			// We use setNext here, because on mobile we want to show sidebar
			// instead of Stats page after picking a site
			this.props.setNextLayoutFocus( 'sidebar' );
			this.scrollToTop();
		}
		this.props.onClose( event );
	},

	scrollToTop: function() {
		document.getElementById( 'secondary' ).scrollTop = 0;
		window.scrollTo( 0, 0 );
	},

	closePicker: function() {
		if ( this.props.currentLayoutFocus === 'sites' ) {
			this.props.setLayoutFocus( 'sidebar' );
			this.scrollToTop();
		}
	},

	handleClickOutside: function() {
		this.closePicker();
	},

	render: function() {
		return (
			<SiteSelector
				ref="siteSelector"
				indicator={ true }
				showAddNewSite={ true }
				showAllSites={ true }
				sites={ this.props.sites }
				allSitesPath={ this.props.allSitesPath }
				siteBasePath={ this.props.siteBasePath }
				user={ this.props.user }
				autoFocus={ this.state.isAutoFocused }
				onClose={ this.onClose }
				groups={ true }
			/>
		);
	}
} );

module.exports = wrapWithClickOutside( connect( state => {
	return {
		currentLayoutFocus: getCurrentLayoutFocus( state ),
	};
}, { setNextLayoutFocus, setLayoutFocus } )( SitePicker ) );
