/* eslint-disable no-console */
import test from 'ava';
import {TEST_PROVIDER_URL} from '../test-config';
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const console = require('global/console');
const {Web3} = require('../../../web3/web3');

const SOL_FILE = './src/__test__/RollDice.sol';
const CONTRACT_NAME = ':RollDice';
const OWNER_ADDR = 'OWNER_ADDR';
const PLAYER_ADDR = 'PLAYER_ADDR';

test.skip('contract deploy', async t => {
  // Connect to local Ethereum node
  const web3 = new Web3(new Web3.providers.HttpProvider(TEST_PROVIDER_URL));

  // Compile the source code
  const input = fs.readFileSync(path.resolve(SOL_FILE));
  const output = solc.compile(input.toString(), 1);
  const bytecode = output.contracts[CONTRACT_NAME].bytecode;
  const abi = JSON.parse(output.contracts[CONTRACT_NAME].interface);

  // Contract object
  const contract = new web3.iotx.Contract(abi);

  // Deploy contract instance
  contract
    .deploy({
      data: `0x${ bytecode}`,
      arguments: [123, 'My String'],
    })
    .send(
      {
        from: OWNER_ADDR,
        gas: 900000 * 2,
      },
      (error, transactionHash) => {
        if (error) {
          console.error('failed to send contract', error, transactionHash);
        }
      })
    .on('error', error => {
      console.error('failed to send contract', error);
    })
    .on('transactionHash', transactionHash => {
    })
    .on('receipt', receipt => {
      if (receipt.contractAddress) {
        console.log(`Deployed at contract address: ${ receipt.contractAddress}`);
        // Let's test the deployed contract
        testContract(receipt.contractAddress);
      }

      // Quick test the contract
      function testContract(address) {
        const contractAbi = new web3.eth.Contract(abi, address);

        contractAbi
          .methods
          .deposit(OWNER_ADDR)
          .send({from: OWNER_ADDR, value: 10 * 1000000000000000000})
          .then(r => {
            console.log('deposit success');
          })
          .catch(err => console.error('failed to call contract method deposit', err.stack));

        contractAbi
          .methods
          .rollAward('requestId', PLAYER_ADDR)
          .send({from: PLAYER_ADDR, value: 10000000000})
          .then(r => {
            console.log(JSON.stringify(r, null, 2));
          })
          .catch(err => console.error('failed to call contract method rollAward', err.stack));
      }

    })
    .then(newContractInstance => {
      console.log(newContractInstance.options.address); // instance with the new contract address
    });
});
