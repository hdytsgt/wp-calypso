function list() {
	return '/purchases';
}

function listNotice( noticeType = ':noticeType' ) {
	return list() + `/${ noticeType }`;
}

function managePurchase( siteName = ':site', purchaseId = ':purchaseId' ) {
	return list() + `/${ siteName }/${ purchaseId }`;
}

function cancelPurchase( siteName, purchaseId ) {
	return managePurchase( siteName, purchaseId ) + '/cancel';
}

function confirmCancelDomain( siteName, purchaseId ) {
	return managePurchase( siteName, purchaseId ) + '/confirm-cancel-domain';
}

function cancelPrivateRegistration( siteName, purchaseId ) {
	return managePurchase( siteName, purchaseId ) + '/cancel-private-registration';
}

function editCardDetails( siteName, purchaseId ) {
	return managePurchase( siteName, purchaseId ) + '/payment/edit';
}

export default {
	cancelPrivateRegistration,
	cancelPurchase,
	confirmCancelDomain,
	editCardDetails,
	list,
	listNotice,
	managePurchase
};
