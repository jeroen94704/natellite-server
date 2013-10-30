var util = require('../lib/util');
var assert = require('assert');

describe('validSlug', function() {
    it('should accept valid slugs', function() {
        assert(util.validSlug('abcd'));
        assert(util.validSlug('abc-123'));
        assert(util.validSlug('123'));
    });

    it('should reject invalid slugs', function() {
        assert(!util.validSlug('!@#%'), 'first');
        assert(!util.validSlug('abc!'), 'second');
        assert(!util.validSlug('what what'), 'third');
    });
});
