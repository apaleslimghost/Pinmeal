import {Meteor} from 'meteor/meteor';
import {HTTP} from 'meteor/http';
import {ServiceConfiguration} from 'meteor/service-configuration';
import url from 'url';

function getPinterestUrl(path, query) {
	return url.format({
		protocol: 'https',
		host: 'api.pinterest.com',
		pathname: `v1/${path}`,
		query: {
				...query,
			access_token: process.env.PINTEREST_TOKEN
		}
	});
}

Meteor.publish('pinterestBoard', function(boardId) {
	const url = getPinterestUrl(`boards/${boardId}/pins`);
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
