// @flow
import axios from 'axios';

export type Request = {
  method: string,
  params: Array<any>,
}

export type Response = {
  result: any,
  error: {
    code: number,
    message: string,
  },
}

let requestId = 0;

export interface Provider {
  send(request: Request): Promise<Response>;
}

export class HttpProvider implements Provider {
  axios: any;

  constructor(url: string, timeout: ?number) {
    this.axios = axios.create({
      baseURL: url,
      timeout: timeout || 100000,
    });
  }

  async send(request: Request) {
    let resp;
    try {
      resp = await this.axios.post('/', {
        jsonrpc: '2.0',
        id: String(requestId++),
        method: request.method,
        params: request.params || [],
      });
    } catch (e) {
      return {
        result: null,
        error: {
          code: -32601,
          message: `Network Error: cannot send request: ${e.stack}`,
        },
      };
    }

    return resp.data;
  }
}
