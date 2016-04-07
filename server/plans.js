import {Meteor} from 'meteor/meteor';
import {PlansCollection} from '../shared/db';

Meteor.publish('plans', function() {
	return PlansCollection.find({owner: this.userId});
});
