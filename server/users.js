import {Meteor} from 'meteor/meteor';

Meteor.users._ensureIndex({
	'profile.name': 'text'
});

Meteor.publish('userSearch', (query) => {
	return query ? Meteor.users.find({
		$text: {$search: query}
	}, {
		fields: {
			score: {
				$meta: 'textScore'
			},
			'profile.name': 1
		},
		sort: {
			score: {
				$meta: 'textScore'
			}
		},
		transform(doc) {
			doc.inSearch = true;
			return doc;
		}
	}) : [];
});
