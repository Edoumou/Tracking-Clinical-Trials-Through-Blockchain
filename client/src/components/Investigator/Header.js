import React, { Component } from "react";

class Header extends Component {
  render() {
    const role = this.props.role;
    const account = this.props.account;

    return (
      <div>
        <h1>This is the header</h1>
      </div>
    );
  }
}

export default Header;
