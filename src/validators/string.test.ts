import 'mocha';
import { assert } from 'chai';

import { ContentString, StringRange, TrimString } from './string';

describe('string', () => {
  it('ContentString', () => {
    assert.equal(ContentString('foo'), 'foo');
    assert.equal(ContentString('foo '), 'foo ');
    assert.equal(ContentString(123.3), '123.3');
    assert.equal(ContentString(false), 'false');
    assert.equal(ContentString('foo \n123\n\n '), 'foo \n123\n\n ');
    assert.equal(ContentString(['foo', 'bar']), 'foo,bar');

    assert.throws(() => ContentString(null), TypeError);
    assert.throws(() => ContentString(undefined), TypeError);
    assert.throws(() => ContentString({}), TypeError);
    assert.throws(() => ContentString({ foo: 1 }), TypeError);
    assert.throws(() => ContentString('   '), TypeError);
    assert.throws(() => ContentString(''), TypeError);
    assert.throws(() => ContentString('\n\n'), TypeError);
    assert.throws(() => ContentString('\n \n'), TypeError);
  });

  it('TrimString', () => {
    assert.equal(TrimString('foo'), 'foo');
    assert.equal(TrimString('foo '), 'foo');
    assert.equal(TrimString(123.3), '123.3');
    assert.equal(TrimString(false), 'false');
    assert.equal(TrimString('foo \n123\n\n '), 'foo \n123');
    assert.equal(TrimString(['foo', 'bar']), 'foo,bar');

    assert.throws(() => TrimString(null), TypeError);
    assert.throws(() => TrimString(undefined), TypeError);
    assert.throws(() => TrimString({}), TypeError);
    assert.throws(() => TrimString({ foo: 1 }), TypeError);
    assert.throws(() => TrimString('   '), TypeError);
    assert.throws(() => TrimString(''), TypeError);
    assert.throws(() => TrimString('\n\n'), TypeError);
    assert.throws(() => TrimString('\n \n'), TypeError);
  });

  it('StringRange', () => {
    const basic = StringRange(3, 10, 'my error');

    assert.equal(basic('1234'), '1234');
    assert.equal(basic('123'), '123');
    assert.equal(basic('1234567890'), '1234567890');
    assert.equal(basic('123 '), '123 ');
    assert.throws(() => basic('ab'), TypeError);
    assert.throws(() => basic('12345678901'), /^my error$/);

    const start = StringRange(3, null);

    assert.equal(start('1234'), '1234');
    assert.equal(start('123'), '123');
    assert.equal(start('1234567890'), '1234567890');
    assert.equal(start('1234567890123'), '1234567890123');
    assert.throws(() => start('ab'), TypeError);

    const end = StringRange(null, 10);

    assert.equal(end('1234'), '1234');
    assert.equal(end('123'), '123');
    assert.equal(end('1234567890'), '1234567890');
    assert.equal(end('12'), '12');
    assert.throws(() => end('1234567890123'), TypeError);
  });
});
