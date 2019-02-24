/**
 * https://reactstrap.github.io/components/navbar/
 */
import React, { Component } from 'react';
import {
  Collapse,
  Nav,
  Navbar as BootstrapNavbar,
  NavbarBrand,
  NavLink,
  NavItem,
  NavbarToggler,
} from 'reactstrap';

class Navbar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      collapsed: false
    };
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  render() {
    return (
      <BootstrapNavbar color="dark" dark expand="md">
        <NavbarBrand href="https://build.my/">build.my</NavbarBrand>
        <NavbarToggler onClick={() => this.toggleNavbar()} />
        <Collapse isOpen={this.state.collapsed} navbar>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <NavLink href="https://www.aizatto.com/">aizatto.com</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="https://www.deepthoughtapp.com/">Deep Thought</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="https://github.com/aizatto/build.my">GitHub</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="https://www.linkedin.com/in/aizatto">Linkedin</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </BootstrapNavbar>
    );
  }
}

export default Navbar;
