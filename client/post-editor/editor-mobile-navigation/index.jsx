/**
 * External dependencies
 */
const React = require( 'react' );

import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
const Site = require( 'my-sites/site' ),
	Gridicon = require( 'components/gridicon' );

import { setLayoutFocus } from 'state/ui/actions';

const EditorMobileNavigation = React.createClass( {

	toggleSidebar: function() {
		this.props.setLayoutFocus( 'sidebar' );
	},

	render: function() {
		if ( ! this.props.site ) {
			return null;
		}

		return (
			<div className="editor-mobile-navigation">
				<Site indicator={ false } site={ this.props.site } />
				<button className="button editor-mobile-navigation__toggle" onClick={ this.toggleSidebar }>
					{ this.translate( 'Actions' ) }
				</button>
				<Gridicon
					icon="cross"
					onClick={ this.props.onClose }
					className="editor-mobile-navigation__close" />
			</div>
		);
	}
} );

module.exports = connect( null, { setLayoutFocus } )( EditorMobileNavigation );
