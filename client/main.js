import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {render} from 'react-dom';

class Test extends Component {
	render() {
		return <h1>It works!</h1>
	}
}

Meteor.startup(() => {
	render(<Test />, document.querySelector('main'));
});

