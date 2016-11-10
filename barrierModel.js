'use strict';

const _ = require('lodash');

const defaultModel = {
	title: 'Alphaville is completely free.',
	subtitle: 'All you have to do is register.',
	loginText: 'or sign in'
};

module.exports = (config) => {
	return _.extend(defaultModel, config);
};

