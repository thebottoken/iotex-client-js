// @flow
import axios from 'axios';

/**
 * Request is the type of the request sent from the Provider.
 */
export type Request = {
  method: string,
  params: Array<any>,
}

/**
 * Response is the response type received by the Provider.
 */
export type Response = {
  result: any,
  error: {
    code: number,
    message: string,
  },
}

let requestId = 0;

/**
 * Provider is the network provider interface of iotex backend.
 */
export interface Provider {
  send(request: Request): Promise<Response>;
}

/**
 * Provider is the network provider of iotex backend that is implemented in HTTP.
 */
export class HttpProvider implements Provider {
  axios: any;

  /**
   * constructor creates an instance of HttpProvider.
   * @param url
   * @param timeout
   */
  constructor(url: string, timeout: ?number) {
    this.axios = axios.create({
      baseURL: url,
      timeout: timeout || 100000,
    });
  }

  /**
   * send makes an xhr call to the url.
   * @param request
   * @returns
   */
  async send(request: Request): Promise<Response> {
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
