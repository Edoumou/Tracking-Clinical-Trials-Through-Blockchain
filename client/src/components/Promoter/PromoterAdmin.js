import React, { Component } from 'react';
import { Button, Form, Message, Grid, Card, Image, Divider } from 'semantic-ui-react';
import Header from './Header';
import './styles/style.css';

class PromoterAdmin extends Component {
    state = {
        ci: '',
        fullName: '',
        address: '',
        description: '',
        company: '',
        promoterAddress: '',
        message: ''
    }

    onFormSubmit = async () => {
        console.log("address =", this.state.address);
        
        const receipt = await this.props.contract.methods.addPromoter(
            this.state.address
        ).send({ from: this.props.account });

        //let addr = receipt.events.promoterAdded.returnValues[0];
        this.setState({
            promoterAddress: receipt.events.promoterAdded.returnValues[0],
            message: 'ok',
            address: '',
            fullName: '',
            company: ''
        });

    }

    onMessageClose = async () => {
        this.setState({ message: '' });
    }

  render() {
    const { address, fullName, company, promoterAddress, message } = this.state;

    return (
        <div>
            <Header
                contract = {this.props.contract}
                role = {this.props.role}
                account = {this.props.account}
            />
            
            <div>
                <div className="admin-h1">
                    <h1>Add a promoter</h1>
                </div>
                
                <div className="admin-form">
                    <Form size="large" onSubmit={this.onFormSubmit}>
                        <Form.Group>
                            <Form.Field
                                label='Name'
                                name='fullName'
                                value={fullName}
                                placeholder='Full Name'
                                control='input'
                                width='7'
                                required
                                onChange={e => this.setState({ fullName: e.target.value })}
                            />
                            <Form.Field
                                label='Company'
                                name='company'
                                value={company}
                                placeholder='Company'
                                control='input'
                                width='7'
                                required
                                onChange={e => this.setState({ company: e.target.value })}
                            />
                            <Form.Field
                                label='Promoter address'
                                name='address'
                                value={address}
                                placeholder="Promoter Address"
                                control='input'
                                width="10"
                                required
                                onChange={e => this.setState({ address: e.target.value })}
                            />
                            <Button primary>Submit</Button>          
                        </Form.Group>
                    </Form>                    
                </div>

                <div className="admin-divider">
                    <Divider />
                </div>
                

                <div className="promoter-admin-msg">
                    {
                        {message} !== ''
                        ?
                            console.log("")
                        :
                            <Message positive onDismiss={this.onMessageClose}>
                                <Message.Header>Promoter added</Message.Header>
                                <p>
                                    Promoter with address {promoterAddress} as been added.
                                </p>
                            </Message>                        
                    }

                </div>
            </div>

            <div className="admin-grid">
                <Grid columns={3} divided>
                    <Grid.Row>
                        <Grid.Column>
                            <Card>
                                <Card.Content textAlign="left">
                                    <Image
                                        floated='right'
                                        size='mini'
                                        src='https://react.semantic-ui.com/images/avatar/large/steve.jpg'
                                    />
                                    <Card.Header>Samuel Edoumou</Card.Header>
                                    <Card.Meta>Promoter at We-Promoters</Card.Meta>
                                    <Card.Description>
                                        Sam is a full stack Blockchain and react developper IT.
                                        <br></br>
                                        <br></br>
                                        Address: {this.props.account.substr(0, 10)}...
                                        <hr></hr>
                                    </Card.Description>                                    
                                </Card.Content>
                            </Card>
                        </Grid.Column>
                        <Grid.Column>
                            <Card>
                                <Card.Content textAlign="left">
                                    <Image
                                        floated='right'
                                        size='mini'
                                        src='https://react.semantic-ui.com/images/avatar/large/steve.jpg'
                                    />
                                    <Card.Header>Samuel Edoumou</Card.Header>
                                    <Card.Meta>Promoter at We-Promoters</Card.Meta>
                                    <Card.Description>
                                        Sam is a full stack Blockchain and react developper IT.
                                        <br></br>
                                        <br></br>
                                        Address: {this.props.account.substr(0, 10)}...
                                        <hr></hr>
                                    </Card.Description>                                    
                                </Card.Content>
                            </Card>             
                        </Grid.Column>
                        <Grid.Column>
                            <Card>
                                <Card.Content textAlign="left">
                                    <Image
                                        floated='right'
                                        size='mini'
                                        src='https://react.semantic-ui.com/images/avatar/large/steve.jpg'
                                    />
                                    <Card.Header>Samuel Edoumou</Card.Header>
                                    <Card.Meta>Promoter at We-Promoters</Card.Meta>
                                    <Card.Description>
                                        Sam is a full stack Blockchain and react developper IT.
                                        <br></br>
                                        <br></br>
                                        Address: {this.props.account.substr(0, 10)}...
                                        <hr></hr>
                                    </Card.Description>                                    
                                </Card.Content>
                            </Card>                        
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        </div>
    );
  }
}

export default PromoterAdmin
