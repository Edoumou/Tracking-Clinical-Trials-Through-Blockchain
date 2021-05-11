import React, { Component } from "react";
import { Header, Grid, Button, Icon, Segment, Table } from "semantic-ui-react";
import ReactFileReader from 'react-file-reader';
import { ExcelRenderer } from 'react-excel-renderer';
import EncryptData from "../utils/EncryptData";
import SendToIPFS from "../utils/SendToIPFS";
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
    nbObservation: 0,
    numericalData: [],
    header: []
  }

  onLoadFile = async files => {
    this.setState({
      base64: files.base64,
      filename: files.fileList[0].name
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
      ID: this.state.data[9][1],
      numericalData: Tab
    });

    // define the header
    let head = [];
    for (let i = 0; i < this.state.nbObservation; i++) {
      head[i] = `Trial ${i + 1}`;
    }

    this.setState({ header: head });

  }

  onButtonClick = async () => {
    console.log("DATA = ", this.state.data);
    console.log("BASE64 =", this.state.base64);

    const obj = {
      data: this.state.base64
    }

    console.log(JSON.stringify(obj));

    const encryptedData = EncryptData(JSON.stringify(obj), iv, ENCRYPTION_KEY);
    const cid = await SendToIPFS(encryptedData);

    const receipt = await this.props.contract.methods.storeDataCID(this.state.ID, cid)
      .send({ from: this.props.account });

    console.log("ID =", this.state.ID)
    console.log("CID =", cid);
    console.log("RECEIPT =", receipt);

    this.setState({
      filename: '',
      header: []
    });
  }

  render() {
    return (
      <div className='patient-data'>
        <Grid divided relaxed textAlign="left">
          <Grid.Row>

            <Grid.Column width={8}>
              <Header as='h2' color='blue'>
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
                this.state.header.length !== 0
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

            <Grid.Column width={8}>

            </Grid.Column>

          </Grid.Row>
        </Grid>

      </div>
    );
  }
}

export default CollectData;
