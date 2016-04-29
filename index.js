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

const avAuth = (opts) => {

	if ( !opts['checkHeader'] ) {
		throw new Error('Name of the header to check is required');
	}
	
	if ( !opts['checkHeaderValue'] ) {
		throw new Error('Value of the header to check is required');
	}

	let checkHeader = opts['checkHeader'];
	let allow = opts['checkHeaderValue'];

	return function(req, res, next) {
		res.set('Vary', checkHeader);
		
		if (req.get(checkHeader) !== allow) {
			const location = buildUrlFromRequest(req);
			const barrierModel = {
				login: buildUrl(config.loginUrl, {location}),
				register: buildUrl(config.registerUrl, {location}),
				subscriptions: buildUrl(config.subscriptionsUrl)
			};
			req.isAuthenticated = false;
			req.barrierModel = barrierModel;
		}
		return next();
		
	}
};

module.exports = avAuth;
