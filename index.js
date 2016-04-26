'use strict';

const url = require('url');
const _ = require('lodash');

const config = {
	loginUrl: 'https://accounts.ft.com/login',
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

const getBarrierModel = (originalLocation, config) => {
	return {
		login: buildUrl(config.loginUrl, {originalLocation}),
		register: buildUrl(config.registerUrl, {originalLocation}),
		subscriptions: buildUrl(config.subscriptionsUrl)
	};
};

const avAuth = (opts) => {

	if ( !opts['checkHeader'] ) {
		throw new Error('Name of the header to check is required');
	}

	let checkHeader = opts['checkHeader'];

	return function(req, res, next) {
		if (req.get(checkHeader)) {
			const location = buildUrlFromRequest(req);
			req.isAuthenticated = false;
			req.barrierModel = getBarrierModel(location, config);
		}
		return next();
	}
};

module.exports = avAuth;
