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
import {route} from 'meteor/kadira:flow-router';

import {BoardPinsCollection, MealsCollection, BoardsCollection} from '../shared/db';

const BoardPins = ({pins, loading, onSelect}) => loading ?
			<span>loading</span> :
			<ul>{pins.map(pin => <li key={pin.id}><a href="#" onClick={() => onSelect(pin)}>{pin.note}</a></li>)}</ul>;

const BoardPinsContainer = createContainer(({id}) => {
	const handle = Meteor.subscribe('pinterestBoardPins', Meteor.user().profile.selectedBoard);
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

const BoardSelectorContainer = createContainer(() => {
	const handle = Meteor.subscribe('pinterestBoards');
	const loading = !handle.ready();
	return {
		loading,
		boards: BoardsCollection.find().fetch(),
		selectedBoard: Meteor.user().profile.selectedBoard,
		selectBoard(ev) {
			Meteor.users.update({_id: Meteor.userId()}, {$set: {
				'profile.selectedBoard': ev.currentTarget.value
			}});
		}
	};
}, BoardSelector);

const App = ({user, cardSelectDate, closeModal, selectPin}) => <div>
	<Blaze template="loginButtons" />
	<Modal isOpen={!!cardSelectDate} onRequestClose={closeModal}>
		<BoardPinsContainer onSelect={selectPin}/>
	</Modal>
	{user && !user.profile.selectedBoard && <BoardSelectorContainer />}
	{user &&  user.profile.selectedBoard && <WeekSelectorContainer  />}
</div>;

const AppContainer = createContainer(() => {
	var cardSelectDate = Session.get('cardSelectDate');
	return {
		user: Meteor.user(),
		cardSelectDate,
		closeModal() {
			Session.set('cardSelectDate', false);
		},
		selectPin(pin) {
			MealsCollection.insert({pin, date: cardSelectDate, owner: Meteor.userId()});
			Session.set('cardSelectDate', false);
		},
	};
}, App);

Meteor.startup(() => {
	render(<AppContainer />, document.querySelector('main'));
});
