import React, { Component } from 'react';
import { Card, Image, Segment, Grid } from 'semantic-ui-react';
import headerImage from '../images/header2.jpeg';
import FetchFromIPFS from "./utils/FetchFromIPFS";
import '../App.css';

const ENCRYPTION_KEY = 'fpbyr4386v8hpxdruppijkt3v6wayxmi';

class Patient extends Component {
    state = {
        ID: '',
        protocol: '',
        fullName: '',
        gender: '',
        investigator: '',
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
                this.setState({
                    cid: cids[index],
                    investigator: patient.investigator
                });

                //const encodedData = JSON.parse(await FetchFromIPFS(this.state.cid, ENCRYPTION_KEY));

                //console.log("dATA =", encodedData.data[0]);

                let data = JSON.parse(await FetchFromIPFS(cid, ENCRYPTION_KEY));

                this.setState({
                    ID: data.id,
                    gender: data.gender,
                    protocol: data.protocol,
                    fullName: data.fullName
                });

                console.log("DATA =", this.state.ID, this.state.gender, this.state.fullName, this.state.protocol);
            }

        }
    }

    onButtonClick = async () => {
        await this.props.contract.methods.revokeConsent(this.state.ID)
            .send({ from: this.props.account });
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
                    <Grid columns={2} divided>
                        <Grid.Row stretched>
                            <Grid.Column width={6} textAlign="left">
                                {
                                    this.state.gender !== ''
                                        ?
                                        this.state.gender === 'M'
                                            ?
                                            <Card>
                                                <Image src='https://react.semantic-ui.com/images/avatar/large/steve.jpg' wrapped ui={false} />
                                                <Card.Content>
                                                    <Card.Header>{this.state.fullName}</Card.Header>
                                                    <Card.Meta>ID: {this.state.ID}</Card.Meta>
                                                    <Card.Description>
                                                        Gender: <strong>{this.state.gender}</strong> <br></br>
                                                        Protocol ID: <strong>{this.state.protocol}</strong> <br></br>
                                                        <hr></hr>
                                                        Hi <strong>{this.state.fullName}</strong>! Your are enrolled in the cinical trials
                                                        with the protocol ID <strong>{this.state.protocol}</strong>. <br></br>
                                                        Your investigator address is:
                                                        <br></br>
                                                        {this.state.investigator}

                                                    </Card.Description>
                                                </Card.Content>
                                            </Card>
                                            :
                                            <Card>
                                                <Image src='https://react.semantic-ui.com/images/avatar/large/molly.png' wrapped ui={false} />
                                                <Card.Content>
                                                    <Card.Header>{this.state.fullName}</Card.Header>
                                                    <Card.Meta>ID: {this.state.ID}</Card.Meta>
                                                    <Card.Description>
                                                        Gender: <strong>{this.state.gender}</strong> <br></br>
                                                        Protocol ID: <strong>{this.state.protocol}</strong> <br></br>
                                                        <hr></hr>
                                                        Hi <strong>{this.state.fullName}</strong>! Your are enrolled in the cinical trials
                                                        with the protocol ID <strong>{this.state.protocol}</strong>. <br></br>
                                                        Your investigator address is:
                                                        <br></br>
                                                        {this.state.investigator}

                                                    </Card.Description>
                                                </Card.Content>
                                            </Card>
                                        :
                                        console.log('')
                                }
                            </Grid.Column>
                            <Grid.Column width={10}>

                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>

            </div>
        )
    }
}

export default Patient
