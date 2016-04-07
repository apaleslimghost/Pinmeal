import {Meteor} from 'meteor/meteor';
import {HTTP} from 'meteor/http';
import {ServiceConfiguration} from 'meteor/service-configuration';
import url from 'url';

function getPinterestUrl(path, query) {
	return url.format({
		protocol: 'https',
		host: 'api.pinterest.com',
		pathname: `v1/${path}`,
		query
	});
}

function getAccessToken(userId, service) {
	var user = Meteor.users.findOne(userId);
	return user.services[service].accessToken;
}

Meteor.publish('pinterestBoardPins', function(boardId) {
	const url = getPinterestUrl(`boards/${boardId}/pins`, {
		access_token: getAccessToken(this.userId, 'pinterest')
	});
	const {data: {data}} = HTTP.get(url);

	data.forEach(pin => {
		this.added('boardPins', pin.id, pin);
	});

	this.ready();
});

ServiceConfiguration.configurations.upsert({service: 'pinterest'}, {
	$set: {
		clientId: process.env.PINTEREST_CLIENT,
		secret: process.env.PINTEREST_SECRET,
	}
});
