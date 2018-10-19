const RAW_ADDRESS_LENGTH = 49;
const RAW_ADDRESS_REGEX = /^io[A-Za-z0-9]+$/;

function inputAddressFormatter(address) {
  if (!address || address.length !== RAW_ADDRESS_LENGTH || !address.match(RAW_ADDRESS_REGEX)) {
    throw new Error(`Provided address "${address}" is invalid.`);
  }
  return address;
}

module.exports = {
  formatter: {
    inputAddressFormatter,
  },
};
