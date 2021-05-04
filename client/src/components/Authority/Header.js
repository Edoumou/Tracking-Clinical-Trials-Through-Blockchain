import React, { Component } from 'react';
import { Card, Image } from 'semantic-ui-react';
import headerImage from '../../images/header2.jpeg';
import { Button, Menu, Segment } from 'semantic-ui-react';
import { Link, BrowserRouter, Route, Switch } from 'react-router-dom';
import '../../App.css';
//import './styles/style.css'
//import Header from './Header';
import Home from './Home';
import ValidateProtocol from './ValidateProtocol';
import SuspendTrials from './SuspendTrials';
import ResumeTrials from './ResumeTrials';

class Header extends Component {
    render() {
        const role = this.props.role;

        if (role === 'AUTHORITY ADMIN') {
            return (
                <div className="promoter-admin">
                    <Segment.Group horizontal>
                        <Segment className="seg-left"><strong>{role}</strong></Segment>
                        <Segment className="seg-right"><strong>{this.props.account}</strong></Segment>
                    </Segment.Group>

                    <div className="header-img">
                        <Image
                            src={headerImage}
                            size="large"
                        />
                    </div>
                </div>
            );
        } else {
            return (
                <Card fluid>
                    <Segment.Group horizontal>
                        <Segment className="seg-left"><strong>{role}</strong></Segment>
                        <Segment className="seg-right"><strong>{this.props.account}</strong></Segment>
                    </Segment.Group>

                    <div className="header-img">
                        <Image
                            src={headerImage}
                            size="large"
                        />
                    </div>
                    <Card.Content>
                        <BrowserRouter>
                            <Menu secondary fluid>
                                <Menu.Item style={{fontSize: 12}}>
                                    <Button color='orange' as={Link} to="/authority/home">
                                        Home
                                    </Button>
                                </Menu.Item>
                                <Menu.Item style={{fontSize: 12}}>
                                    <Button color='orange' as={Link} to="/authority/validate-protocol">
                                        Register a protocol
                                    </Button>
                                </Menu.Item>
                                <Menu.Item style={{fontSize: 12}}>
                                    <Button color='orange' as={Link} to="/authority/suspend-trials">
                                        Add Investigators
                                    </Button>
                                </Menu.Item>                                                                  
                            </Menu>

                            <Switch>
                                <Route path="/authority/home">
                                    <Home />
                                </Route>                     
                                <Route path="/authority/validate-protocol">
                                    <ValidateProtocol
                                        contract = {this.props.contract}
                                        account = {this.props.account}
                                    />
                                </Route> 
                                <Route path="/authority/suspend-trials">
                                    <SuspendTrials />
                                </Route>                                       
                            </Switch>
                        </BrowserRouter>
                    </Card.Content>  
                </Card>        
            );            
        }
    }
}

export default Header
