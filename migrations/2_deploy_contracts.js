var MedTrials = artifacts.require("./MedTrials.sol");

const DEFAULT_ADMIN = "0x0b367b3682B000F3Eb304081bCB5e63D0582d6ed";
const AUTHORITY_ADMIN = "0x85ba0a73f00E9ae14dAEF50a51Ba3A9F18eA16B7";
const PROMOTER_ADMIN = "0xb2A9A9b2bEdA74D0De10A9a493fcB40d7ff51695";


module.exports = function(deployer) {
  deployer.deploy(MedTrials, DEFAULT_ADMIN, AUTHORITY_ADMIN, PROMOTER_ADMIN);
};
