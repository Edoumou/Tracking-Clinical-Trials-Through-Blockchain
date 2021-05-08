import React, { Component } from "react";
import { Grid, Header, Form, Button, Radio } from "semantic-ui-react";
import {
  CountryDropdown,
  RegionDropdown,
  CountryRegionData,
} from "react-country-region-selector";
import "./styles/style.css";

class AddPatient extends Component {
  state = {
    gender: "",
    country: "",
  };

  handleChange = async (e, { value }) => await this.setState({ value });

  selectCountry = async (val) => {
    this.setState({ country: val });
  };

  onFormSubmit = async () => {
    console.log("VALUE =", this.state.value);
    console.log("CONTRY =", this.state.country);
  };

  render() {
    const { value, country } = this.state;
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
                  label="Full name"
                  name="fullName"
                  control="input"
                  required
                  placeholder="firstname lastname"
                />
                <Form.Field
                  label="Address"
                  name="address"
                  control="input"
                  required
                  placeholder="address"
                />
                <Form.Field
                  label="City"
                  name="city"
                  control="input"
                  required
                  placeholder="city"
                />
                <Form.Field>
                  <label>Country</label>
                  <CountryDropdown
                    value={country}
                    onChange={(val) => this.selectCountry(val)}
                  />
                </Form.Field>
                <Form.Field
                  label="Telephone"
                  name="telephone"
                  control="input"
                  required
                  placeholder="telephone"
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
