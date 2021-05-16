import React, { Component } from 'react';
import { Header, Card, Image, Segment, Grid } from 'semantic-ui-react';
import headerImage from '../images/header2.jpeg';
import FetchFromIPFS from "./utils/FetchFromIPFS";
import '../App.css';

const iv = 16;
const ENCRYPTION_KEY = 'fpbyr4386v8hpxdruppijkt3v6wayxmi';

class Patient extends Component {
    state = {
        ID: '',
        protocol: '',
        fullName: '',
        cid: '',
        data: {}
    }

    getPatientData = async () => {
        const nbOfPatients = await this.props.contract.methods.nbOfPatients()
            .call({ from: this.props.account });

        for (let i = 0; i < nbOfPatients; i++) {
            const patientID = await this.props.contract.methods.patientsID(i)
                .call({ from: this.props.account });

            const patient = await this.props.contract.methods.patients(patientID)
                .call({ from: this.props.account });

            let cid;
            if (patient.patient === this.props.account) {
                let cids = [];
                cids = await this.props.contract.methods.getDataCID(patientID)
                    .call({ from: this.props.account });
                cid = cids[0];

                let index = cids.length - 1;
                this.setState({ cid: cids[index] });

                const encodedData = await FetchFromIPFS(this.state.cid, ENCRYPTION_KEY)

                console.log("cid =", encodedData);

                let data = JSON.parse(await FetchFromIPFS(cid, ENCRYPTION_KEY));

                this.setState({
                    ID: data.id,
                    protocol: data.protocol,
                    fullName: data.fullName
                });

                console.log("DATA =", this.state.ID, this.state.fullName, this.state.protocol);
            }

        }
    }

    componentDidMount = async () => {
        await this.getPatientData();
    }

    render() {
        return (
            <div className="promoter-admin">
                <Segment.Group horizontal>
                    <Segment className="seg-left">
                        <strong>{this.props.role}</strong>
                    </Segment>
                    <Segment className="seg-right">
                        <strong>{this.props.account}</strong>
                    </Segment>
                </Segment.Group>

                <div className="header-img">
                    <Image src={headerImage} size="large" />
                </div>

                <div className="patient-grid">
                    <Grid columns={2} divided textAlign="left">
                        <Grid.Row stretched>
                            <Grid.Column width={6}>
                                <Header as='h2'>Patient Infos</Header>
                            </Grid.Column>
                            <Grid.Column width={10}>
                                <Header as="h2">We are here</Header>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>

            </div>
        )
    }
}

export default Patient
