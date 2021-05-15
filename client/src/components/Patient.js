import React, { Component } from 'react';
import { Card, Image, Segment } from 'semantic-ui-react';
import headerImage from '../images/header2.jpeg'

class Patient extends Component {
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
            </div>
        )
    }
}

export default Patient
