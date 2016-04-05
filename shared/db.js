import {Mongo} from 'meteor/mongo';

export const BoardPinsCollection = new Mongo.Collection('boardPins');
export const PlansCollection = new Mongo.Collection('plans');
PlansCollection.allow({
	insert() {return true;},
	remove() {return true;},
});
