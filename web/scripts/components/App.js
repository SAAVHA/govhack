import React from 'react';
import { Menu, Icon, Label, Container, Sidebar, Segment, Header, Dropdown } from 'semantic-ui-react';
import { Link, hashHistory } from 'react-router';
import R from 'ramda';
import * as stateUpdates from './StateFunctions';
import WhitePageLoader from './WhitePageLoader';

const App = React.createClass({
    getInitialState: function initialState() {
        return {
            loading: false,
            sideMenuVisible: false,
            pageHeader:'Saavha',
            user: {
                id: 1,
                name: 'Justin',
                role: 'user',
                avatar: 'images/avatar/small/christian.jpg'
            },
            reports: {},
            appList: [],
            login: {
                user: '',
                pass: ''
            }
        };
    },
    updateRootState: function (obj) {
        var ns = this.state;

        switch (obj.action) {
            case 'toggleLoading':
                ns = stateUpdates.toggleLoading(this.state);
                break;
            // When user clicks on btn to edit or create a db
            case 'dbSetupStepOne':
                ns = stateUpdates.updateDbSetupToStepOne(this.state, obj.data);
                break;
            // update credentials for new or editing a db connection
            case 'connUpdateCreds':
                ns = stateUpdates.updateDbSetupConnCreds(this.state, obj.data);
                break;

            case 'dbSetupStepTwo':
                ns = stateUpdates.updateDbSetupToStepTwo(this.state);
                break;
            // update user and pass for login page
            case 'updateLoginCreds':
                ns = stateUpdates.updateLoginCreds(this.state, obj.data);
                break;
            
            case 'toggleSidebar':
                ns = stateUpdates.toggleSidebar(this.state);
                break;

            case 'updatePageHeader':
                ns = stateUpdates.updatePageHeader(this.state, obj.data);
                break;

            case 'loadClientAppList':
                ns = stateUpdates.loadClientApps(this.state)
                    .then(function (rs) { this.setState(rs);}.bind(this));
                break;

            case 'loadPastAudits':
                ns = stateUpdates.loadPreviousAudits(this.state, obj.id)
                    .then(function (rs) { this.setState(rs);}.bind(this));
                break;

            case 'loadReportApp':
                ns = stateUpdates.loadReportAppSummary(this.state, obj.val);
                break;
            
            case 'setReportAppChanges':
                ns = stateUpdates.setReportAppChanges(this.state, obj.id).then(function setReportChangesPromise (changes) { this.setState(changes); }.bind(this));
                break;
        }

        this.setState(ns);
    },
    render: function AppRender() {
        const childrenWithProps = React.Children.map(this.props.children,
            (child) => React.cloneElement(child, {
                rootState: this.state,
                updateRootState: this.updateRootState
            })
        );       

        return (
            <div>
                <TopMenu rootState={this.state} updateRootState={this.updateRootState}/>
                <Sidebar.Pushable>
                    <LeftSideBar rootState={this.state} updateRootState={this.updateRootState} />
                    <Sidebar.Pusher>
                        {(this.state.loading) ? <WhitePageLoader /> : ''}
                        {childrenWithProps}
                    </Sidebar.Pusher>
                </Sidebar.Pushable>
            </div>
        );
    }
});

export default App;

const TopMenu = React.createClass({
    performClick: function LeftSideBarClick (goLink, header) {
        // this.props.updateRootState({ action: 'toggleSidebar' });
        setTimeout(function updateHeader() {
            this.props.updateRootState({ action: 'updatePageHeader', data: header });
        }.bind(this), 100);
        hashHistory.push(goLink);
    },
    render: function runTopMenuRender() {
        const { rootState, updateRootState } = this.props;
        
        const trigger = (
            <Label size="tiny" as='a' color='orange' image>
                <img src={rootState.user.avatar} />
                    {rootState.user.name}
                <Label.Detail>{rootState.user.role}</Label.Detail>
            </Label >);
        
        const s           = {height: 20};
        const logoTrigger = (
            <img src="images/saavha_white_blk.png" alt="Saavha" style={s}/>
        );
            
        return (
                <Menu size="tiny" attached="top" color="black" inverted>
                <Menu.Item name='home' onClick={() => updateRootState({ action: 'toggleSidebar', data: { header: '' } })}>
                    <Dropdown trigger={logoTrigger}>
                        <Dropdown.Menu>
                            <Dropdown.Item icon='list layout' text='Reports' onClick={() => this.performClick('/reports', 'Reports')}/>
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Item>
                <Menu.Item active={true} color="orange" header>{rootState.pageHeader}</Menu.Item>
                    <Menu.Menu position="right">
                        <Menu.Item>
                            <Dropdown trigger={trigger}>
                                <Dropdown.Menu>
                                <Dropdown.Item disabled>
                                    Signed in as <strong>{rootState.user.name}</strong>
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item icon='log out' text='Sign Out' />    
                                </Dropdown.Menu>
                            </Dropdown>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
        );
    }
    // <Icon name='content' />
    // <Dropdown.Item>Your Profile</Dropdown.Item>
    // <Dropdown.Item>Integrations</Dropdown.Item>
    // <Dropdown.Item>Help</Dropdown.Item>
    // <Dropdown.Divider />
    // <Dropdown.Item>Settings</Dropdown.Item>
});

const LeftSideBar = React.createClass({
    performClick: function LeftSideBarClick (goLink, header) {
        this.props.updateRootState({ action: 'toggleSidebar' });
        setTimeout(function updateHeader() {
            this.props.updateRootState({ action: 'updatePageHeader', data: header });
        }.bind(this), 100);
        hashHistory.push(goLink);
    },
    render: function runLeftSideBarRender() {
        const { rootState } = this.props;
        return null;
        return (
            <Sidebar as={Menu} animation='scale down' width='thin' visible={rootState.sideMenuVisible} icon='list layout' vertical inverted>
                <Menu.Item name='reports' onClick={() => this.performClick('/reports', 'Reports')}>
                    <Icon name="list layout" size="tiny" />
                    Reports
                </Menu.Item>
            </Sidebar>
        );
     }
    // <Menu.Item name='databases' onClick={() => this.performClick('/dbs', 'Databases')}>
    //     <Icon name='database' size="tiny" />
    //     Dbs
    // </Menu.Item>
    // <Menu.Item name='home' onClick={() => this.performClick('/', 'Saavha')}>
    //     <Icon name='home' size='mini' /> Home
    // </Menu.Item>
});
// State we are not currently using            
// dbList: [
//     {
//         id: "1",
//         name: "Payroll",
//         app: 'Inventory',
//         conn: {
//             address: "127.0.0.1",
//             user: 'root',
//             pass: '',
//             type: 'MySQL'
//         }
//     },
//     {
//         id: "2",
//         name: "Equipment",
//         app: 'Inventory',
//         conn: {
//             address: "127.0.0.1",
//             user: 'eq root',
//             pass: 'password',
//             type: 'MySQL'
//         }
//     }
// ],
// dbSetup: {
//     availableDbs: [],
//     currId: "-1",
//     selectedDb: "",
//     entry: { id: "-1", name: "", app: '', conn: { address: "", user: '', pass: '', type: 'MySQL' } },
//     step: 0,
// },
