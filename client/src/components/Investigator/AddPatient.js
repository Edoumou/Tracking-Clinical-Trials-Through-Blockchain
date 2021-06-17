import React, { Component } from "react";
import { Grid, Table, Header, Form, Button, Radio, Select, Icon } from "semantic-ui-react";
import { CountryDropdown } from "react-country-region-selector";
import EncryptData from "../utils/EncryptData";
import SendToIPFS from "../utils/SendToIPFS";
import "./styles/style.css";

require('dotenv').config();

class AddPatient extends Component {
  state = {
    id: "",
    gender: "",
    fullName: "",
    address: "",
    city: "",
    country: "",
    telephone: "",
    email: "",
    birth: "",
    ethAddress: "",
    protocol: '',
    nbOfProtocols: 0,
    nbOfPatients: 0,
    protocolsTab: [],
    patientsTab: [],
    options: []
  };

  handleChange = async (e, { value }) => await this.setState({ value });

  selectCountry = async (val) => {
    this.setState({ country: val });
  };

  onFormSubmit = async () => {

    // store the patient data cid to ethereum
    const num = await this.props.contract.methods.getPatientNumerotation(
      this.state.protocol
    ).call({ from: this.props.account });

    // compose the patient ID
    const numStr = String(num);
    let numerotation;
    if (numStr.length === 1) {
      numerotation = `00${numStr}`;
    } else if (numStr.length === 2) {
      numerotation = `0${numStr}`;
    } else {
      numerotation = numStr;
    }

    const center = this.state.protocol.substring(3, 4)
    const patientID = `P${center}${numerotation}`;

    this.setState({ id: patientID });

    const obj = {
      id: patientID,
      gender: this.state.value,
      fullName: this.state.fullName,
      address: this.state.address,
      city: this.state.city,
      country: this.state.country,
      telephone: this.state.telephone,
      email: this.state.email,
      birth: this.state.birth,
      ethAddress: this.state.ethAddress,
      protocol: this.state.protocol
    };

    // encrypt the patient data and store the encrypted data to ipfs
    const encryptedData = EncryptData(JSON.stringify(obj), 16, process.env.REACT_APP_ENCRYPTION_KEY);
    const cid = await SendToIPFS(encryptedData);

    console.log("CID =", cid);
    console.log("Patient ID =", patientID);
    console.log("Protocol ID =", this.state.protocol);
    console.log("Patient address =", this.state.ethAddress);

    // send the cid of the patient data to ethereum
    await this.props.contract.methods.addPatient(cid, patientID, this.state.protocol, this.state.ethAddress)
      .send({ from: this.props.account });

    const patient = await this.props.contract.methods.patients(patientID).call({ from: this.props.account });

    console.log("PATIENT =", patient);

    const patCID = await this.props.contract.methods.getDataCID(patientID).call({ from: this.props.account });
    console.log("PATIENT CID =", patCID);

    await this.getProtocols();
    await this.getPatients();

    this.setState({
      fullName: '',
      address: '',
      city: '',
      country: '',
      telephone: '',
      email: '',
      birth: '',
      ethAddress: '',
      protocol: ''
    });
  };

  getProtocols = async () => {
    // get the number of registered protocols
    const nb = await this.props.contract.methods
      .nbOfProtocolsRegistered()
      .call({ from: this.props.account });
    this.setState({ nbOfProtocols: nb });

    let protocols = [];
    let options = [];

    for (let i = 0; i < nb; i++) {
      const id = await this.props.contract.methods.protocolsID(i)
        .call({ from: this.props.account });

      const protocol = await this.props.contract.methods.protocols(id)
        .call({ from: this.props.account });

      if (protocol["investigator"] === this.props.account) {
        const obj = {};
        const option = {};

        obj.id = id;
        obj.cid = protocol["cid"];
        obj.authorized = protocol["authorized"];
        obj.nbOfPatients = protocol["nbOfPatients"];
        obj.status = protocol["status"];
        obj.promoter = protocol["promoter"];

        option.key = id;
        option.text = id;
        option.value = id;

        protocols.push(obj);
        options.push(option);
      }
    }

    this.setState({
      protocolsTab: protocols,
      options: options
    });
    console.log("PROTOCOLS =", this.state.protocolsTab);
    console.log("OPTIONS =", this.state.options);
  }

  getPatients = async () => {
    // get the number of registered patients
    const nb = await this.props.contract.methods.nbOfPatients()
      .call({ from: this.props.account });
    this.setState({ nbOfPatients: nb });
    console.log("NB OF PATIENTS =", nb);
    let patients = [];

    for (let i = 0; i < nb; i++) {
      const id = await this.props.contract.methods.patientsID(i)
        .call({ from: this.props.account });

      const patient = await this.props.contract.methods.patients(id)
        .call({ from: this.props.account });

      if (patient["investigator"] === this.props.account) {
        const obj = {};

        obj.id = id;
        obj.protocolID = patient["protocolID"];
        obj.address = patient["patient"];
        obj.consent = patient["consent"];

        patients.push(obj);
      }
    }

    this.setState({ patientsTab: patients });
    console.log("PATIENTS =", this.state.patientsTab);
  }

  componentDidMount = async () => {
    await this.getProtocols();
    await this.getPatients();
  }

  render() {
    const {
      fullName,
      address,
      city,
      country,
      telephone,
      email,
      birth,
      ethAddress,
      value
    } = this.state;

    const nb = this.state.nbOfProtocols;
    const nb2 = this.state.nbOfProtocols;

    let protocolTab = [];
    let patientTab = [];

    protocolTab = this.state.protocolsTab;
    patientTab = this.state.patientsTab;

    return (
      <div className="investigator-patient">
        <Grid divided relaxed textAlign="left">
          <Grid.Row>
            <Grid.Column width={10}>
              <div className="investigator-form-h2">

                <div className="protocol-list">
                  <Header as="h2" color="brown">
                    List of protocols
                  </Header>

                  {
                    { nb } !== 0
                      ?
                      <div>
                        <Table celled>
                          <Table.Header>
                            <Table.Row>
                              <Table.HeaderCell>ID</Table.HeaderCell>
                              <Table.HeaderCell>nb of patients</Table.HeaderCell>
                              <Table.HeaderCell>status</Table.HeaderCell>
                              <Table.HeaderCell>Promotor address</Table.HeaderCell>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {
                              protocolTab.map((res, index, arr) =>
                                <Table.Row key={protocolTab[index].id}>
                                  <Table.Cell>{protocolTab[index].id}</Table.Cell>
                                  <Table.Cell textAlign='center'>{protocolTab[index].nbOfPatients}</Table.Cell>
                                  <Table.Cell>{protocolTab[index].status}</Table.Cell>
                                  <Table.Cell>{protocolTab[index].promoter}</Table.Cell>
                                </Table.Row>
                              )
                            }
                          </Table.Body>
                        </Table>
                      </div>
                      :
                      console.log('')
                  }
                </div>

                <div className='patient-list'>
                  <Header as="h2" color="brown">
                    List of patients
                  </Header>

                  {
                    { nb2 } !== 0
                      ?
                      <div>
                        <Table celled>
                          <Table.Header>
                            <Table.Row>
                              <Table.HeaderCell>ID</Table.HeaderCell>
                              <Table.HeaderCell>Consent</Table.HeaderCell>
                              <Table.HeaderCell>Protocol ID</Table.HeaderCell>
                              <Table.HeaderCell>Address</Table.HeaderCell>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {
                              patientTab.map((res, index, arr) =>
                                <Table.Row key={patientTab[index].id}>
                                  <Table.Cell>{patientTab[index].id}</Table.Cell>
                                  <Table.Cell textAlign='center'>
                                    {
                                      patientTab[index].consent
                                        ?
                                        <Icon color='green' name='checkmark' />
                                        :
                                        <Icon color='red' name="x" />
                                    }
                                  </Table.Cell>
                                  <Table.Cell>{patientTab[index].protocolID}</Table.Cell>
                                  <Table.Cell>{patientTab[index].address}</Table.Cell>
                                </Table.Row>
                              )
                            }
                          </Table.Body>
                        </Table>
                      </div>
                      :
                      console.log('')
                  }

                </div>

              </div>
            </Grid.Column>

            <Grid.Column width={6}>
              <div className="investigator-form-h2">
                <Header as="h2" color="brown">
                  Add a new patient
                </Header>
              </div>
              <Form size="large" onSubmit={this.onFormSubmit}>
                <Form.Group inline>
                  <label>Gender</label>
                  <Form.Field
                    control={Radio}
                    label="M"
                    value="M"
                    checked={value === "M"}
                    onChange={this.handleChange}
                  />
                  <Form.Field
                    control={Radio}
                    label="F"
                    value="F"
                    checked={value === "F"}
                    onChange={this.handleChange}
                  />
                </Form.Group>
                <Form.Field
                  label="Ethereum address"
                  name="ethAddress"
                  value={ethAddress}
                  control="input"
                  required
                  placeholder="0x000..."
                  onChange={(e) => this.setState({ ethAddress: e.target.value })}
                />
                <Form.Field
                  label="Full name"
                  name="fullName"
                  value={fullName}
                  control="input"
                  required
                  placeholder="firstname lastname"
                  onChange={(e) => this.setState({ fullName: e.target.value })}
                />
                <Form.Field
                  label="Address"
                  name="address"
                  value={address}
                  control="input"
                  required
                  placeholder="address"
                  onChange={(e) => this.setState({ address: e.target.value })}
                />
                <Form.Field
                  label="City"
                  name="city"
                  value={city}
                  control="input"
                  required
                  placeholder="city"
                  onChange={(e) => this.setState({ city: e.target.value })}
                />
                <Form.Field>
                  <label>Country</label>
                  <CountryDropdown
                    value={country}
                    onChange={(val) => this.selectCountry(val)}
                  />
                </Form.Field>
                <Form.Field
                  type="tel"
                  label="Telephone"
                  name="telephone"
                  value={telephone}
                  control="input"
                  required
                  placeholder="telephone"
                  onChange={(e) => this.setState({ telephone: e.target.value })}
                />
                <Form.Field
                  type="email"
                  label="Email"
                  name="email"
                  value={email}
                  control="input"
                  required
                  placeholder="world@semantic.ui"
                  onChange={(e) => this.setState({ email: e.target.value })}
                />
                <Form.Field
                  type="date"
                  label="Date of birth"
                  name="birth"
                  value={birth}
                  control="input"
                  required
                  onChange={(e) => this.setState({ birth: e.target.value })}
                />
                <Form.Field
                  control={Select}
                  name='protocol'
                  label='Select the protocol'
                  required
                  options={this.state.options}
                  onChange={(e, data) => this.setState({ protocol: data.value })}
                />
                <Button floated='left' icon labelPosition='left' primary size='small'>
                  <Icon name='user' /> Add Patient
                </Button>
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default AddPatient;
