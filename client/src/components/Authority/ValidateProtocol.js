import React, { Component } from 'react';
import { Button, Table, Icon } from 'semantic-ui-react';

class ValidateProtocol extends Component {
    state = {
        nbOfProtocols: 0,
        protocolID: '',
        protocolsTab: []
    }

    onButtonClick = async (id) => {
        await this.props.contract.methods.validateProtocol(id)
            .send({ from: this.props.account });

        await this.getProtocols();
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

            protocolTab.push(struct);
        }
        
        this.setState({ protocolsTab: protocolTab});
    }

    render() {
        const nb = this.state.nbOfProtocols;
        let Tab = [];
        Tab = this.state.protocolsTab;

        return (
            <div>
                    <div className="promoter-tab">
                        {
                            {nb} !== 0
                            ?
                                <div>
                                    <h2>Protocols</h2>
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
                                                        <Table.Cell textAlign="center">
                                                            {
                                                                Tab[index].authorized === false
                                                                ?
                                                                    <Button compact primary onClick = {() => this.onButtonClick(Tab[index].id)}>
                                                                        Authorize
                                                                    </Button> 
                                                                :
                                                                    <Icon color='green' name='checkmark' />
                                                            }
                                                        </Table.Cell>
                                                        <Table.Cell>{Tab[index].status}</Table.Cell>
                                                    </Table.Row>
                                                )
                                            }                                                                           
                                        </Table.Body>
                                    </Table>
                                </div>
                            :
                                console.log("")

                            }
                    </div>
            </div>
        )
    }
}

export default ValidateProtocol
