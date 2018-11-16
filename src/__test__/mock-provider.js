/* eslint-disable max-statements */
// @flow
import fs from 'fs';
import axios from 'axios';

import type {Provider, Request, Response} from '../provider';
import {REFRESH_FIXTURE} from './config';

export class MockProvider implements Provider {
  axios: any;
  filepath: string;
  fixtures: Array<{
    request: ?any;
    response: ?any;
  }>;
  t: any;
  requestId: number = 0;

  constructor(t: any, url: string, filename: ?string) {
    this.axios = axios.create({
      baseURL: url,
      timeout: 100000,
    });
    filename = (filename || t.title).replace(/ /g, '-');
    this.filepath = `${__dirname}/fixtures/${filename}.json`;
    try {
      const fixtureStr = fs.readFileSync(this.filepath, 'utf8');
      this.fixtures = JSON.parse(fixtureStr);
    } catch (e) {
      this.fixtures = [];
    }
    this.t = t;
  }

  async send(request: Request): Promise<Response> {
    const requestId = this.requestId;
    this.requestId++;
    const fixture = this.fixtures[requestId] || {};
    request = {
      ...request,
      jsonrpc: '2.0',
      id: String(requestId),
      method: request.method,
      params: request.params || [],
    };

    if (!REFRESH_FIXTURE) {
      if ('request' in fixture) {
        this.t.deepEqual(request, fixture.request);
      }
      if ('response' in fixture) {
        return fixture.response || {
          result: 'any',
          error: {
            code: 1,
            message: '',
          },
        };
      }
    }

    let resp;
    try {
      resp = await this.axios.post('/', request);
    } catch (e) {
      return {
        result: null,
        error: {
          code: -32601,
          message: `Network Error: cannot send request: ${e.stack}`,
        },
      };
    }
    const response = resp.data;
    this.fixtures[requestId] = {request, response};
    fs.writeFileSync(this.filepath, JSON.stringify(this.fixtures, null, 2), 'utf8');
    return response;
  }
}
