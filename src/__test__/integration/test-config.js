export const USE_IOTX = false;
export const TEST_PROVIDER_URL = USE_IOTX ? 'http://127.0.0.1:14004/web3' : 'http://127.0.0.1:7545';
export const TEST_ACCOUNT = USE_IOTX ? {
  privateKey: 'c5364b1a2d99d127439be22edfd657889981e9ba4d6d18fe8eca489d48485371efcb2400',
  publicKey: '2726440bc26449be22eb5c0564af4b23dc8c373aa79e8cb0f8df2a9e55b4842dbefcde07d95c1dc1f3d1a367086b4f7742115b53c434e8f5abf116333c2c378c51b0ef6176153602',
  address: 'io1qyqsyqcy26zujam2gt5cut0ggu8pa4d5q7hnrvsvew32t9',
  rawAddress: 'io1qyqsyqcy26zujam2gt5cut0ggu8pa4d5q7hnrvsvew32t9',
} : {
  privateKey: '0xa43830f5fc6971104d32fd69088eee9535dd463f5e1ee2c65dda35d00d8d549f',
  address: '0x2CF763aC52A06A2F9b9C336D9Ac533D7fDBa6937',
};
