import React, { Component } from "react";
import { Header, Grid, Button, Icon, Segment } from "semantic-ui-react";
import ReactFileReader from 'react-file-reader';
import { OutTable, ExcelRenderer } from 'react-excel-renderer';
import "./styles/style.css";

class CollectData extends Component {
  state = {
    filename: '',
    base64: '',
    data: [],
    msg: '',
    nbObservation: 0,
    numericalData: []
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
    console.log("TAB BEFORE =", Tab);
    console.log("NB OF OBSERVATION =", this.state.nbObservation);
    for (let i = 3; i < 7; i++) {
      for (let j = 0; j < this.state.nbObservation + 1; j++) {
        Tab[i - 3][j] = this.state.data[i][j + 2];
      }

      console.log(this.state.data[i][2], this.state.data[i][3]);
    }

    this.setState({ numericalData: Tab });
    console.log("TAB AFTER =", this.state.numericalData);

    this.state.numericalData.map((res, index, arr) => {
      for (let i = 0; i < this.state.nbObservation + 1; i += 2) {
        console.log(res[i], res[i + 1]);
      }
    })

  }

  onButtonClick = () => {
    console.log("DATA = ", this.state.data);
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
                    <ReactFileReader fileTypes={[".csv", ".xlsx", ".pdf", ".pdf"]} base64={true} multipleFiles={true} handleFiles={this.onLoadFile}>
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
