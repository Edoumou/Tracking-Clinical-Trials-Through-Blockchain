import React, { Component } from 'react';
import { Button, Form, Message } from 'semantic-ui-react';
import Header from './Header';
import './styles/style.css';

class PromoterAdmin extends Component {
    state = {
        address: '',
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
            message: 'ok'
        });
        this.setState({ address: '' });
    }

    onMessageClose = async () => {
        this.setState({ message: '' });
    }

  render() {
    const { address, promoterAddress, message } = this.state;

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
                                label='Promoter address'
                                name='address'
                                value={address}
                                placeholder="Promoter Address"
                                control='input'
                                width="7"
                                required
                                onChange={e => this.setState({ address: e.target.value })}
                            />
                            <Button primary>Submit</Button>          
                        </Form.Group>
                    </Form>                    
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
        </div>
    );
  }
}

export default PromoterAdmin
