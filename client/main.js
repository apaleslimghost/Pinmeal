import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import React, {Component} from 'react';
import {render} from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import dates from 'date-math';
import dateInterval from 'date-interval';
import moment from 'moment';
import Blaze from 'meteor/gadicc:blaze-react-component';
import Modal from 'react-modal';
import {FlowRouter as router} from 'meteor/kadira:flow-router';
import {Accounts} from 'meteor/accounts-base';

import {BoardPinsCollection, MealsCollection, BoardsCollection, PlansCollection} from '../shared/db';

const BoardPins = ({pins, loading, onSelect}) => loading ?
			<span>loading</span> :
			<ul>{pins.map(pin => <li key={pin.id}><a href="#" onClick={() => onSelect(pin)}>{pin.note}</a></li>)}</ul>;

const BoardPinsContainer = createContainer(({id, board}) => {
	const handle = Meteor.subscribe('pinterestBoardPins', board);
	const loading = !handle.ready();
	return {
		loading,
		pins: BoardPinsCollection.find().fetch()
	};
}, BoardPins);

const Day = ({date, meal, selectDateCard, clearMeal}) => <div>
	<h3>{moment(date).format('ddd Do')}</h3>
	{
		meal ?
			<Meal {...meal} clearMeal={clearMeal} /> :
			<button onClick={selectDateCard}>Choose a recipe...</button>
	}
</div>;

const DayContainer = createContainer(({date}) => {
	const meals = Meteor.subscribe('meals');
	return {
		date,
		meal: MealsCollection.findOne({date}),
		selectDateCard() {
			Session.set('cardSelectDate', date);
		},
		clearMeal({_id}) {
			MealsCollection.remove({_id});
		}
	}
}, Day);

const Meal = ({_id, pin, clearMeal}) => <div>
	<button onClick={() => clearMeal({_id})}>X</button>
	<Pin {...pin} />
</div>;

const Pin = ({note}) => <h4>{note}</h4>;

const Week = ({date}) => <ul>{dateInterval(
	dates.day,
	dates.week.floor(date),
	dates.week.ceil(date)
).map(date => <li key={date.getTime()}><DayContainer date={date} /></li>)}</ul>;

const WeekSelector = ({nextWeek, prevWeek, resetDate, date}) => <div>
	<button onClick={prevWeek} disabled={date < new Date}>&laquo;</button>
	<button onClick={resetDate}>This week</button>
	<button onClick={nextWeek}>&raquo;</button>
	<Week date={date} />
</div>;

const WeekSelectorContainer = createContainer(() => {
	const date = Session.get('date') || dates.day.floor(new Date);
	return {
		date,
		nextWeek() {
			Session.set('date', dates.week.shift(date, 1));
		},
		prevWeek() {
			Session.set('date', dates.week.shift(date, -1));
		},
		resetDate() {
			Session.set('date', dates.day.floor(new Date));
		},
	};
}, WeekSelector);

const BoardSelector = ({loading, boards, selectBoard, selectedBoard}) => <select onChange={selectBoard} disabled={loading} value={selectedBoard}>
			<option>{loading && 'loading...'}</option>
			{boards.map(board => <option value={board.id} key={board.id}>{board.name}</option>)}
</select>;

const BoardSelectorContainer = createContainer(({plan}) => {
	const handle = Meteor.subscribe('pinterestBoards');
	const loading = !handle.ready();
	return {
		loading,
		boards: BoardsCollection.find().fetch(),
		selectedBoard: plan.board,
		selectBoard(ev) {
			PlansCollection.update({_id: plan._id}, {$set: {
				board: ev.currentTarget.value
			}});
		}
	};
}, BoardSelector);

const Plan = ({plan, cardSelectDate, closeModal, selectPin}) => <div>
	<Modal isOpen={!!cardSelectDate} onRequestClose={closeModal}>
		<BoardPinsContainer onSelect={selectPin} board={plan.board} />
	</Modal>
	{plan.board ? <WeekSelectorContainer /> : <BoardSelectorContainer plan={plan} />}
</div>;

const PlanContainer = createContainer(({plan}) => {
	const cardSelectDate = Session.get('cardSelectDate');
	return {
		plan,
		cardSelectDate,
		closeModal() {
			Session.set('cardSelectDate', false);
		},
		selectPin(pin) {
			MealsCollection.insert({pin, date: cardSelectDate, owner: Meteor.userId()});
			Session.set('cardSelectDate', false);
		},
	};
}, Plan);

const App = ({user, plan}) => <div>
	<Blaze template="loginButtons" />
	{user && (plan ? <PlanContainer plan={plan} /> : <div />)}
</div>;

const AppContainer = createContainer(() => {
	const plans = Meteor.subscribe('plans');
	const plan = PlansCollection.findOne({owner: Meteor.userId()});
	return {user: Meteor.user(), plan};
}, App)

Accounts.onLogin(() => {

});

router.route('/', {action: () => {
	render(<AppContainer />, document.querySelector('main'));
}});
