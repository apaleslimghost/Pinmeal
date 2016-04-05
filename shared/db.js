import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

export const BoardPinsCollection = new Mongo.Collection('boardPins');
export const PlansCollection = new Mongo.Collection('plans');
PlansCollection.allow({
	insert() {return true;},
	remove() {return true;},
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
