import React, { Component } from "react";
import { Button } from "semantic-ui-react";
import ReactFileReader from 'react-file-reader';
import { OutTable, ExcelRenderer } from 'react-excel-renderer';
import "./styles/style.css";

class CollectData extends Component {
  state = {
    base64: '',
    cols: '',
    rows: '',
    data: {}
  }

  onLoadFile = async files => {
    this.setState({ base64: files.base64 });

    ExcelRenderer(files.fileList[0], (err, res) => {
      if (err) {
        console.log("Error : ", err);
      } else {
        console.log("ROWS =", res.rows)
        this.setState({
          cols: res.cols,
          rows: res.rows
        })
      }
    });

    // store data from ipfs to state
    /*     this.state.rows.map((res, id) => {
          if (id !== 0) {
            this.state.data[res[0]] = res[1];
          }
        }); */

    console.log("DATA = ", this.state.data);
  }

  render() {
    return (
      <div>
        <div className="file-load">
          <ReactFileReader fileTypes={[".csv", ".xlsx", ".pdf", ".pdf"]} base64={true} multipleFiles={true} handleFiles={this.onLoadFile}>
            <Button type="submit" color="brown">
              Upload the file
            </Button>
          </ReactFileReader>
        </div>

      </div>
    );
  }
}

export default CollectData;
