import {Meteor} from 'meteor/meteor';
import {PlansCollection} from '../shared/db';

Meteor.publish('plans', () => PlansCollection.find({}));
