import React, { Component } from "react";
import { Card, Image, Segment, Menu, Button } from "semantic-ui-react";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import headerImage from "../../images/header2.jpeg";
import "../../App.css";
import "./styles/style.css";
import Home from "./Home";
import AddPatient from "./AddPatient";
import CollectData from "./CollectData";

class Header extends Component {
  render() {
    const role = this.props.role;
    const account = this.props.account;

    return (
      <Card fluid>
        <Segment.Group horizontal>
          <Segment className="seg-left">
            <strong>{role}</strong>
          </Segment>
          <Segment className="seg-right">
            <strong>{account}</strong>
          </Segment>
        </Segment.Group>

        <div className="header-img">
          <Image src={headerImage} size="large" />
        </div>

        <Card.Content>
          <BrowserRouter>
            <Menu secondary fluid>
              <Menu.Item style={{ fontSize: 12 }}>
                <Button color="orange" as={Link} to="/investigator/home">
                  Home
                </Button>
              </Menu.Item>
              <Menu.Item style={{ fontSize: 12 }}>
                <Button color="orange" as={Link} to="/investigator/add-patient">
                  Add Patient
                </Button>
              </Menu.Item>
              <Menu.Item style={{ fontSize: 12 }}>
                <Button color="orange" as={Link} to="/investigator/add-data">
                  Collect patient Data
                </Button>
              </Menu.Item>
            </Menu>

            <Switch>
              <Route path="/investigator/home">
                <Home />
              </Route>
              <Route path="/investigator/add-patient">
                <AddPatient />
              </Route>
              <Route path="/investigator/add-data">
                <CollectData />
              </Route>
            </Switch>
          </BrowserRouter>
        </Card.Content>
      </Card>
    );
  }
}

export default Header;
