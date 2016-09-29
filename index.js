'use strict';

const url = require('url');
const path = require('path');
const _ = require('lodash');

const config = {
	loginUrl: process.env['LOGIN_URL'] || 'https://accounts.ft.com/login',
	registerUrl: 'https://register.ft.com/',
	subscriptionsUrl: 'https://subscribe.ft.com/psp?segId=70703'
};

const buildUrlFromRequest = (req) => {
	return url.format({
		protocol: 'https',
		host: req.get('x-forwarded-host'),
		pathname: req.originalUrl
	});
};

const buildUrl = (urlStr, qsObject) => {

	if ( !qsObject || !Object.keys(qsObject).length ) {
		return urlStr;
	}

	return url.format(_.extend(url.parse(urlStr), {query: qsObject}));
};

const avAuth = () => {

	if ( process.env['SKIP_AUTH'] ) {
		return function(req, res, next) {
			return next();
		}
	}

	const checkHeader =  process.env['AUTH_HEADER'];
	const allowHeaderValue = process.env['AUTH_HEADER_VALUE'];

	if (!checkHeader) {
		throw new Error('Name of the header to check is required');
	}

	if (!allowHeaderValue) {
		throw new Error('Value of the header to check is required');
	}

	return function(req, res, next) {

		if (req.method === 'POST') {
			return next();
		}

		res.set('Vary', checkHeader);

		if (req.get(checkHeader) === allowHeaderValue) {
			return next();
		}

		const location = buildUrlFromRequest(req);
		return res.render(path.join(__dirname, 'views/barrier'), {
			barrierModel: {
				login: buildUrl(config.loginUrl, {location}),
				register: buildUrl(config.registerUrl, {location}),
				subscriptions: buildUrl(config.subscriptionsUrl)
			}
		});
	}
};

module.exports = avAuth;
