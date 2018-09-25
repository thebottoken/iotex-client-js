// @flow
import axios from 'axios';

export type Request = {
  method: string,
  params: Array<any>,
}

type Response = {
  result?: any,
  error?: {
    code: number,
    message: string,
  },
}

export interface Provider {
  send(request: Request): Promise<Response>;
}

export class JsonRpcProvider implements Provider {
  axios: any;

  constructor({url, timeout}: any) {
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
        id: 0,
        method: request.method,
        params: request.params || [],
      });
    } catch (e) {
      return {
        error: {
          code: -32601,
          message: 'Network Error: cannot send request',
        },
      };
    }

    return resp.data;
  }
}
