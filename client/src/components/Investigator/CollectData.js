import React, { Component } from "react";
import { Header, Grid, Button, Icon, Segment, Table, Form, Select } from "semantic-ui-react";
import ReactFileReader from 'react-file-reader';
import { ExcelRenderer } from 'react-excel-renderer';
import EncryptData from "../utils/EncryptData";
import SendToIPFS from "../utils/SendToIPFS";
import FetchFromIPFS from "../utils/FetchFromIPFS";
import ChartBar from '../charts/ChartBar';
import "./styles/style.css";

const iv = 16;
const ENCRYPTION_KEY = 'fpbyr4386v8hpxdruppijkt3v6wayxmi';

class CollectData extends Component {
  state = {
    ID: '',
    filename: '',
    base64: '',
    data: [],
    msg: '',
    msg1: '',
    msg2: '',
    nbObservation: 0,
    numericalData: [],
    header: [],
    showfile: false,
    nbOfPatients: 0,
    patient: '',
    cid: '',
    SSE: 0,
    listOfPatients: [],
    options: [],
    cidOptions: [],
    dataFromIPFS: [],
    chartW: [],
    chartBS: [],
    chartSE: [],
    cidFilename: '',

  }

  onLoadFile = async files => {
    this.setState({
      base64: files.base64,
      filename: files.fileList[0].name,
      cidFilename: ''
    });

    await ExcelRenderer(files.fileList[0], (err, res) => {
      if (err) {
        console.log("Error : ", err);
      } else {
        this.setState({
          data: res.rows
        });
        this.setState({ msg: 'ok' });
      }
    });

    this.setState({
      nbObservation: this.state.data[8][1]
    });

    // create a array containing patient data to show on the page
    let Tab = new Array(4);
    for (let i = 0; i < 4; i++) {
      Tab[i] = [];
    }

    for (let i = 3; i < 7; i++) {
      for (let j = 0; j < this.state.nbObservation + 1; j++) {
        Tab[i - 3][j] = this.state.data[i][j + 2];
      }
    }

    this.setState({
      ID: this.state.data[10][1],
      numericalData: Tab
    });

    // define the header
    let head = [];
    for (let i = 0; i < this.state.nbObservation; i++) {
      head[i] = `Trial ${i + 1}`;
    }

    this.setState({ header: head });

    console.log("HEADER =", this.state.header);
    console.log("NUM DATA =", this.state.numericalData);


    this.setState({ SSE: this.state.numericalData[3][this.state.nbObservation] });
    console.log("SSE =", this.state.SSE);

  }

  onLoadCIDFile = async files => {
    this.setState({
      base64: files.base64,
      cidFilename: files.fileList[0].name,
      filename: ''
    });

    await ExcelRenderer(files.fileList[0], (err, res) => {
      if (err) {
        console.log("Error : ", err);
      } else {
        this.setState({
          data: res.rows
        });
        this.setState({ msg: 'ok' });
      }
    });

    this.setState({
      nbObservation: this.state.data[8][1]
    });

    // create a array containing patient data to show on the page
    let Tab = new Array(4);
    for (let i = 0; i < 4; i++) {
      Tab[i] = [];
    }

    for (let i = 3; i < 7; i++) {
      for (let j = 0; j < this.state.nbObservation + 1; j++) {
        Tab[i - 3][j] = this.state.data[i][j + 2];
      }
    }

    this.setState({
      ID: this.state.data[10][1],
      numericalData: Tab
    });

    // define the header
    let head = [];
    let chartW = [];
    let chartBS = [];
    let chartSE = [];
    for (let i = 0; i < this.state.nbObservation; i++) {
      head[i] = `Trial ${i + 1}`;

      let objW = {};
      let objBS = {};
      let objSE = {};

      objW.label = `Trial ${i + 1}`;
      objW.y = this.state.numericalData[0][i + 1];
      chartW.push(objW);

      objBS.label = `Trial ${i + 1}`;
      objBS.y = this.state.numericalData[1][i + 1];
      chartBS.push(objBS);

      objSE.label = `Trial ${i + 1}`;
      objSE.y = this.state.numericalData[2][i + 1];
      chartSE.push(objSE);
    }

    this.setState({
      chartW: chartW,
      chartBS: chartBS,
      chartSE: chartSE
    })

    this.setState({ header: head });
    console.log("Weight =", this.state.chartW);
    console.log("Blood sugar =", this.state.chartBS);
    console.log("Side effects =", this.state.chartSE);



    console.log("HEADER =", this.state.header);
    console.log("NUM DATA =", this.state.numericalData);
  }

  onButtonClick = async () => {
    console.log("DATA = ", this.state.data);
    console.log("BASE64 =", this.state.base64);

    const obj = {
      data: this.state.base64
    }

    const encryptedData = EncryptData(JSON.stringify(obj), iv, ENCRYPTION_KEY);
    const cid = await SendToIPFS(encryptedData);
    console.log("ID HERE =", this.state.ID);
    const receipt = await this.props.contract.methods.storeDataCID(this.state.ID, cid, this.state.SSE)
      .send({ from: this.props.account });
    console.log("ID =", this.state.ID)
    console.log("CID =", cid);
    console.log("RECEIPT =", receipt);

    this.setState({
      filename: '',
      header: [],
      showfile: true
    });
  }

  getPatients = async () => {
    // get the number of registered patients
    const nb = await this.props.contract.methods.nbOfPatients()
      .call({ from: this.props.account });

    let options = [];

    for (let i = 0; i < nb; i++) {
      const id = await this.props.contract.methods.patientsID(i)
        .call({ from: this.props.account });

      const patient = await this.props.contract.methods.patients(id)
        .call({ from: this.props.account });

      if (patient["investigator"] === this.props.account) {
        const option = {};
        option.key = id;
        option.text = id;
        option.value = id;

        options.push(option);
      }
    }

    await this.setState({ options: options });

    console.log("Patient =", this.state.patient);
  }

  componentDidMount = async () => {
    await this.getPatients();
  }

  onPatientButtonClick = async () => {
    this.setState({ msg1: 'ok' });
    console.log("Patient =", this.state.patient);

    let Tab = [];
    Tab = await this.props.contract.methods.getDataCID(this.state.patient)
      .call({ from: this.props.account });
    console.log("TAB =", Tab);
    const options = [];
    Tab.map((res, index, arr) => {
      if (index !== 0) {
        const option = {};
        option.key = index;
        option.text = index;
        option.value = res;

        options.push(option);
      }

      return true;
    })

    this.setState({ cidOptions: options });

    console.log("CIDs =", Tab);
    console.log("OPTIONS TAB =", this.state.cidOptions);
  }

  onCIDButtonClick = async () => {
    let data = await FetchFromIPFS(this.state.cid, ENCRYPTION_KEY);
    this.setState({
      msg2: 'ok',
      dataFromIPFS: JSON.parse(data).data
    })

    console.log('SELECTED CID =', this.state.cid);
    console.log('DATA FROM IPFS =', this.state.dataFromIPFS);
  }

  render() {
    return (
      <div className='patient-data'>
        <Grid divided relaxed textAlign="left">
          <Grid.Row>

            <Grid.Column width={9}>
              <Header as='h2' color='violet'>
                Upload the file that contains new data
              </Header>
              <Segment.Group horizontal>
                <Segment floated='left'>
                  <div className="file-load">
                    <ReactFileReader fileTypes={[".csv", ".xlsx", ".pdf", ".zip"]} base64={true} multipleFiles={true} handleFiles={this.onLoadFile}>
                      <Button type="submit" color="brown">
                        Upload the file
                      </Button>
                    </ReactFileReader>
                  </div>
                </Segment>
                <Segment floated='left'>
                  {
                    this.state.filename !== ''
                      ?
                      <Button disabled>
                        {this.state.filename}
                      </Button>
                      :
                      console.log('')
                  }
                </Segment>
                <Segment floated='left'>
                  {
                    this.state.filename !== ''
                      ?
                      <div className='sent-data-btn'>
                        <Button primary onClick={this.onButtonClick}>
                          <Icon name='send' /> Send data
                        </Button>
                      </div>
                      :
                      console.log('')
                  }
                </Segment>
              </Segment.Group>

              {
                this.state.header.length !== 0 || this.state.chartW.length !== 0
                  ?
                  <div className='trial-tab'>
                    <Table celled definition>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell />
                          {
                            this.state.header.map((res, index) =>
                              <Table.HeaderCell key={index}>{res}</Table.HeaderCell>
                            )
                          }
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {
                          this.state.numericalData.map((res, index, arr) =>
                            <Table.Row key={index}>
                              {
                                res.map((r, i, a) =>
                                  <Table.Cell key={i} textAlign='right'>{r}</Table.Cell>
                                )
                              }
                            </Table.Row>
                          )
                        }
                      </Table.Body>
                    </Table>
                  </div>
                  :
                  console.log('')
              }

            </Grid.Column>

            <Grid.Column width={7}>
              <Header as='h2' color='violet'>
                Consult patient Data
              </Header>

              <div>
                <Form size="large">
                  <Form.Group>
                    <Form.Field
                      control={Select}
                      name='patient'
                      label='Select patient ID'
                      required
                      options={this.state.options}
                      onChange={(e, data) => this.setState({ patient: data.value })}
                    />
                    <Button primary onClick={this.onPatientButtonClick}>
                      Get List of CIDs
                    </Button>
                  </Form.Group>
                  {
                    this.state.msg1 !== ''
                      ?
                      <Form.Group>
                        <Form.Field
                          control={Select}
                          name='cid'
                          label='Observation number'
                          required
                          options={this.state.cidOptions}
                          onChange={(e, data) => this.setState({ cid: data.value })}
                        />
                        <Button primary onClick={this.onCIDButtonClick}>
                          Downold data
                        </Button>
                      </Form.Group>
                      :
                      console.log('')
                  }

                </Form>
              </div>
              <div className='patient-data-file'>
                <iframe
                  type="data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  src={this.state.dataFromIPFS}
                  width="0"
                  height="0"
                  title="data"
                />
              </div>
              {
                this.state.msg2 !== ''
                  ?
                  <div className="file-load">
                    <ReactFileReader fileTypes={[".csv", ".xlsx", ".pdf", ".zip"]} base64={true} multipleFiles={true} handleFiles={this.onLoadCIDFile}>
                      <Button type="submit" color="brown">
                        Upload the file
                      </Button>
                    </ReactFileReader>
                  </div>
                  :
                  console.log('')
              }

            </Grid.Column>

          </Grid.Row>
        </Grid>

        {
          this.state.chartW.length !== 0
            ?
            <div className='patient-chart'>
              <div className='chart-header'>
                <Header as='h2' color='red'>
                  Charts for Weight, Blood sugar and Side effects
                </Header>
              </div>

              <Grid columns='three' divided>
                <Grid.Row>
                  <Grid.Column>
                    <ChartBar
                      title="Weight"
                      yTitle="Weight"
                      name="Observation"
                      data={this.state.chartW}
                    />
                  </Grid.Column>
                  <Grid.Column>
                    <ChartBar
                      title="Blood sugar"
                      yTitle="BS"
                      name="Observation"
                      data={this.state.chartBS}
                    />
                  </Grid.Column>
                  <Grid.Column>
                    <ChartBar
                      title="Side effects"
                      yTitle="SE"
                      name="Observation"
                      data={this.state.chartSE}
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </div>

            :
            console.log('')
        }


        {
          this.state.showfile
            ?
            <div className='patient-data-file'>
              <iframe
                type="data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                src={this.state.base64}
                width="0"
                height="0"
                title="data"
              />
            </div>
            :
            console.log('')
        }
      </div>
    );
  }
}

export default CollectData;
