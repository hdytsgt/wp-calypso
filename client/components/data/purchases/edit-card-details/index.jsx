/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CountriesList from 'lib/countries-list';
import { fetchUserPurchases } from 'lib/upgrades/actions';
import observe from 'lib/mixins/data-observe';
import PurchasesStore from 'lib/purchases/store';
import QueryStoredCards from 'components/data/query-stored-cards';
import { shouldFetchUserPurchases } from 'lib/purchases';
import StoreConnection from 'components/data/store-connection';
import userFactory from 'lib/user';

/**
 * Module variables
 */
const stores = [
		PurchasesStore
	],
	user = userFactory();

function getStateFromStores( props ) {
	return {
		cardId: props.cardId,
		countriesList: CountriesList.forPayments(),
		hasLoadedSites: props.hasLoadedSites,
		isDataLoading,
		selectedPurchase: PurchasesStore.getByPurchaseId( parseInt( props.purchaseId, 10 ) ),
		selectedSite: props.selectedSite
	};
}

function isDataLoading( state ) {
	return (
		! state.selectedPurchase.hasLoadedUserPurchasesFromServer ||
		! state.hasLoadedSites ||
		state.isFetchingStoredCards
	);
}

const EditCardDetailsData = React.createClass( {
	propTypes: {
		cardId: React.PropTypes.string,
		component: React.PropTypes.func.isRequired,
		purchaseId: React.PropTypes.string.isRequired,
		loadingPlaceholder: React.PropTypes.func.isRequired,
		sites: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'sites' ) ],

	componentWillMount() {
		if ( shouldFetchUserPurchases( PurchasesStore.get() ) ) {
			fetchUserPurchases( user.get().ID );
		}
	},

	render() {
		return (
			<div>
				<QueryStoredCards />

				<StoreConnection
					cardId={ this.props.cardId }
					component={ this.props.component }
					getStateFromStores={ getStateFromStores }
					hasLoadedSites={ this.props.sites.fetched }
					isDataLoading={ isDataLoading }
					loadingPlaceholder={ this.props.loadingPlaceholder }
					purchaseId={ this.props.purchaseId }
					selectedSite={ this.props.sites.getSelectedSite() }
					stores={ stores } />
			</div>
		);
	}
} );

export default EditCardDetailsData;
