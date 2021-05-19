// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "../client/node_modules/@openzeppelin/contracts/access/AccessControl.sol";

contract MedTrials is AccessControl {
    struct Protocol {
        string cid;
        address promoter;
        string status;
        address investigator;
        bool registered;
        bool authorized;
        bool alert;
        uint256 nbOfPatients;
        uint256 index;
    }

    struct Patient {
        address patient;
        address investigator;
        string protocolID;
        string[] cids;
        bool consent;
    }

    struct Promoter {
        address promoter;
        string cid;
    }

    struct Investigator {
        address promoter;
        address investigator;
        string cid;
    }

    struct Authority {
        address authority;
        string cid;
    }

    mapping(string => Protocol) public protocols;
    mapping(string => Patient) public patients;
    mapping(uint256 => string) public protocolsID;
    mapping(uint256 => string) public patientsID;
    mapping(uint256 => Promoter) public promoters;
    mapping(uint256 => Investigator) public investigators;
    mapping(uint256 => Authority) public authorities;
    mapping(address => string) roles;

    mapping(string => mapping(string => uint256)) private protocolNumerotation;
    mapping(address => mapping(string => uint256)) private patientNumerotation;

    bytes32 public constant AUTHORITY = keccak256("AUTHORITY");
    bytes32 public constant AUTHORITY_ADMIN = keccak256("AUTHORITYADMIN");
    bytes32 public constant PROMOTER = keccak256("PROMOTER");
    bytes32 public constant PROMOTER_ADMIN = keccak256("PROMOTERADMIN");
    bytes32 public constant INVESTIGATOR = keccak256("INVESTIGATOR");
    bytes32 public constant PATIENT = keccak256("PATIENT");

    uint256 public nbOfProtocolsRegistered;
    uint256 public nbOfPatients;
    uint256 public nbOfPromoters;
    uint256 public nbOfInvestigators;
    uint256 public nbOfAuthorities;

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

        _setRoleAdmin(PATIENT, INVESTIGATOR);

        _setupRole(AUTHORITY_ADMIN, _authorityAdmin);
        _setupRole(PROMOTER_ADMIN, _promotorAdmin);

        renounceRole(DEFAULT_ADMIN_ROLE, _default_admin);

        roles[_authorityAdmin] = "AUTHORITY ADMIN";
        roles[_promotorAdmin] = "PROMOTER ADMIN";
    }

    function addAuthority(address _address, string memory _cid) public {
        require(
            hasRole(AUTHORITY_ADMIN, msg.sender),
            "Only the authority admin can add investigators"
        );
        require(!hasRole(AUTHORITY, _address), "You are already an authority");
        require(!hasRole(PROMOTER, _address), "You are a promoter");
        require(!hasRole(INVESTIGATOR, _address), "You are an investigator");
        require(!hasRole(PROMOTER_ADMIN, _address), "You are a promoter admin");
        require(
            !hasRole(AUTHORITY_ADMIN, _address),
            "You are an authority admin"
        );

        grantRole(AUTHORITY, _address);
        roles[_address] = "AUTHORITY";

        authorities[nbOfAuthorities].cid = _cid;
        authorities[nbOfAuthorities].authority = _address;
        nbOfAuthorities++;

        emit authorityAdded(_address);
    }

    function addPromoter(address _address, string memory _cid) public {
        require(
            hasRole(PROMOTER_ADMIN, msg.sender),
            "Only the promotor admin can add investigators"
        );
        require(!hasRole(PROMOTER, _address), "You are already a promoter");
        require(!hasRole(INVESTIGATOR, _address), "You are an investigator");
        require(!hasRole(AUTHORITY, _address), "You are an authority");
        require(!hasRole(PROMOTER_ADMIN, _address), "You are a promoter admin");
        require(
            !hasRole(AUTHORITY_ADMIN, _address),
            "You are an authority admin"
        );

        grantRole(PROMOTER, _address);
        roles[_address] = "PROMOTER";

        promoters[nbOfPromoters].cid = _cid;
        promoters[nbOfPromoters].promoter = _address;
        nbOfPromoters++;

        emit promoterAdded(_address);
    }

    function addInvestigator(address _address, string memory _cid) public {
        require(
            hasRole(PROMOTER, msg.sender),
            "Only the promotor can add investigators"
        );
        require(
            !hasRole(INVESTIGATOR, _address),
            "You are already an investigator"
        );
        require(!hasRole(PROMOTER, _address), "You are a promoter");
        require(!hasRole(AUTHORITY, _address), "You are an authority");
        require(!hasRole(PROMOTER_ADMIN, _address), "You are a promoter admin");
        require(
            !hasRole(AUTHORITY_ADMIN, _address),
            "You are an authority admin"
        );

        grantRole(INVESTIGATOR, _address);
        roles[_address] = "INVESTIGATOR";

        investigators[nbOfInvestigators].cid = _cid;
        investigators[nbOfInvestigators].promoter = msg.sender;
        investigators[nbOfInvestigators].investigator = _address;
        nbOfInvestigators++;

        emit investigatorAdded(_address);
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
            !hasRole(PROMOTER_ADMIN, _investigator),
            "Promoters admin cannot be an investigator"
        );
        require(
            !hasRole(AUTHORITY_ADMIN, _investigator),
            "Authorities admin cannot be an investigator"
        );
        require(
            hasRole(INVESTIGATOR, _investigator),
            "The investigator must be registered first"
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

        emit newProtocol(_id, msg.sender, _investigator);
    }

    function getProtocolCID(string memory _id)
        public
        view
        returns (string memory)
    {
        return protocols[_id].cid;
    }

    function validateProtocol(string memory _id) public {
        require(
            hasRole(AUTHORITY, msg.sender),
            "Only authorities have right to validate protocols"
        );

        protocols[_id].authorized = true;
        protocols[_id].status = "validated";
        protocols[_id].alert == false;

        emit protocolValidated(_id);
    }

    function getProtocol(string memory _id)
        public
        view
        returns (Protocol memory)
    {
        return protocols[_id];
    }

    function addPatient(
        string memory _cid,
        string memory _patientID,
        string memory _protocolID,
        address _patientAddress
    ) public {
        require(
            protocols[_protocolID].authorized == true,
            "This protocol has not been authorized yet"
        );
        require(protocols[_protocolID].alert == false, "There is an alert");
        require(
            _patientAddress != patients[_patientID].patient,
            "This patient already exist"
        );

        patients[_patientID].consent = true;
        patients[_patientID].patient = _patientAddress;
        patients[_patientID].investigator = msg.sender;
        patients[_patientID].protocolID = _protocolID;
        protocols[_protocolID].nbOfPatients++;
        patients[_patientID].cids.push(_cid);

        patientsID[nbOfPatients] = _patientID;
        patientNumerotation[msg.sender][_protocolID]++;

        nbOfPatients++;

        grantRole(PATIENT, _patientAddress);
        roles[_patientAddress] = "PATIENT";

        emit patientAdded(_patientID, _protocolID);
    }

    function revokeConsent(
        string memory _patientID,
        string memory _protocolID,
        address _address
    ) public {
        protocols[_protocolID].nbOfPatients--;
        patients[_patientID].consent = false;
        patients[_patientID].investigator = address(0);
        roles[_address] = "";

        emit consentRevoked(_patientID);
    }

    function suspendTrials(string memory _protocolID) public {
        require(
            hasRole(AUTHORITY, msg.sender),
            "Only authoriities can suspend trials"
        );
        require(
            protocols[_protocolID].authorized,
            "Protocol not authorized yet"
        );

        protocols[_protocolID].alert = true;
        protocols[_protocolID].authorized = false;
        protocols[_protocolID].status = "suspended";

        emit protocolSuspended(_protocolID);
    }

    function resumeTrials(string memory _protocolID) public {
        require(
            hasRole(AUTHORITY, msg.sender),
            "Only authorities can suspend trials"
        );

        protocols[_protocolID].alert = false;
        protocols[_protocolID].authorized = true;
        protocols[_protocolID].status = "resumed";

        emit protocolResumed(_protocolID);
    }

    function storeDataCID(
        string memory _patientID,
        string memory _cid,
        uint256 _alert
    ) public {
        patients[_patientID].cids.push(_cid);

        if (_alert == 1) {
            string memory protocolID = patients[_patientID].protocolID;

            protocols[protocolID].alert = true;
            protocols[protocolID].authorized = false;
            protocols[protocolID].status = "suspended";
        }

        emit cidSaved(_cid);
    }

    function getDataCID(string memory _patientID)
        public
        view
        returns (string[] memory)
    {
        require(
            hasRole(INVESTIGATOR, msg.sender) || hasRole(PATIENT, msg.sender),
            "Only investigators or patient can collect or read data"
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

    function getRole(address _address) public view returns (string memory) {
        return roles[_address];
    }

    function getProtocoleNumerotation(
        string memory center,
        string memory category
    ) public view returns (uint256) {
        return protocolNumerotation[center][category] + 1;
    }

    function getPatientNumerotation(string memory _protocolID)
        public
        view
        returns (uint256)
    {
        return patientNumerotation[msg.sender][_protocolID] + 1;
    }
}
