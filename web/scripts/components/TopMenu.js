import React, {Component, PropTypes} from 'react'
// import {Nav, NavItem } from 'react-bootstrap';
import {Link} from 'react-router';
// import { LinkContainer, IndexLinkContainer } from 'react-router-bootstrap';

const TopMenu = React.createClass({
    render: function runTopMenuRender () {
        const pathname = this.props.rootProps.router.location.pathname;
        const padMenu  = {marginBottom:10};
        
        return (<div>top menu</div>
        )
            // <Nav bsStyle="tabs" activeKey="1" style={padMenu}>
            //     <NavItem href="#/" eventKey={1} title="home" active={(pathname == '/' && pathname.length === 1) ? true : false}>Home</NavItem>
            //     <NavItem href="#/login" eventKey={3} title="Login" active={(pathname.indexOf == 'login' > -1) ? true : false}>Login</NavItem>
            //     <NavItem href="#/dbs" eventKey={2} active={(pathname.indexOf('dbs') > -1) ? true : false}>Databases</NavItem>
            // </Nav>
    }
});

export default TopMenu;