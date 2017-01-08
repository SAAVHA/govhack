import React from 'react';
import { Container, Divider, Card, Feed, Image, Header, Icon, Grid, Button, Table, Menu } from 'semantic-ui-react';
import D from 'date-fp';
import { hashHistory } from 'react-router';
import R from 'ramda';
import { reportAppPrevAudits, reportAppId, reportAppName, reportAppSubHeader, reportAppIcon } from './lenses';
import ReportAppHeader from './ReportAppHeader';

const ReportList = React.createClass({
    componentWillMount: function ReportListWillMount () {
        this.props.updateRootState({ action: 'toggleLoading' });
    },
    componentDidMount: function reportsWillMount() {
        const {params, rootState} = this.props;
        if (rootState.appList.length === 0) { hashHistory.push('/reports');}
        this.props.updateRootState({ action: 'loadPastAudits' , id:params.appid });
    },
    runReportClick: function runReportClickRan() {
        const {params} = this.props;
        hashHistory.push('/reports/' + params.appid + '/run-report');
    },
    RepotListRow: function runRepotListRow (row) {
        const rd = new Date(+row.create_ts*1000);
        
        return <Table.Row key={row.audit_id}>
            <Table.Cell>{D.format('YYYY-MMM-DD @ HH:mm ', rd)}</Table.Cell>
            <Table.Cell>{row.num_suspicious}</Table.Cell>
            <Table.Cell>{row.num_restored}</Table.Cell>
        </Table.Row>;
    },
    prevAuditRows: function runPrevAuditRows () {
        const {rootState} = this.props;
        const audits      = R.view(reportAppPrevAudits, rootState);
        
        return <Table.Body>{R.map(this.RepotListRow, audits)}</Table.Body>;
    },
    makeTblFooter: function runMakeTblFooter () {
        return <Table.Footer>
            <Table.Row>
                <Table.HeaderCell colSpan='3'>
                <Menu floated='right' pagination>
                    <Menu.Item as='a' icon>
                    <Icon name='left chevron' />
                    </Menu.Item>
                    <Menu.Item as='a'>1</Menu.Item>
                    <Menu.Item as='a'>2</Menu.Item>
                    <Menu.Item as='a'>3</Menu.Item>
                    <Menu.Item as='a'>4</Menu.Item>
                    <Menu.Item as='a' icon>
                    <Icon name='right chevron' />
                    </Menu.Item>
                </Menu>
                </Table.HeaderCell>
            </Table.Row>
        </Table.Footer>
    },
    render: function runReportList() {
        const { rootState, params } = this.props;
        const auditLogLen   = R.length(R.view(reportAppPrevAudits, rootState));
        let tbody           = <Table.Body><Table.Row><Table.Cell colSpan={3}>No Previous Reports</Table.Cell></Table.Row></Table.Body>;
        if (auditLogLen > 0) { tbody = this.prevAuditRows(); }
        
        return (
            <Container>
                <Grid>
                    <Grid.Row />
                    <Grid.Row>
                        <Grid.Column>
                            <Header as="h1">Saavha Auditing Engine </Header>
                            <ReportAppHeader icon={R.view(reportAppIcon, rootState)} name={R.view(reportAppName, rootState)} subHeader={R.view(reportAppSubHeader, rootState)}/>
                            <Button onClick={this.runReportClick} primary>Run Audit</Button>
                            <Icon name="sticky note"/> Audits are routinely run every 24 hours
                        </Grid.Column>    
                    </Grid.Row>    
                    <Grid.Row>
                        <Grid.Column>
                            <Header as="h3">Previous Audits</Header>
                            <Table striped>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell singleLine>Date Times</Table.HeaderCell>
                                        <Table.HeaderCell>Suspicious Records</Table.HeaderCell>
                                        <Table.HeaderCell>Restored Records</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                {tbody}
                            </Table>    
                        </Grid.Column>    
                    </Grid.Row>
                    <Grid.Row />
                </Grid>
            </Container>
        );
     }
});

export default ReportList;
