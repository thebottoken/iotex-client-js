[![CircleCI](https://circleci.com/gh/iotexproject/iotex-client-js.svg?style=svg)](https://circleci.com/gh/iotexproject/iotex-client-js)
[![npm version](https://badge.fury.io/js/iotex-client-js.svg)](https://badge.fury.io/js/iotex-client-js)

# iotex-client-js

Please check documentations at [https://docs.iotex.io](https://docs.iotex.io/docs/sdk-overview).

## Development

```bash
nvm use 10.15.1
npm install

# test
# prepare flow type definitions
npm run flow-install
# run all tests
npm run test
# run a single test file
npm run ava ./path/to/test-file.js
```

To run a single test case, follow instructions [here](https://github.com/avajs/ava/blob/master/docs/01-writing-tests.md#running-specific-tests).

## Scripts

- `npm run build`: build source code from `src` to `dist`
- `npm run docs`: generate documentations
- `npm run publish`: publish code to npm
- `npm run changelog-patch` bump version patch (bug fixes)
- `npm run changelog-minor` bump version minor (new features)
- `npm run changelog-major` bump version major (breaking change)
