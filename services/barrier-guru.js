'use strict';

const barrierGuruUrl = process.env['BARRIER_GURU_URL'];
const barrierGuruKey = process.env['BARRIER_GURU_KEY'];
const rp = require('request-promise');

const getBarrierData = (ip) => {
	const options = {
		uri: 'https://' + barrierGuruUrl + '/barrier',
		headers: {
			'x-api-key': barrierGuruKey,
			'client-ip': ip
		},
		json: true
	};
	return rp(options);
};

module.exports = {
	getBarrierData
};
