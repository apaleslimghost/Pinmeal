import {Meteor} from 'meteor/meteor';
import {PlansCollection, MealsCollection} from '../shared/db';

Meteor.publishComposite('plans', {
	find() {
		const cursor = PlansCollection.find({owner: this.userId});
		if(!cursor.count()) {
			PlansCollection.insert({owner: [this.userId]});
		}
		return cursor;
	},

	children: [{
		find(plan) {
			return MealsCollection.find({plan: plan.id});
		}
	}]
});
