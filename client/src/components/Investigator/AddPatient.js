import React, { Component } from "react";
import { Grid, Header, Form, Button, Radio, Select } from "semantic-ui-react";
import { CountryDropdown } from "react-country-region-selector";
import EncryptData from "../utils/EncryptData";
import SendToIPFS from "../utils/SendToIPFS";
import FetchFromIPFS from "../utils/FetchFromIPFS";
import "./styles/style.css";

const iv = 16;
const ENCRYPTION_KEY = "fpbyr4386v8hpxdruppijkt3v6wayxmi";

class AddPatient extends Component {
  state = {
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
    protocolsTab: [],
    options: []
  };

  handleChange = async (e, { value }) => await this.setState({ value });

  selectCountry = async (val) => {
    this.setState({ country: val });
  };

  onFormSubmit = async () => {
    await this.getProtocols();
    const obj = {
      gender: this.state.value,
      fullName: this.state.fullName,
      address: this.state.address,
      city: this.state.city,
      country: this.state.country,
      telephone: this.state.telephone,
      email: this.state.email,
      birth: this.state.birth,
      ethAddress: this.state.ethAddress
    };

    // store encrypted data to ipfs
    const encryptedData = EncryptData(JSON.stringify(obj), iv, ENCRYPTION_KEY);
    const cid = await SendToIPFS(encryptedData);

    // store the patient data cid to ethereum
    await this.props.contract.methods.addPatient()


    this.setState({
      fullName: "",
      address: "",
      city: "",
      country: "",
      telephone: "",
      email: "",
      birth: "",
      ethAddress: ""
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

        option.key = id;
        option.text = id;
        option.value = id;


        protocols.push(obj);
        options.push(option);
      }

      this.setState({
        protocolsTab: protocols,
        options: options
      });
      console.log("PROTOCOLS =", this.state.protocolsTab);
      console.log("OPTIONS =", this.state.options);
    }
  }

  componentDidMount = async () => {
    await this.getProtocols();
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
      value,
      protocol
    } = this.state;

    return (
      <div className="investigator-patient">
        <Grid divided relaxed textAlign="left">
          <Grid.Row>
            <Grid.Column width={10}>
              <div className="investigator-form-h2">
                <Header as="h2" color="brown">
                  List of patients
                </Header>
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
                  onChange={(e) => this.setState({ fullName: e.target.value })}
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
                <Button type="submit" color="brown">
                  Submit
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
