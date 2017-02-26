/**
 * elenpi
 * @author Gilles Coomans
 */

import { Parser, exec } from './parser.js';
import { Rule, r } from './rule.js';

/**
 * elenpi export object
 * @type {Object}
 * @public
 */
const elenpi = {
	r,
	exec,
	Rule,
	Parser
};

export default elenpi;
