/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import scrollTo from 'lib/scroll-to';
import { getGuidedTourState } from 'state/ui/guided-tours/selectors';
import { nextGuidedTourStep, quitGuidedTour } from 'state/ui/guided-tours/actions';
import { isSectionLoading } from 'state/ui/selectors';
import { errorNotice } from 'state/notices/actions';
import { getScrollableSidebar, query } from './positioning';
import {
	BasicStep,
	FirstStep,
	LinkStep,
	FinishStep,
	ActionStep,
} from './steps';
import wait from './wait';
import QueryPreferences from 'components/data/query-preferences';

const debug = debugFactory( 'calypso:guided-tours' );

class GuidedTours extends Component {
	constructor() {
		super();
		this.bind( 'next', 'quit', 'finish' );
	}

	bind( ...methods ) {
		methods.forEach( m => this[ m ] = this[ m ].bind( this ) );
	}

	componentDidMount() {
		const { stepConfig } = this.props.tourState;
		this.updateTarget( stepConfig );
	}

	componentWillReceiveProps( nextProps ) {
		const { stepConfig } = nextProps.tourState;

		stepConfig.continueIf &&
			stepConfig.continueIf( nextProps.state ) &&
			this.next();
	}
	shouldComponentUpdate( nextProps ) {
		console.log( 'SHOULD UPDATE?', this.props.tourState, nextProps.tourState );
		return (
			( this.props.tourState.stepConfig !== nextProps.tourState.stepConfig ) ||
			( this.props.sectionLoading !== nextProps.sectionLoading ) ||
			( this.props.tourState.tour !== nextProps.tourState.tour ) ||
			( this.props.tourState.shouldShow !== nextProps.tourState.shouldShow )
		);
	}

	componentWillUpdate( nextProps ) {
		const { stepConfig } = nextProps.tourState;

		this.updateTarget( stepConfig );
	}

	updateTarget( step ) {
		this.tipTargets = this.getTipTargets();
		this.currentTarget = step && step.target
			? this.tipTargets[ step.target ]
			: null;
	}

	getTipTargets() {
		const tipTargetDomNodes = query( '[data-tip-target]' );
		return tipTargetDomNodes.reduce( ( tipTargets, node ) => Object.assign( tipTargets, {
			[ node.getAttribute( 'data-tip-target' ) ]: node
		} ), {} );
	}

	next() {
		const nextStepName = this.props.tourState.stepConfig.next;
		const nextStepConfig = this.props.tourState.nextStepConfig;

		const nextTargetFound = () => {
			if ( nextStepConfig && nextStepConfig.target ) {
				const target = this.getTipTargets()[ nextStepConfig.target ];
				return target && target.getBoundingClientRect().left >= 0;
			}
			return true;
		};
		const proceedToNextStep = () => {
			this.props.nextGuidedTourStep( {
				stepName: nextStepName,
				tour: this.props.tourState.tour,
			} );
		};
		const abortTour = () => {
			const ERROR_WAITED_TOO_LONG = 'waited too long for next target';
			debug( ERROR_WAITED_TOO_LONG );
			this.props.errorNotice(
				this.props.translate( 'There was a problem with the tour — sorry!' ),
				{ duration: 8000 }
			);
			this.quit( { error: ERROR_WAITED_TOO_LONG } );
		};
		setTimeout( () => wait( { condition: nextTargetFound, consequence: proceedToNextStep, onError: abortTour } ), 0 );;
	}

	quit( options = {} ) {
		// TODO: put into step specific callback?
		const sidebar = getScrollableSidebar();
		scrollTo( { y: 0, container: sidebar } );

		this.currentTarget && this.currentTarget.classList.remove( 'guided-tours__overlay' );
		this.props.quitGuidedTour( Object.assign( {
			stepName: this.props.tourState.stepName,
			tour: this.props.tourState.tour,
		}, options ) );
	}

	finish() {
		this.quit( { finished: true } );
	}

	render() {
		const { stepConfig, shouldShow, sectionLoading } = this.props.tourState;

		if ( ! shouldShow || ! stepConfig || sectionLoading ) {
			return null;
		}

		debug( 'GuidedTours#render() tourState', this.props.tourState );

		const StepComponent = {
			FirstStep,
			ActionStep,
			LinkStep,
			FinishStep,
		}[ stepConfig.type ] || BasicStep;

		return (
			<div className="guided-tours">
				<QueryPreferences />
				<StepComponent
					{ ...stepConfig }
					key={ stepConfig.target }
					targetSlug={ stepConfig.target }
					onNext={ this.next }
					onQuit={ this.quit }
					onFinish={ this.finish } />
			</div>
		);
	}
}

export default connect( ( state ) => ( {
	tourState: getGuidedTourState( state ),
	sectionLoading: isSectionLoading( state ),
	state,
} ), {
	nextGuidedTourStep,
	quitGuidedTour,
	errorNotice,
} )( localize( GuidedTours ) );
