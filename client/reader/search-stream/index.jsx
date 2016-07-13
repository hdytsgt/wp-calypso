/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { debounce, trim } from 'lodash';
import closest from 'component-closest';

/**
 * Internal Dependencies
 */
import Stream from 'reader/stream';
import EmptyContent from './empty';
import BlankContent from './blank';
import HeaderBack from 'reader/header-back';
import SearchInput from 'components/search';
import SearchCard from 'components/post-card/search';
import SiteStore from 'lib/reader-site-store';
import FeedStore from 'lib/feed-store';
import shuffle from 'lodash/shuffle';
var i18nUtils = require( 'lib/i18n-utils' );

//const stats = require( 'reader/stats' );
//

const SearchCardAdapter = React.createClass( {
	getInitialState() {
		return this.getStateFromStores();
	},

	getStateFromStores( props = this.props ) {
		return {
			site: SiteStore.get( props.post.site_ID ),
			feed: props.post.feed_ID ? FeedStore.get( props.post.feed_ID ) : null
		};
	},

	componentWillReceiveProps( nextProps ) {
		this.setState( this.getStateFromStores( nextProps ) );
	},

	onCardClick( props, event ) {
		if ( event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			return;
		}
		const rootNode = ReactDom.findDOMNode( this );
		const anchor = closest( event.target, 'a', true, rootNode );

		if ( anchor && anchor.href.search( /\/read\/blogs\/|\/read\/feeds\// ) !== -1 ) {
			return;
		}

		// declarative ignore
		if ( closest( event.target, '.ignore-click, [rel=external]', true, rootNode ) ) {
			return;
		}

		event.preventDefault();
		this.props.handleClick( this.props.post, {} );
	},

	onCommentClick() {
		this.props.handleClick( this.props.post, { comments: true } );
	},

	render() {
		return <SearchCard
			post={ this.props.post }
			site={ this.state.site }
			feed={ this.state.feed }
			onClick={ this.onCardClick }
			onCommentClick={ this.onCommentClick } />;
	}
} );

const emptyStore = {
	get() {
		return [];
	},
	isLastPage() {
		return true;
	},
	getUpdateCount() {
		return 0;
	},
	getSelectedIndex() {
		return -1;
	},
	on() {},
	off() {}
};

const FeedStream = React.createClass( {

	searchSuggestions: {
		"en": [
			"2016 Election",
			"Astrology",
			"Batman",
			"Beach",
			"Beautiful",
			"Bloom",
			"Chickens",
			"Clinton",
			"Cocktails",
			"Craft Beer",
			"Cute",
			"DIY",
			"Delicious",
			"Dogs",
			"Elasticsearch",
			"Fabulous",
			"Farm",
			"Flowers",
			"Funny",
			"Garden",
			"Groovy",
			"Happy Place",
			"Homesteading",
			"Iceland",
			"Inspiration",
			"Juno",
			"Mathematics",
			"Michigan",
			"Monkeys",
			"Mountain Biking",
			"Obama",
			"Overwatch",
			"Pokemon GO",
			"Pride",
			"Recipe",
			"Red Sox",
			"Robots",
			"Scenic",
			"Sous vide",
			"Sunday Brunch",
			"Toddlers",
			"Trump",
			"Woodworking",
			"WordPress",
			"Zombies",
		]
	},

	propTypes: {
		query: React.PropTypes.string
	},

	getInitialState() {
		return {
			title: this.getTitle()
		};
	},

	componentWillMount() {
		this.debouncedUpdate = debounce( this.updateQuery, 300 );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.query !== this.props.query ) {
			this.updateState( nextProps );
		}
	},

	updateState( props = this.props ) {
		const newState = {
			title: this.getTitle( props )
		};
		if ( newState.title !== this.state.title ) {
			this.setState( newState );
		}
	},

	getTitle( props = this.props ) {
		return props.query;
	},

	updateQuery( newValue ) {
		const trimmedValue = trim( newValue );
		if ( trimmedValue === '' || trimmedValue.length > 1 && trimmedValue !== this.props.query ) {
			this.props.onQueryChange( newValue );
		}
	},

	cardFactory() {
		return SearchCardAdapter;
	},

	render() {
		var suggestions = null;
		var lang = i18nUtils.getLocaleSlug();
		if ( this.searchSuggestions[lang] ) {
			suggestions = shuffle( this.searchSuggestions[lang] ).slice( 0, 3 );
			suggestions = suggestions.map( function( query ) {
				return <a href={ '/read/search?q=' + encodeURIComponent( query ) } >{ query }</a>;
			} );
			//join the link elements into a comma separated list
			suggestions = suggestions.slice(1).reduce(function(xs, x, i) {
				return xs.concat([', ', x]);
			}, [ suggestions[0] ] );
		}

		const emptyContent = this.props.query
			? <EmptyContent query={ this.props.query } />
			: <BlankContent suggestions={ suggestions }/>;

		if ( this.props.setPageTitle ) {
			this.props.setPageTitle( this.state.title || this.translate( 'Search' ) );
		}

		const store = this.props.store || emptyStore;

		return (
			<Stream { ...this.props } store={ store }
				listName={ this.translate( 'Search' ) }
				emptyContent={ emptyContent }
				showFollowInHeader={ true }
				cardFactory={ this.cardFactory } >
				{ this.props.showBack && <HeaderBack /> }
				<SearchInput
					initialValue={ this.props.query }
					onSearch={ this.updateQuery }
					autoFocus={ true }
					delaySearch={ true }
					placeholder={ this.translate( 'Search billions of posts across WordPress.com…' ) } />
			</Stream>
		);
	}
} );

export default FeedStream;
