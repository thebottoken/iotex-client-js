pragma solidity ^0.4.23;

contract CodeNameCollector {
  event Log(
    string seg0,
    string iotexId,
    string seg1,
    string name,
    string seg2,
    string reason
  );

  function proposeName(string yourUniqueIotexId, string mainnetPreviewName, string namedAfter) public {
    emit Log('|', yourUniqueIotexId, '|', mainnetPreviewName, '|', namedAfter);
  }
}
