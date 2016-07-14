/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import SitePicker from 'my-sites/picker';
import Sidebar from 'my-sites/sidebar';

module.exports = React.createClass( {
	displayName: 'MySitesNavigation',

	mixins: [ observe( 'sites', 'user' ) ],

	preventPickerDefault( event ) {
		event.preventDefault();
		event.stopPropagation();
	},

	render() {
		return (
			<div className="sites-navigation">
				<SitePicker
					sites={ this.props.sites }
					allSitesPath={ this.props.allSitesPath }
					siteBasePath={ this.props.siteBasePath }
					user={ this.props.user }
					onClose={ this.preventPickerDefault }
				/>
				<Sidebar
					sites={ this.props.sites }
					allSitesPath={ this.props.allSitesPath }
					path={ this.props.path }
					siteBasePath={ this.props.siteBasePath }
					user={ this.props.user }
				/>
			</div>
		);
	}
} );
