import React from 'react';
import { Container, Divider, Card, Feed, Image, Header, Icon, Grid, Button, Dimmer, Segment, Loader } from 'semantic-ui-react';
import { hashHistory } from 'react-router';
import WhitePageLoader from './WhitePageLoader';
import R from 'ramda';

const Reports = React.createClass({
    componentWillMount:function ReportsWillMount () {
        this.props.updateRootState({ action: 'toggleLoading'});
    },
    componentDidMount: function reportsWillMount() {
        this.props.updateRootState({ action: 'loadClientAppList' });
    },
    handleCardClick: function appCardClicked (appId) {
        const { rootState, updateRootState } = this.props;
        let appid = +appId;
        const reportSummary = R.compose(R.head, R.filter(R.propEq('id', appid)), R.prop('appList'))(rootState);
        updateRootState({ action: 'loadReportApp', val:reportSummary});
        setTimeout(function moveToreports () {hashHistory.push('/reports/' + appId); }.bind(this), 500);
    },
    createCards: function runCreateAppCards(card) {
        return <Card raised key={card.id} onClick={() => this.handleCardClick(card.id)}>
            <Header as='h2' textAlign="center" icon> {card.header}
                <Header.Subheader> {card.subHeader} </Header.Subheader>
            </Header>
            <Header as='h2' textAlign="center" icon>
                <Icon size="massive" name={card.icon} />
            </Header>
        </Card>
    },
    render: function runReportsRender() {
        const { rootState } = this.props;
        if (rootState.loading) { return (<WhitePageLoader />); }
        
        return (
            <Container>
                <Grid>
                    <Grid.Row />
                    <Grid.Row>
                        <Grid.Column>
                            <Header as='h1' textAlign="center" icon> Choose Database </Header>
                            <Card.Group itemsPerRow={3} stackable>
                                {R.map(this.createCards, R.prop('appList', this.props.rootState))}
                            </Card.Group>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row />
                </Grid>
            </Container>
        );
    }
});


export default Reports;