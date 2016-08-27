import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import beater from 'beater';

const { test } = beater();

test('index', () => {
  assert(sinon);
  assert(proxyquire);
});
