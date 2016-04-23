import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

export const BoardsCollection = new Mongo.Collection('boards');
export const BoardPinsCollection = new Mongo.Collection('boardPins');
export const MealsCollection = new Mongo.Collection('meals');
MealsCollection.allow({
	insert: (userId, doc) => doc.owner === userId,
	remove: (userId, doc) => doc.owner === userId,
	update: (userId, doc) => doc.owner === userId,
	fetch: ['owner']
});

export const PlansCollection = new Mongo.Collection('plans');
PlansCollection.allow({
	insert: (userId, doc) => doc.owner.indexOf(userId) >= 0,
	remove: (userId, doc) => doc.owner.indexOf(userId) >= 0,
	update: (userId, doc) => doc.owner.indexOf(userId) >= 0,
	fetch: ['owner']
});
if(Meteor.isClient) {
	window.debugCollections = () => {
		for(let collection in exports) if(exports[collection] instanceof Mongo.Collection) {
			debugCollection(collection, exports[collection]);
		}
	};

	function debugCollection(name, collection) {
		console.log(name);
		console.table(collection.find().fetch());
	}
}
