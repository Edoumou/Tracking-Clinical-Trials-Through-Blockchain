var MedTrials = artifacts.require("./MedTrials.sol");

const DEFAULT_ADMIN = "0x1328A06e124dc82eE28F0116826400e2E00079dc";
const AUTHORITY_ADMIN = "0xCB7aB77E9577e7E7206511A71834912837d0963f";
const PROMOTER_ADMIN = "0x5A550Cd7866794374B97E91BD1bD8b9a18aB1432";


module.exports = function (deployer) {
  deployer.deploy(MedTrials, DEFAULT_ADMIN, AUTHORITY_ADMIN, PROMOTER_ADMIN);
};
