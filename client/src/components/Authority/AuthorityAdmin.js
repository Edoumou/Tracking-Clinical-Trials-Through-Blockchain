import React, { Component } from 'react';
import { Button, Form, Message, Grid, Card, Image, Divider } from 'semantic-ui-react';
import EncryptData from '../utils/EncryptData';
import SendToIPFS from '../utils/SendToIPFS';
import FetchFromIPFS from '../utils/FetchFromIPFS';
import Header from './Header';

require('dotenv').config();

class AuthorityAdmin extends Component {
    state = {
        ci: '',
        fullName: '',
        address: '',
        description: '',
        company: '',
        authorityAddress: '',
        message: '',
        nbOfAuthorities: 0,
        authorities: []
    }

    onFormSubmit = async () => {
        console.log("NAME =", this.state.fullName);
        console.log("COMPANY =", this.state.company);
        console.log("address =", this.state.address);

        const obj = {
            fullName: this.state.fullName,
            company: this.state.company,
            address: this.state.address,
            description: `${this.state.fullName} is a full authority at ${this.state.company}. To know more...`
        }

        // store encrypted data to ipfs
        const encryptedProtocol = EncryptData(JSON.stringify(obj), 16, process.env.REACT_APP_ENCRYPTION_KEY);
        const cid = await SendToIPFS(encryptedProtocol);

        // store the promoter address and the data cid to ethereum
        await this.props.contract.methods.addAuthority(
            this.state.address, cid
        ).send({ from: this.props.account });

        //let addr = receipt.events.promoterAdded.returnValues[0];
        this.setState({
            //promoterAddress: receipt.events.promoterAdded.returnValues[0],
            message: 'ok',
            address: '',
            fullName: '',
            company: ''
        });

        this.getAuthorities();

    }

    componentDidMount = async () => {
        await this.getAuthorities();
    }

    onMessageClose = async () => {
        this.setState({ message: '' });
    }

    getAuthorities = async () => {
        const nb = await this.props.contract.methods.nbOfAuthorities()
            .call({ from: this.props.account });
        this.setState({ nbOfAuthorities: nb });

        let authorityTab = [];
        for (let i = 0; i < nb; i++) {
            const authority = await this.props.contract.methods.authorities(i)
                .call({ from: this.props.account });

            let encodedData = await FetchFromIPFS(authority.cid, process.env.REACT_APP_ENCRYPTION_KEY);
            let data = JSON.parse(encodedData);

            authorityTab.push(data);

        }

        this.setState({ authorities: authorityTab });
    }

    render() {
        const { address, fullName, company, authorityAddress, message } = this.state;
        const nb = this.state.nbOfAuthorities;
        let Tab = [];
        Tab = this.state.authorities;


        // fetch promoters address and cids from ethereum
        console.log("NB =", this.state.nbOfAuthorities);
        console.log("Promoters =", this.state.authorities);

        return (
            <div>
                <Header
                    contract={this.props.contract}
                    role={this.props.role}
                    account={this.props.account}
                />

                <div>
                    <div className="admin-h1">
                        <h1>Add an authority</h1>
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
                                    label='Authority address'
                                    name='address'
                                    value={address}
                                    placeholder="Authority Address"
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

                    <div className="admin-grid">
                        {
                            { nb } !== 0
                                ?
                                <Grid columns={3} divided>
                                    {
                                        Tab.map((res, index, arr) =>
                                            <div className="admin-card" key={index}>
                                                <Card>
                                                    <Card.Content textAlign="left">
                                                        <Image
                                                            floated='right'
                                                            size='mini'
                                                            src='https://react.semantic-ui.com/images/avatar/large/steve.jpg'
                                                        />
                                                        <Card.Header>{Tab[index].fullName}</Card.Header>
                                                        <Card.Meta>Authority at {Tab[index].company}</Card.Meta>
                                                        <Card.Description>
                                                            {Tab[index].description}.
                                                        <br></br>
                                                            <br></br>
                                                        Address: <strong>{Tab[index].address.substr(0, 10)}</strong>...
                                                        <hr></hr>
                                                        </Card.Description>
                                                    </Card.Content>
                                                </Card>
                                            </div>
                                        )
                                    }
                                </Grid>
                                :
                                console.log("")
                        }
                    </div>


                    <div className="promoter-admin-msg">
                        {
                            { message } !== ''
                                ?
                                console.log("")
                                :
                                <Message positive onDismiss={this.onMessageClose}>
                                    <Message.Header>Authority added</Message.Header>
                                    <p>
                                        Authority with address {authorityAddress} as been added.
                                </p>
                                </Message>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default AuthorityAdmin
