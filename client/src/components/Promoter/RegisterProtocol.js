import React, { Component } from 'react';
import ReactFileReader from 'react-file-reader';
import { Button, Form, Icon, Table } from 'semantic-ui-react';
import "./styles/style.css";
import EncryptData from '../utils/EncryptData';
import SendToIPFS from '../utils/SendToIPFS';

const iv = 16;
const ENCRYPTION_KEY = 'fpbyr4386v8hpxdruppijkt3v6wayxmi';

class RegisterProtocol extends Component {
    state = {
        center: '',
        category: '',
        investigatorAddress: '',
        filename: '',
        base64: '',
        protocolsTab: [],
        nbOfProtocols: 0,
        msg: ''
    }

    onFormSubmit = async e => {
        e.preventDefault();

        if (this.state.base64 === '') {
            return alert("You must select the protocole file first");
        }

        const num = await this.props.contract.methods.getProtocoleNumerotation(
            this.state.center, this.state.category
        ).call({ from: this.props.account });
        
        // compose the protocol ID
        const numStr = String(num);
        let numerotation;
        if (numStr.length === 1) {
            numerotation = `00${numStr}`;
        } else if (numStr.length === 2) {
            numerotation = `0${numStr}`;
        } else {
            numerotation = numStr;
        }

        const protocolID = `P${this.state.center}${this.state.category}${numerotation}FR`;
        const encryptedProtocol = EncryptData(this.state.base64, iv, ENCRYPTION_KEY);
        const cid = await SendToIPFS(encryptedProtocol);

        const receipt = await this.props.contract.methods.registerProtocol(
            protocolID, cid, this.state.center, this.state.category, this.state.investigatorAddress
        ).send({ from: this.props.account });

        console.log("CID =", cid);
        console.log("RECIPT =", receipt);
        console.log("NUMEROTATION =", numerotation);

        this.setState({ msg: 'ok' });

        await this.getProtocols();

        this.setState({
            center: '',
            category: '',
            investigatorAddress: '',
            base64: '',
            filename: ''
        });
    }

    handleFiles = async files => {
        this.setState({
            base64: files.base64,
            filename: files.fileList[0].name
        })
    }

    componentDidMount = async () => {
        await this.getProtocols();
    }

    getProtocols = async () => {
        const nb = await this.props.contract.methods.nbOfProtocolsRegistered()
            .call({ from: this.props.account });
        this.setState({ nbOfProtocols: nb });

        let protocolTab = [];
        for (let i = 0; i < nb; i++) {
            const id = await this.props.contract.methods.protocolsID(i).call({ from: this.props.account });

            const protocol = await this.props.contract.methods.protocols(id)
                .call({ from:  this.props.account });

            let struct = {};
            struct.id = id;
            struct.cid = protocol['cid'];
            struct.status = protocol['status'];
            struct.authorized = protocol['authorized'];
            struct.promoter = protocol['promoter'];
            struct.investigator = protocol['investigator'];

            if (protocol['promoter'] === this.props.account) {
                protocolTab.push(struct);
            }
        }
        
        this.setState({ protocolsTab: protocolTab});
    }

    render() {
        const { center, category, investigatorAddress } = this.state;
        const nb = this.state.nbOfProtocols;
        let Tab = [];
        Tab = this.state.protocolsTab;
        console.log("TAB =", Tab);
        return (
            <div className="promoter">             
                <div className="pomoter-form">
                    <Form size="large" onSubmit={this.onFormSubmit}>
                        <Form.Group>
                            <Form.Field width="4">
                                <ReactFileReader fileTypes={[".csv", ".xlsx", ".pdf",".zip"]} base64={true} handleFiles = {this.handleFiles}>
                                    <button className="ui brown button">
                                    Select the protocol file
                                    </button>
                                </ReactFileReader>   
                            </Form.Field>
                            <Form.Field label='Center' name='center' value={center} control='select' width="2" required onChange={e => this.setState({ center: e.target.value })}>
                                <option value=''></option>
                                <option value='75'>75</option>
                                <option value='92'>92</option>
                                <option value='93'>93</option>
                                <option value='94'>94</option>
                                <option value='95'>95</option>
                            </Form.Field>
                            <Form.Field label='Category' name='category' value={category} control='select' width="2" required onChange={e => this.setState({ category: e.target.value })}>
                                <option value=''></option>
                                <option value='A'>A</option>
                                <option value='B'>B</option>
                                <option value='C'>C</option>
                            </Form.Field>
                            <Form.Field
                                label='Investigator address'
                                name='investigatorAddress'
                                value={investigatorAddress}
                                placeholder="Investigator address"
                                control='input'
                                width="7"
                                required
                                onChange={e => this.setState({ investigatorAddress: e.target.value })}
                            />
                            <Button primary>Submit</Button>          
                        </Form.Group>
                    </Form>              
                </div>

                {
                    this.state.base64 !== ''
                    ?
                        <div className="file-render">
                            <h3>{this.state.filename}</h3>
                            <embed src={this.state.base64}  type="application/pdf" width="50%" height="850px" scrolling = "no"></embed>
                        </div>
                    :
                        console.log("")                    
                }
                
                <div className="promoter-tab">
                    {
                        {nb} !== 0
                        ?
                            <Table celled>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>ID</Table.HeaderCell>
                                        <Table.HeaderCell>CID</Table.HeaderCell>
                                        <Table.HeaderCell>Investigator</Table.HeaderCell>
                                        <Table.HeaderCell>Authorization</Table.HeaderCell>
                                        <Table.HeaderCell>Status</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>   
                                    {
                                        Tab.map((res, index, arr) =>
                                            <Table.Row key={index}>
                                                <Table.Cell>{Tab[index].id}</Table.Cell>
                                                <Table.Cell>{Tab[index].cid}</Table.Cell>
                                                <Table.Cell>{Tab[index].investigator}</Table.Cell>
                                                <Table.Cell textAlign="center">{Tab[index].authorized === false ? <Icon name="hourglass outline" /> : <Icon name='checkmark' /> }</Table.Cell>
                                                <Table.Cell>{Tab[index].status}</Table.Cell>
                                            </Table.Row>
                                        )
                                    }                                                                           
                                </Table.Body>
                            </Table>
                        :
                            console.log("")

                        }
                </div>
                
            </div>
        )
    }
}

export default RegisterProtocol
