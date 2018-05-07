import {Meteor} from 'meteor/meteor';
import {PlansCollection, MealsCollection} from '../shared/db';

Meteor.publishComposite('plans', {
	find() {
		const cursor = PlansCollection.find({owner: this.userId});
		if(!cursor.count()) {
			PlansCollection.insert({owner: [this.userId], invites: []});
		}
		return cursor;
	},

	children: [{
		find(plan) {
			return MealsCollection.find({plan: plan.id});
		}
	}, {
		find(plan) {
			return Meteor.users.find({_id: {$in: [
				...plan.owner,
				...plan.invites
			]}})
		}
	}]
});
