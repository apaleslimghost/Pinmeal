import {Meteor} from 'meteor/meteor';
import {MealsCollection} from '../shared/db';

Meteor.publish('meals', function() {
	return MealsCollection.find({owner: this.userId});
});
