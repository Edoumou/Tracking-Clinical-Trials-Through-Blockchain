import React, { Component } from 'react';
import { Button, Form, Grid,Card, Image } from 'semantic-ui-react';
import EncryptData from '../utils/EncryptData';
import SendToIPFS from '../utils/SendToIPFS';
import FetchFromIPFS from '../utils/FetchFromIPFS';

const iv = 16;
const ENCRYPTION_KEY = 'fpbyr4386v8hpxdruppijkt3v6wayxmi';

class AddInvestigator extends Component {
    state = {
        fullName: '',
        address: '',
        company: '',
        nbOfInvestigators: 0,
        investigators: []
    }

    onFormSubmit = async () => {
        console.log("NAME =", this.state.fullName);
        console.log("COMPANY =", this.state.company);
        console.log("address =", this.state.address);

        const obj = {
            fullName: this.state.fullName,
            company: this.state.company,
            address: this.state.address,
            description: `${this.state.fullName} is a full investigator at ${this.state.company}. To know more...`
        }

        // store encrypted data to ipfs
        const encryptedData = EncryptData(JSON.stringify(obj), iv, ENCRYPTION_KEY);
        const cid = await SendToIPFS(encryptedData);

        // store the investigator address and the data cid to ethereum
        await this.props.contract.methods.addInvestigator(
            this.state.address, cid
        ).send({ from: this.props.account });

        //let addr = receipt.events.promoterAdded.returnValues[0];
        this.setState({
            address: '',
            fullName: '',
            company: ''
        });

        this.getInvestigators();

    }

    componentDidMount = async () => {
        await this.getInvestigators();
    }

    getInvestigators = async () => {
        const nb = await this.props.contract.methods.nbOfInvestigators()
            .call({from: this.props.account});
        this.setState({ nbOfInvestigators: nb });

        let investigatorTab = [];
        for (let i = 0; i< nb; i++) {
            const investigator = await this.props.contract.methods.investigators(i)
                .call({ from: this.props.account });

            let encodedData = await FetchFromIPFS(investigator.cid, ENCRYPTION_KEY);
            let data = JSON.parse(encodedData);

            investigatorTab.push(data);
            
        }

        this.setState({ investigators: investigatorTab });
    }

    render() {
        const { address, fullName, company } = this.state;
        const nb = this.state.nbOfInvestigators;
        let Tab = [];
        Tab = this.state.investigators;

        return (
            <div>
                <div className="admin-h1">
                  <h1>Add an investigator</h1>
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

                <div className="admin-grid">
                    {
                        {nb} !== 0
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
                                                    <Card.Meta>Promoter at {Tab[index].company}</Card.Meta>
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

            </div>
        )
    }
}

export default AddInvestigator
