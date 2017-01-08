import React from 'react';
import {Link, hashHistory} from 'react-router';
import { Container, Grid, Icon, Button, Table, Divider } from 'semantic-ui-react';
import R from 'ramda';

const Database = React.createClass({
    genRows:function genRowsStepZero(){
        const { rootState } = this.props;
        
        if(R.is(Object, rootState) && R.has('dbList', rootState)){
            if(R.is(Array, rootState.dbList) && rootState.dbList.length > 0){
                return rootState.dbList.map(function(db, i){
                    return <tr key={db.id}>
                        <td>{db.app}</td>
                        <td>{db.name}</td>
                        <td>{db.conn.type}</td>
                        <td>
                            <a href={"#/dbs/" + db.id}><Button><Icon name="edit" /> Edit</Button> </a>
                        </td>
                    </tr>
                });
            }        
        }
        
        return <tr><td colSpan={3}>No Databases have been set up</td></tr>;
    },
    componentDidMount: function DatabaseSetupWillMount(){
        this.props.updateRootState({ action: 'updatePageHeader', data: 'Databases' });
    },
    render() {
        const tblPad = {marginTop: 10};
        const rows   = this.genRows();

        return (
            <Container>
                <Grid centered>
                    <Grid.Row>
                        <Grid.Column>
                            <Divider hidden />
                            <Table color="blue">
                                <thead>
                                    <tr className="bg-info">
                                        <th className="col-sm-4">Application</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th className="col-sm-2"><Link to="/dbs/new"><Button primary><Icon name="plus"/> DB</Button></Link></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows}
                                </tbody>
                            </Table>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        );
    }
});

export default Database;
