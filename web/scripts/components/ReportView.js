import React from 'react';
import { Container, Header, Icon, Grid, Button, Table, Message, Item, Image, Segment, Statistic, Radio, Checkbox, Label, Popup } from 'semantic-ui-react';
import { hashHistory } from 'react-router';
import R from 'ramda';
import { reportAppReports, reportAppPrevAudits, reportAppId, reportAppName, reportAppSubHeader, reportAppIcon } from './lenses';
import ReportAppHeader from './ReportAppHeader';
import { reportAppChanges } from './lenses';

const totalSuspicious = R.lensPath(['reports', 'changes', 'num_suspicious']);
const endTime         = R.lensPath(['reports', 'changes', 'end_ts']);
const appType         = R.lensPath(['reports', 'changes', 'app_type']);
const appTables       = R.lensPath(['reports', 'changes', 'tables']);

const ReportView = React.createClass({
    componentWillMount:function reportViewWillMount () {
    },
    componentDidMount:function reportViewMounted () {
        if(R.isEmpty(R.view(reportAppReports, this.props.rootState))){
            hashHistory.push('/reports');
        } else {
            this.props.updateRootState({action:'setReportAppChanges', id:R.view(reportAppId, this.props.rootState)});
        }
    },
    getInitialState: function initialState() {
        return {oview:'fancy'};
    },
    perCat: function runPerCatReportView (cat) {
        // console.group('per cat');
        // console.log(this.props);
        // console.groupEnd('per cat');
        return <SuspiciousCategory key={cat} cat={cat} rootState={this.props.rootState} updateRootState={this.props.updateRootState}/>;
    },
    render: function runReportViewRender() {
        const { rootState } = this.props;
        const suspiciousCount = R.view(totalSuspicious, rootState);
        let catsView = <span></span>;
        let cats     = R.view(appTables, rootState);
        console.log('suspiciousCount', suspiciousCount);
        const TopMsg = (R.gt(suspiciousCount, 0)) ? <SuspiciousMsg record_count={suspiciousCount}/> : <NoSuspiciousMsg />;
        // console.log('changes:', cats);
        if(R.is(Array, cats) && R.gt(suspiciousCount, 0)){
            catsView = R.map(this.perCat, cats);
        }

        return (
                <Grid stretched centered>
                    <Grid.Row />
                    <Grid.Row>
                        <Grid.Column width={15}>
                            <Header as="h1">Saavha Auditing Engine <Header.Subheader>On Demand Audit</Header.Subheader></Header>
                            <ReportAppHeader icon={R.view(reportAppIcon, rootState)} name={R.view(reportAppName, rootState)} subHeader={R.view(reportAppSubHeader, rootState)}/>
                        </Grid.Column>    
                    </Grid.Row>    
                    <Grid.Row>
                        <Grid.Column width={8}>
                            {TopMsg}
                        </Grid.Column>    
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={15}>
                        {catsView}
                        </Grid.Column>    
                    </Grid.Row>
                    <Grid.Row />
                </Grid>
        );
    }
});

const SuspiciousCategory = React.createClass({
    entryLoop(conflicts){
        const {cat, rootState, updateRootState} = this.props;
        
        return <SuspiciousEntryTableFancy key={Math.random()} conflicts={conflicts} rootState={rootState} updateRootState={updateRootState} />
    },
    render:function runSuspiciousCategoryRender(){
        // console.group('SuspiciousCategory');
        const {cat, rootState} = this.props;
        const conflictsLens  = R.lensPath(['reports', 'changes', cat]);
        const conflicts      = R.view(conflictsLens, rootState);
        const totalConflicts = conflicts.conflict_array.length + conflicts.app_only.length + conflicts.saavha_only.length;
        const objNotEmpty    = function runObjNotEmpty (obj) {
            return R.gt(R.length(obj), 0);
        }

        return(
            <Segment.Group raised>
                <SuspiciousHead tbl_name={this.props.cat}/>                          
                    <Segment.Group raised>
                        {R.compose(R.map(this.entryLoop), R.tap(console.log), R.flatten, R.values, R.filter(objNotEmpty))(conflicts)}
                    </Segment.Group>
                <SuspiciousFoot tbl_name={this.props.cat} record_count={totalConflicts} updateRootState={this.props.updateRootState} />
            </Segment.Group>
        );
     }
});

const SuspiciousEntryTableFancy = React.createClass({
    tbl_headers(headerText){
        // console.group('headers');
        // console.log(obj);
        // console.groupEnd('headers');
        return <Table.HeaderCell key={headerText}>{headerText}</Table.HeaderCell>;
    },
    dis_tbl_row_cur(obj){
        const curText = R.view(R.lensPath(['app', obj]), this.props.conflicts);
        const obj_key = 'current_' + curText;
        return <Table.Cell key={obj_key}>{curText}</Table.Cell>;
    },
    dis_tbl_row_sav(obj){
        const saavha_entry = R.compose( R.head, R.prop('fullHistory'))(this.props.conflicts);
        const obj_key = 'saavah_' + saavha_entry[obj];
        return <Table.Cell key={obj_key}>{saavha_entry[obj]}</Table.Cell>;
    },
    render:function runSuspiciousEntryTableRender(){
        const { conflicts, rootState } = this.props;
        // console.group('fancy tbl');
        // console.log(conflicts);
        // console.log(this.props);
        // console.groupEnd('fancy tbl');
        const notSaavhaHeader = R.compose(R.not, R.test(/(has|saavha)/gi));
        const tbl_headers_keys= R.compose(R.filter(notSaavhaHeader), R.keys, R.prop('app'))(conflicts);
        const tbl_headers     = R.compose(R.map(this.tbl_headers), R.filter(notSaavhaHeader), R.keys, R.prop('app'))(conflicts);
        const currentEntry    = R.prop('app', conflicts);
        const cEntryRow       = R.map(this.dis_tbl_row_cur, tbl_headers_keys);
        const sEntryRow       = R.map( this.dis_tbl_row_sav, tbl_headers_keys );
        // console.log('tbl_header_keys:', tbl_headers_keys);

        return(
            <Segment>
                <Segment inverted>
                    <Header as="h3">Discrepancy</Header>
                    <Table size="small">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell />
                                {tbl_headers}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell collapsing> Current </Table.Cell>
                                {cEntryRow}
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell collapsing> Saavha </Table.Cell>
                                {sEntryRow}
                            </Table.Row>
                        </Table.Body>
                    </Table>
                    
                    <Header as="h3">Resolve Discrepancy</Header>
                        <Table size="small" selectable >
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell />
                                    {tbl_headers}
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell collapsing>
                                    </Table.Cell>
                                    <Table.Cell></Table.Cell>
                                    <Table.Cell></Table.Cell>
                                    <Table.Cell></Table.Cell>
                                    <Table.Cell></Table.Cell>
                                </Table.Row>

                            
                                <Table.Row active>
                                    <Table.Cell collapsing>
                                        <Checkbox slider checked />    
                                    </Table.Cell>
                                    <Table.Cell>9080</Table.Cell>
                                    <Table.Cell>September 14, 2013</Table.Cell>
                                    <Table.Cell>jhlilk22@yahoo.com</Table.Cell>
                                    <Table.Cell>No</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell collapsing>
                                        <Checkbox slider />
                                    </Table.Cell>
                                    <Table.Cell>9080</Table.Cell>
                                    <Table.Cell>January 11, 2014</Table.Cell>
                                    <Table.Cell>jamieharingonton@yahoo.com</Table.Cell>
                                    <Table.Cell>Yes</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell collapsing>
                                        <Checkbox slider />
                                    </Table.Cell>
                                    <Table.Cell>9080</Table.Cell>
                                    <Table.Cell>May 11, 2014</Table.Cell>
                                    <Table.Cell>jilsewris22@yahoo.com</Table.Cell>
                                    <Table.Cell>Yes</Table.Cell>
                                </Table.Row>
                            </Table.Body>

                            <Table.Footer fullWidth>
                                <Table.Row>
                                <Table.HeaderCell />
                                <Table.HeaderCell colSpan='4'>
                                    <Button content='Accept' icon='check' color="blue" labelPosition='left' /> The latest record is correct and accurate to be maintained in the database
                                    <br/>
                                    <Button content='Restore' icon='check' color="green" labelPosition='left' /> Record is changed to selected row above
                                </Table.HeaderCell>
                                </Table.Row>
                            </Table.Footer>
                        </Table>    
                </Segment>
            </Segment>
        );
     }
});

const SuspiciousHead = React.createClass({
    render:function runSuspiciousHeadRender(){
        return(
            <Segment padded>
                <Label attached='top' color="black">
                    <Grid columns={3}>
                        <Grid.Row>
                            <Grid.Column>                                                    
                                
                            </Grid.Column>
                            <Grid.Column textAlign="center">
                                <Header as="h4" inverted><Icon name="table" /> {this.props.tbl_name}</Header>
                            </Grid.Column>
                            <Grid.Column>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Label>
            </Segment>
        );
     }
});

const ApproveAllBtn = React.createClass({
    render:function runApproveAllBtnRender(){
        const triggerBtnTxt = 'Accept ' + this.props.tbl_name + ' As Is';
        const triggerBtn    = <Button label={<Label>{this.props.num_entries}</Label>} color="red" icon='check' content={triggerBtnTxt} size="mini" />
        
        return(
            <Popup
                trigger={triggerBtn}
                flowing
                on='click'
                positioning='top right'
            >
                <Grid centered>
                    <Grid.Column textAlign='center'>
                        <Header as='h4'><u>Accept All Discrepancies</u></Header>
                        <p>By continuing you are confirming<br/>
                        all modifications to table <br/>
                        <b>{this.props.tbl_name}</b><br/>
                        are correct and should be <br/>
                        continued to be stored in the database</p>
                        <Button color="orange">Confirm Approve All</Button>
                    </Grid.Column>                
                </Grid>
            </Popup>
        );
     }
});

const RestoreAllBtn = React.createClass({
    render:function runApproveAllBtnRender(){
        const triggerBtnTxt = 'Restore ' + this.props.tbl_name + ' from Saavha';
        const triggerBtn    = <Button label={<Label pointing="right">{this.props.num_entries}</Label>} color="green"  icon='check' content={triggerBtnTxt} size="mini" labelPosition='left' />
        
        return(
            <Popup
                trigger={triggerBtn}
                flowing
                on='click'
                positioning='top right'
            >
                <Grid centered>
                    <Grid.Column textAlign='center'>
                        <Header as='h4'><u>Restore All Discrepancies</u></Header>
                        <p>By continuing you are confirming<br/>
                        all modifications to table <br/>
                        <b>{this.props.tbl_name}</b><br/>
                        are to be restored <br/>
                        from latest Saavha entries</p>
                        <Button color="orange">Confirm Restore All</Button>
                    </Grid.Column>                
                </Grid>
            </Popup>
        );
     }
});

const SuspiciousFoot = React.createClass({
    render:function runSuspiciousFoodRender(){
        return(
            <Segment padded>
                <Label attached='top' color="black">
                    <Grid columns={3}>
                        <Grid.Row>
                            <Grid.Column>                                                    
                                <ApproveAllBtn tbl_name={this.props.tbl_name} num_entries={this.props.record_count} />
                            </Grid.Column>
                            <Grid.Column textAlign="center">
                                <Header as="h4" inverted><Icon name="table" /> {this.props.tbl_name}</Header>
                            </Grid.Column>
                            <Grid.Column textAlign="right">
                                <RestoreAllBtn tbl_name={this.props.tbl_name} num_entries={this.props.record_count} />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Label>
            </Segment>
        );
     }
});

const NoSuspiciousMsg = React.createClass({
    render:function runNoSuspiciousMsgRender(){
        return(
            <Message success
                icon='check'
                header='No Suspicious Changes Found'
                content=''
            />
        );
     }
});

const SuspiciousMsg = React.createClass({
    render:function runNoSuspiciousMsgRender(){
        const message = this.props.record_count + ' Suspicious Changes Found in database';
        return (
            <Message negative
                icon='ban'
                header={message}
                content=''
            />
        );
     }
});

export default ReportView;

// const SuspiciousEntryTablePlain = React.createClass({
//     render:function runSuspiciousEntryTableRender(){
//         return(
//             <Segment>
//                 <Table size="small" >
//                     <Table.Header>
//                         <Table.Row>
//                             <Table.HeaderCell />
//                             <Table.HeaderCell>ID</Table.HeaderCell>
//                             <Table.HeaderCell>Registration Date</Table.HeaderCell>
//                             <Table.HeaderCell>E-mail address</Table.HeaderCell>
//                             <Table.HeaderCell>Premium Plan</Table.HeaderCell>
//                         </Table.Row>
//                     </Table.Header>
//                     <Table.Body>
//                         <Table.Row>
//                             <Table.Cell collapsing> Current </Table.Cell>
//                             <Table.Cell>9080</Table.Cell>
//                             <Table.Cell negative>September 14, 2013</Table.Cell>
//                             <Table.Cell>jhlilk22@yahoo.com</Table.Cell>
//                             <Table.Cell>No</Table.Cell>
//                         </Table.Row>
//                         <Table.Row>
//                             <Table.Cell collapsing> Saavha </Table.Cell>
//                             <Table.Cell>9080</Table.Cell>
//                             <Table.Cell negative>May 11, 2014</Table.Cell>
//                             <Table.Cell>jhlilk22@yahoo.com</Table.Cell>
//                             <Table.Cell>No</Table.Cell>
//                         </Table.Row>
//                         <Table.Row>
//                             <Table.Cell colSpan="5"> <Header as="h4"> Choose Correct Row </Header> </Table.Cell>
//                         </Table.Row>
//                         <Table.Row>
//                             <Table.Cell />
//                             <Table.Cell>ID</Table.Cell>
//                             <Table.Cell>Registration Date</Table.Cell>
//                             <Table.Cell>E-mail address</Table.Cell>
//                             <Table.Cell>Premium Plan</Table.Cell>
//                         </Table.Row>
//                         <Table.Row active>
//                             <Table.Cell collapsing>
//                                 <Radio checked />    
//                             </Table.Cell>
//                             <Table.Cell>9080</Table.Cell>
//                             <Table.Cell>September 14, 2013</Table.Cell>
//                             <Table.Cell>jhlilk22@yahoo.com</Table.Cell>
//                             <Table.Cell>No</Table.Cell>
//                         </Table.Row>
//                         <Table.Row>
//                             <Table.Cell collapsing>
//                                 <Radio />
//                             </Table.Cell>
//                             <Table.Cell>9080</Table.Cell>
//                             <Table.Cell>January 11, 2014</Table.Cell>
//                             <Table.Cell>jamieharingonton@yahoo.com</Table.Cell>
//                             <Table.Cell>Yes</Table.Cell>
//                         </Table.Row>
//                         <Table.Row>
//                             <Table.Cell collapsing>
//                                 <Radio />
//                             </Table.Cell>
//                             <Table.Cell>9080</Table.Cell>
//                             <Table.Cell>May 11, 2014</Table.Cell>
//                             <Table.Cell>jilsewris22@yahoo.com</Table.Cell>
//                             <Table.Cell>Yes</Table.Cell>
//                         </Table.Row>
//                     </Table.Body>
//                     <Table.Footer>
//                         <Table.Row>
//                         <Table.HeaderCell />
//                         <Table.HeaderCell colSpan='4'>
//                             <Button content='Approve' icon='check' color="blue" labelPosition='left' />
                                
//                         </Table.HeaderCell>
//                         </Table.Row>
//                     </Table.Footer>
//                 </Table>
//             </Segment>
//         );
//      }
// });
