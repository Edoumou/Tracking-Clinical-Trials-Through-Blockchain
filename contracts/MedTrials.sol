// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "../client/node_modules/@openzeppelin/contracts/access/AccessControl.sol";

contract MedTrials is AccessControl {
    struct Protocol {
        string cid;
        address promoter;
        address investigator;
        bool registered;
        bool authorized;
        uint256 nbOfPatients;
        uint256 index;
        string status;
    }

    struct Patient {
        address patient;
        address investigator;
        string protocolID;
        bool consent;
        string[] cids;
    }

    struct Promoter {
        address promoter;
        string cid;
    }

    mapping(string => Protocol) public protocols;
    mapping(string => Patient) public patients;
    mapping(uint256 => string) public protocolsID;
    mapping(uint256 => Promoter) public promoters;
    mapping(address => string) roles;

    mapping(string => mapping(string => uint256)) private protocolNumerotation;

    bytes32 public constant AUTHORITY = keccak256("AUTHORITY");
    bytes32 public constant AUTHORITY_ADMIN = keccak256("AUTHORITYADMIN");
    bytes32 public constant PROMOTER = keccak256("PROMOTER");
    bytes32 public constant PROMOTER_ADMIN = keccak256("PROMOTERADMIN");
    bytes32 public constant INVESTIGATOR = keccak256("INVESTIGATOR");
    bytes32 public constant PATIENT = keccak256("PATIENT");

    uint256 public nbOfProtocolsRegistered;
    uint256 public nbOfPatients;
    uint256 public nbOfPromoters;

    event promoterAdded(address _address);
    event authorityAdded(address _address);
    event investigatorAdded(address _address);
    event protocolValidated(string _id);
    event newProtocol(string _id, address _promotor, address _investigator);
    event patientAdded(string _patientID, string _protocolID);
    event consentGiven(string _patientID);
    event consentRevoked(string _patientID);
    event cidSaved(string _cid);
    event protocolSuspended(string _protocolID);
    event protocolResumed(string _protocolID);

    constructor(
        address _default_admin,
        address _authorityAdmin,
        address _promotorAdmin
    ) {
        _setupRole(DEFAULT_ADMIN_ROLE, _default_admin);

        _setRoleAdmin(AUTHORITY_ADMIN, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(AUTHORITY, AUTHORITY_ADMIN);

        _setRoleAdmin(PROMOTER_ADMIN, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(PROMOTER, PROMOTER_ADMIN);

        _setRoleAdmin(INVESTIGATOR, PROMOTER);

        _setupRole(AUTHORITY_ADMIN, _authorityAdmin);
        _setupRole(PROMOTER_ADMIN, _promotorAdmin);

        //renounceRole(DEFAULT_ADMIN_ROLE, _default_admin);

        roles[_authorityAdmin] = "AUTHORITY ADMIN";
        roles[_promotorAdmin] = "PROMOTER ADMIN";
    }

    function isAuthority(address _address) public view returns (bool) {
        return hasRole(AUTHORITY, _address);
    }

    function isPromoter(address _address) public view returns (bool) {
        return hasRole(PROMOTER, _address);
    }

    function isInvestigator(address _address) public view returns (bool) {
        return hasRole(INVESTIGATOR, _address);
    }

    function addPromoter(address _address, string _cid) public {
        require(
            hasRole(PROMOTER_ADMIN, msg.sender),
            "Only the promotor admin can add investigators"
        );
        require(!hasRole(PROMOTER, _address), "You are already a promoter");
        require(!hasRole(INVESTIGATOR, _address), "You are an investigator");
        require(!hasRole(AUTHORITY, _address), "You are an authority");

        grantRole(PROMOTER, _address);
        roles[_address] = "PROMOTER";

        promoters[nbOfPromoters].cid = _cid;
        promoters[nbOfPromoters].promoter = _address;
        nbOfPromoters++;

        emit promoterAdded(_address);
    }

    function addInvestigator(address _address) public {
        require(
            hasRole(PROMOTER_ADMIN, msg.sender),
            "Only the promotor admin can add investigators"
        );
        require(
            !hasRole(INVESTIGATOR, _address),
            "You are already an investigator"
        );
        require(!hasRole(PROMOTER, _address), "You are a promoter");
        require(!hasRole(AUTHORITY, _address), "You are an authority");

        grantRole(INVESTIGATOR, _address);
        roles[_address] = "INVESTIGATOR";

        emit investigatorAdded(_address);
    }

    function addAuthority(address _address) public {
        require(
            hasRole(AUTHORITY_ADMIN, msg.sender),
            "Only the authority admin can add investigators"
        );
        require(!hasRole(AUTHORITY, _address), "You are already an authority");
        require(!hasRole(PROMOTER, _address), "You are a promoter");
        require(!hasRole(INVESTIGATOR, _address), "You are an investigator");

        grantRole(AUTHORITY, _address);
        roles[_address] = "AUTHORITY";

        emit authorityAdded(_address);
    }

    function registerProtocol(
        string memory _id,
        string memory _cid,
        string memory center,
        string memory category,
        address _investigator
    ) public {
        require(
            hasRole(PROMOTER, msg.sender),
            "Only promoters can submit protocols"
        );
        require(
            !hasRole(PROMOTER, _investigator),
            "Promoters cannot be investigators"
        );
        require(
            !hasRole(AUTHORITY, _investigator),
            "Authorities cannot be investigators"
        );
        require(
            !protocols[_id].registered,
            "The protocol is already registered"
        );

        protocols[_id].promoter = msg.sender;
        protocols[_id].investigator = _investigator;
        protocols[_id].registered = true;
        protocols[_id].cid = _cid;
        protocols[_id].status = "registered";
        protocols[_id].index = nbOfProtocolsRegistered;

        protocolsID[nbOfProtocolsRegistered] = _id;
        nbOfProtocolsRegistered++;

        protocolNumerotation[center][category]++;

        if (!hasRole(INVESTIGATOR, _investigator)) {
            grantRole(INVESTIGATOR, _investigator);
            roles[_investigator] = "INVESTIGATOR";
        }

        emit newProtocol(_id, msg.sender, _investigator);
    }

    function getProtocolCID(string memory _id)
        public
        view
        returns (string memory)
    {
        require(
            hasRole(PROMOTER, msg.sender) || hasRole(INVESTIGATOR, msg.sender),
            "only promoters and investigators have this right"
        );
        require(
            protocols[_id].promoter == msg.sender ||
                protocols[_id].investigator == msg.sender,
            "You do not have right to open this project"
        );
        require(
            protocols[_id].authorized,
            "There is no protocol with this cid"
        );

        return protocols[_id].cid;
    }

    function validateProtocol(string memory _id) public {
        require(
            hasRole(AUTHORITY, msg.sender),
            "Only authorities have right to validate protocols"
        );
        require(
            protocols[_id].registered == true,
            "There is no protocol associated with this ID"
        );

        protocols[_id].authorized = true;
        protocols[_id].status = "validated";

        emit protocolValidated(_id);
    }

    function getProtocol(string memory _id)
        public
        view
        returns (Protocol memory)
    {
        require(
            protocols[_id].registered == true,
            "There is no protocol with this id"
        );
        require(
            protocols[_id].authorized == true,
            "This protocol hs not been validated yet"
        );

        return protocols[_id];
    }

    function addPatient(
        string memory _patientID,
        address _patientAddress,
        string memory _protocolID
    ) public {
        require(
            hasRole(INVESTIGATOR, msg.sender),
            "Only investigators can add patients to protocols"
        );
        require(
            protocols[_protocolID].authorized == true,
            "This protocol has not been authorized yet"
        );
        require(
            msg.sender == protocols[_protocolID].investigator,
            "You do not have right to add patients to this protocol"
        );
        //require(_patientAddress != protocols[_protocolID].patient, "This patient already exist");

        patients[_patientID].consent = true;
        patients[_patientID].patient = _patientAddress;
        patients[_patientID].investigator = msg.sender;
        patients[_patientID].protocolID = _protocolID;
        protocols[_protocolID].nbOfPatients++;

        emit patientAdded(_patientID, _protocolID);
    }

    function giveConsent(string memory _patientID) public {
        require(
            msg.sender == patients[_patientID].patient,
            "Your ID is not correct"
        );
        require(
            patients[_patientID].consent == false,
            "You did not consent yet"
        );

        patients[_patientID].consent == true;

        emit consentGiven(_patientID);
    }

    function revokeConsent(string memory _patientID) public {
        require(
            msg.sender == patients[_patientID].patient,
            "Your ID is not correct"
        );
        require(
            patients[_patientID].consent == true,
            "You already revoke your consent"
        );

        patients[_patientID].consent == false;
        delete patients[_patientID];

        emit consentRevoked(_patientID);
    }

    function suspendTrials(string memory _protocolID) public {
        require(
            hasRole(AUTHORITY, msg.sender),
            "Only authoriities can suspend trials"
        );
        require(protocols[_protocolID].authorized);

        protocols[_protocolID].authorized = false;
        protocols[_protocolID].status = "suspended";

        emit protocolSuspended(_protocolID);
    }

    function resumeTrials(string memory _protocolID) public {
        require(
            hasRole(AUTHORITY, msg.sender),
            "Only authoriities can suspend trials"
        );
        require(!protocols[_protocolID].authorized);

        protocols[_protocolID].authorized = true;
        protocols[_protocolID].status = "resumed";

        emit protocolResumed(_protocolID);
    }

    function storeDataCID(string memory _patientID, string memory _cid) public {
        require(
            hasRole(INVESTIGATOR, msg.sender),
            "Only investigators can collect data"
        );
        require(
            msg.sender == patients[_patientID].investigator,
            "You do not have right for this patient"
        );
        require(
            patients[_patientID].consent == true,
            "Get the patient consent first"
        );

        patients[_patientID].cids.push(_cid);

        emit cidSaved(_cid);
    }

    function getDataCID(string memory _patientID)
        public
        view
        returns (string[] memory)
    {
        require(
            hasRole(INVESTIGATOR, msg.sender),
            "Only investigators can collect data"
        );
        require(
            msg.sender == patients[_patientID].investigator,
            "You do not have right for this patient"
        );
        require(
            patients[_patientID].consent == true,
            "Get the patient consent first"
        );

        return patients[_patientID].cids;
    }

    function getProtocolStatus(string memory _protocolID)
        public
        view
        returns (string memory)
    {
        return protocols[_protocolID].status;
    }

    function numberOfPatientByProtocol(string memory _protocolID)
        public
        view
        returns (uint256)
    {
        return protocols[_protocolID].nbOfPatients;
    }

    function getRole(address _address) public view returns (string memory) {
        return roles[_address];
    }

    function getProtocoleNumerotation(
        string memory center,
        string memory category
    ) public view returns (uint256) {
        return protocolNumerotation[center][category] + 1;
    }
}
