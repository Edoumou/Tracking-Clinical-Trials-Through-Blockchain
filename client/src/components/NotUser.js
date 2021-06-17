import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Card, Image } from 'semantic-ui-react';
import headerImage from '../images/header2.jpeg'
import '../App.css';


class NotUser extends Component {
  render() {
    return (
      <div>

        <div className="header-img-notuser">
          <Card fluid>
            <div className="header-img">
              <Image
                src={headerImage}
                size="large"
              />
            </div>
          </Card>
        </div>

        <div className="metamask-connect">
          <div className="ui warning message">
            <div className="header">
              <h1>Connect to your metamask account first</h1>
            </div>
            <br></br>
            <strong>
              Use the account you registered with when you got enrolled.
              <br></br>
              To interact with the Dapp follow the instructions on my Github page here
              [
                <a href="https://github.com/Edoumou/Tracking-Clinical-Trials-Through-Blockchain/blob/main/README.md" target="_blank" rel="noreferrer">
                Github
                </a>
              ]
            </strong>
          </div>
        </div>
      </div>
    );
  }
}

export default NotUser
