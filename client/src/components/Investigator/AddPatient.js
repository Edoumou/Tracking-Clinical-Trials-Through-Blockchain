import React, { Component } from "react";
import { Grid, Header, Form, Button, Radio } from "semantic-ui-react";
import "./styles/style.css";

class AddPatient extends Component {
  state = {
    value: "",
  };

  render() {
    const value = this.state.value;
    return (
      <div className="investigator-patient">
        <Grid divided relaxed textAlign="left">
          <Grid.Row>
            <Grid.Column width={10}>
              <Header as="h2">Lis of patients</Header>
            </Grid.Column>
            <Grid.Column width={6}>
              <Header as="h2">Add a new patient</Header>

              <Form>
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
                <Form.Field
                  label="Country"
                  name="country"
                  control="input"
                  required
                  placeholder="country"
                />
                <Form.Field
                  label="Telephone"
                  name="telephone"
                  control="input"
                  required
                  placeholder="telephone"
                />
                <Form.Group inline>
                  <label>Gender</label>
                  <Form.Field
                    control={Radio}
                    label="M"
                    value="M"
                    checked={value === "M"}
                    onChange={(e) => this.setState({ gender: e.target.value })}
                  />
                  <Form.Field
                    control={Radio}
                    label="F"
                    value="F"
                    checked={value === "F"}
                    onChange={(e) => this.setState({ gender: e.target.value })}
                  />
                </Form.Group>
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
