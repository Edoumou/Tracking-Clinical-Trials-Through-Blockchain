import React, { Component } from 'react';
import { Table, Header, Button } from "semantic-ui-react";
import './styles/style.css'

class RevokeConsent extends Component {
    state = {
        ID: '',
        nbOfPatients: 0,
        patientsTab: []
    }

    getPatients = async () => {
        // get the number of registered patients
        const nb = await this.props.contract.methods.nbOfPatients()
            .call({ from: this.props.account });
        this.setState({ nbOfPatients: nb });

        let patients = [];

        for (let i = 0; i < nb; i++) {
            const id = await this.props.contract.methods.patientsID(i)
                .call({ from: this.props.account });

            const patient = await this.props.contract.methods.patients(id)
                .call({ from: this.props.account });

            if (patient["investigator"] === this.props.account) {
                const obj = {};

                obj.id = id;
                obj.protocolID = patient["protocolID"];
                obj.address = patient["patient"];
                obj.consent = patient["consent"];

                patients.push(obj);
            }
        }

        this.setState({ patientsTab: patients });
        console.log("PATIENTS =", this.state.patientsTab);
    }

    onButtonClick = async (index) => {
        console.log("Index =", index);
        let patientID = this.state.patientsTab[index].id;
        let protocolID = this.state.patientsTab[index].protocolID;
        let patientAddress = this.state.patientsTab[index].address;

        console.log(patientID, protocolID, patientAddress);
        await this.props.contract.methods.revokeConsent(patientID, protocolID, patientAddress)
            .send({ from: this.props.account });

        await this.getPatients();
    }

    componentDidMount = async () => {
        await this.getPatients();
    }
    render() {
        let patientTab = [];
        patientTab = this.state.patientsTab;
        console.log("PATIENT TAB =", patientTab);
        return (
            <div className='revoke-consent'>
                <Header as="h2" color="brown">
                    Revoke patient consent
                </Header>

                {
                    this.state.nbOfPatients !== 0
                        ?
                        <div>
                            <Table celled>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Patient ID</Table.HeaderCell>
                                        <Table.HeaderCell>Protocol ID</Table.HeaderCell>
                                        <Table.HeaderCell>Address</Table.HeaderCell>
                                        <Table.HeaderCell>Consent</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {
                                        patientTab.map((res, index, arr) =>
                                            <Table.Row key={patientTab[index].id}>
                                                <Table.Cell>{patientTab[index].id}</Table.Cell>
                                                <Table.Cell>{patientTab[index].protocolID}</Table.Cell>
                                                <Table.Cell>{patientTab[index].address}</Table.Cell>
                                                <Table.Cell textAlign='center'>
                                                    <Button negative size='small' onClick={() => this.onButtonClick(index)}>
                                                        Revoke
                                                    </Button>
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                    }
                                </Table.Body>
                            </Table>
                        </div>
                        :
                        console.log('')
                }

            </div>
        )
    }
}

export default RevokeConsent
