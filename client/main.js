import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {render} from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import {BoardPinsCollection} from '../shared/db';

const BoardPins = ({pins, loading}) => loading ? <span>loading</span> : <ul>{pins.map(pin => <li><a href={pin.url} target="_blank">{pin.note}</a></li>)}</ul>;

const BoardPinsPage = createContainer(({id}) => {
  const handle = Meteor.subscribe('pinterestBoard', id);
  const loading = !handle.ready();
  return {
    loading,
    pins: BoardPinsCollection.find().fetch()
  };
}, BoardPins);


Meteor.startup(() => {
	render(<BoardPinsPage id="mwrbrennan/recipes" />, document.querySelector('main'));
});

