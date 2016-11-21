'use strict';

const url = require('url');
const path = require('path');
const _ = require('lodash');
const barrierGuru = require('./services/barrier-guru');
const barrierModel = require('./barrierModel');

const config = {
	loginUrl: process.env['LOGIN_URL'] || 'https://accounts.ft.com/login',
	registerUrl: 'https://register.ft.com/',
	subscriptionsUrl: 'https://www.ft.com/products?segID=70703&segmentID=190b4443-dc03-bd53-e79b-b4b6fbd04e64'
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

		console.log('[auth-debug]: ', JSON.stringify(req.headers));

		res.set('Vary', checkHeader);

		if (req.get(checkHeader) === allowHeaderValue) {
			return next();
		}

		const location = buildUrlFromRequest(req);

		res.set('Cache-Control', 'private, no-cache, no-store');

		const clientIp = process.env['TEST_BARRIER'] ? process.env['TEST_BARRIER_IP'] : req.get('True-Client-IP');

		barrierGuru.getBarrierData(clientIp)
			.then(response => {
				res.render(path.join(__dirname, 'views/barrier'), {
					barrierModel: _.extend({}, barrierModel,{
						title: 'Join your group subscription to access FT.com',
						subtitle: `${response.displayName} has purchased a group subscription to FT.com`,
						extraInfo: `${response.displayName} has paid for your FT subscription, giving you unlimited access to FT content on you desktop and mobile. Make informed decisions with our trusted source of global market intelligence`,
						loginUrl: buildUrl(config.loginUrl, {location}),
						loginText: 'Sign in'
					})
				});
			}).catch(err => {
				res.render(path.join(__dirname, 'views/barrier'), {
					barrierModel: _.extend({}, barrierModel, {
						loginUrl: buildUrl(config.loginUrl, {location}),
						register: buildUrl(config.registerUrl, {location}),
						subscriptions: buildUrl(config.subscriptionsUrl)
					})
				});
		});
	}
};

module.exports = avAuth;
