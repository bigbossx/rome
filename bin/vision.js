#!/usr/bin/env node
'use strict';
const path = require('path');
const meow = require('meow');
const React = require('react');
const {render} = require('ink');
const importJsx = require('import-jsx');

const ui = importJsx('./../src/index.jsx');

meow(`
	Usage
	  $ foo <input>

	Options
	  --rainbow, -r  Include a rainbow

	Examples
	  $ foo unicorns --rainbow
	  🌈 unicorns 🌈
`, {
	flags: {
		rainbow: {
			type: 'boolean',
			alias: 'r'
		}
	}
});

render(React.createElement(ui));