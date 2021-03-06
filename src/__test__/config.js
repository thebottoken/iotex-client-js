import dotenv from 'dotenv';
import process from 'global/process';
dotenv.config();

export const REFRESH_FIXTURE = process.env.REFRESH_FIXTURE;

export const TEST_WALLET_CORE_URL = process.env.TEST_WALLET_CORE_URL || 'http://localhost:14004/api/wallet-core/';
export const TEST_IOTEX_CORE_URL = process.env.TEST_IOTEX_CORE_URL || 'http://localhost:14004';
export const TEST_IOTEX_CORE_SUBCHAIN_URL = process.env.TEST_IOTEX_CORE_SUBCHAIN_URL || 'http://localhost:14004';
export const TEST_ACCOUNTS = JSON.parse(process.env.TEST_ACCOUNTS || '["01cc9a722cf733945e9d591d3e4a3e1ea31416b663c3489c5ed7cdc59cf1636199570d00","02445058a454ebf19737e5e3445aeb8469d073a0f40301cebf65c587c2877084fb1f8101","fac724fc10194ceaea8a718c4053f152f2bcb1c97d8c7e66da2a278410f145a7fc8c5d00","a0313831ac0835d8ae17b0779130c59b39e0b86f5977ab6ecf7da79a69ba8aa5b3faa500","685ca0b7276cff60fc9bb378e79bb785f8421aa766bb4f0069d99f8505f009d5210cb401","71e2be256393a9cc7ce1945aacfc10df4f8bcfcb5a1cfa3b0f5e7a9fd213b5c188f5fc00","a51d62a858ff661b42c2b55144e97ea94b31f1e16519072b43121eebf8657a84e6850400"]');
export const TEST_TRANSER_HASH = process.env.TEST_TRANSER_HASH || '68d187f580bd0dc4ebc630abc4a756475ea06bdc65bcfbda4ae404459d7b89e1';
export const TEST_ROLL_DICE_CONTRACT_ADDRESS = process.env.TEST_ROLL_DICE_CONTRACT_ADDRESS || 'io1qyqsqqqqmd6z6fwlp8kfl0r8lg2hj5ek4txq6gc82lvkgm';
