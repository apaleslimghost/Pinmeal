import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {render} from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import dates from 'date-math';
import dateInterval from 'date-interval';

import {BoardPinsCollection, PlansCollection} from '../shared/db';

const BoardPins = ({pins, loading, onSelect}) => loading ?
				<span>loading</span> :
				<ul>{pins.map(pin => <li><a href="#" onClick={() => onSelect(pin)}>{pin.note}</a></li>)}</ul>;

const BoardPinsContainer = createContainer(({id}) => {
  const handle = Meteor.subscribe('pinterestBoard', id);
  const loading = !handle.ready();
  return {
    loading,
    pins: BoardPinsCollection.find().fetch()
  };
}, BoardPins);

const Day = ({date, plan, selectPin}) => <h3>{date.toISOString()} {plan ? plan.pin.note : <BoardPinsContainer id="mwrbrennan/recipes" onSelect={selectPin}/>}</h3>;

const DayContainer = createContainer(({date}) => {
	const plans = Meteor.subscribe('plans');
	return {
		date,
		plan: PlansCollection.findOne({date}),
		selectPin(pin) {
			PlansCollection.insert({pin, date});
		}
	}
}, Day);


const Week = ({date}) => <ul>{dateInterval(
	dates.day,
	dates.week.floor(date),
	dates.week.ceil(date)
).map(date => <li><DayContainer date={date} /></li>)}</ul>;

Meteor.startup(() => {
	render(<Week date={new Date} />, document.querySelector('main'));
});

