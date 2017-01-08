import React, {Component} from 'react';
import { Button, Form, Grid, Segment, Loader, Dimmer, Divider, Container, Image } from 'semantic-ui-react';
import { hashHistory } from 'react-router';
import R from 'ramda';
// import mysql from 'mysql';
import DbConnSteps from './dbConnSteps';

const addressLens  = R.lensProp('address');
const userLens     = R.lensProp('user');
const PasswordLens = R.lensProp('pass');
const DbLens       = R.lensProp('selectedDb');

const dbConnForm = React.createClass({
    componentWillMount: function dbConnFormWillMount(){
        if(this.props.rootState.dbSetup.step != 1){
            hashHistory.push('/dbs');
        }
    },
    getInitialState: function(){
        let    entry = R.clone(R.path(['dbSetup','entry','conn'], this.props.rootState));
               entry = R.assoc('connValid', -1, entry);
               entry = R.assoc('msg', '', entry);
               entry = R.assoc('dbsAvailable', [], entry);
               entry = R.assoc('selectedDb', "", entry);
        return entry;
    },
    componentWillUnmount: function dbConnFormWillUnmount(){
        this.setState( { address:"", user:'', pass:'', type:'MySQL' } );
    },
    updateAddress: function(e){
        let ns = this.state;
        ns     = R.set(addressLens, e.target.value, ns);
        this.setState(ns);
    },
    updateUser: function(e){
        let ns = this.state;
        ns     = R.set(userLens, e.target.value, ns);
        this.setState(ns);
    },
    updatePassword: function(e){
        let ns = this.state;
        ns     = R.set(PasswordLens, btoa(e.target.value), ns);
        this.setState(ns);
    },
    updateDb: function(e){
        let ns = this.state;
            ns = R.set(DbLens, e.target.value, ns);
        
        // instead of using blur I go ahead and update the root state as well
        // users should not see a speed difference
        this.updateBlur({ field: 'selectedDb' }, e);
        this.setState(ns);
    },
    updateBlur: function runUpdateBlur(field, event){
        const { rootState, updateRootState } = this.props;
        // check for a change here. Then update if there is one


        // not currently checking for changes. Just simply updating the state
        updateRootState({
            action:'connUpdateCreds', 
            data:{
                field:field.field, 
                val:event.target.value
                }
            });
    },
    testConnection: function runTestConnection(){
        this.setState({connValid:2}, function(){
            console.log('db step one state');
            // let pass  = (atob(this.state.pass)) ? atob(this.state.pass) : this.state.pass;
            // let addy  = this.state.address.split(':');
            // let creds = {
            //     host:addy[0],
            //     user:this.state.user,
            //     password:pass,
            //     port: (addy.length == 2) ? addy[1] : 3306
            // };
            // let connection = mysql.createConnection(creds);
            // connection.connect();

            // connection.query("show databases;", function(err, rows, fields){
            //     if(err){
            //         let msg = {code:err.code, errno:err.errno};
            //         this.setState({connValid:0, msg:msg});
            //     } else {
            //         if(R.is(Array, rows)){
            //             let dbs = rows.map(function(a){return a.Database;}).filter(function(a){
            //                 let sysTbls = ['information_schema', 'sys', 'mysql', 'performance_schema'];
            //                 if (R.contains(a, sysTbls)) { return false; }
            //                 return true;
            //             });

            //             this.setState({connValid:1, dbsAvailable:dbs}, function(){
            //                 this.props.updateRootState({
            //                     action:'connUpdateCreds', 
            //                     data:{
            //                         field:'availableDbs', 
            //                         val:dbs
            //                     }
            //                 });
            //             });
            //         } else {
            //             this.setState({connValid:0, msg:{code:"Unable to run show databases query", errno:-1}});
            //         }
            //     }
            // }.bind(this));
        }.bind(this));
    },
    goStepTwo: function runGoStepTwo(){
        const { rootState, updateRootState } = this.props;
        if (rootState.dbSetup.availableDbs.length == 0) { return alert('Error:No Databases were found. \n Unable to move forward.\n\n Correct the login and try again.') };
        updateRootState({action:'dbSetupStepTwo'});
    },
    handleSubmit: function connFormSubmitHandle (e, { formData}) {
        e.preventDefault();
        console.log('handle submit', formData);
    },
    render () {
        const { rootState } = this.props;
        const { dbSetup }   = rootState;        

        // return (
            // <Loader active inline="centered"></Loader>
        // );        
        
        return (
            <Container>
                <Divider hidden />
                <Grid> 
                    <Grid.Row>
                        <Grid.Column width={4}>
                            <DbConnSteps step={rootState.dbSetup.step}/>
                        </Grid.Column>
                        <Grid.Column width={12}>
                            <Form onSubmit={this.handleSubmit}>
                            <Form.Field id="dbTypeCon">
                                <label> DB Type </label>
                                <input type="text" disabled={true} value="MySql" />
                            </Form.Field>
                            <Form.Field id="dbAddressCon">
                                <label> Address </label>
                                <input type="text" value={R.view(addressLens, this.state)} onBlur={this.updateBlur.bind(this, {field:'address'})} onChange={this.updateAddress} />
                                <div>To Specifiy port use : Example localhost:23</div>
                            </Form.Field>
                            <Form.Field id="dbUserCon">
                                <label> User </label>
                                <input type="text" value={R.view(userLens, this.state)} onBlur={this.updateBlur.bind(this, {field:'user'})} onChange={this.updateUser}/>
                            </Form.Field>
                            <Form.Field id="dbPassCon">
                                <label> Password </label>
                                <input type="password" onBlur={this.updateBlur.bind(this, {field:'pass'})} onChange={this.updatePassword}/>
                                <div>Note: <i className="fa fa-ardiv-up"></i> Will not be filled out upon editing</div>
                            </Form.Field>
                            <DbDropDown {...this.props} setupState={this.state} testConnection={this.testConnection} updateBlur={this.updateBlur} updateDb={this.updateDb} />
                            <StepOneNextBtn {...this.props} setupState={this.state} goStepTwo={this.goStepTwo} testConnection={this.testConnection}/>
                        </Form> 
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        )
    }
});

const StepOneNextBtn = React.createClass({
    render: function StepOneNextBtnRender() {
        const { setupState, goStepTwo, testConnection } = this.props;

        let formBtn = <Button onClick={testConnection}>Test connection <i className="fa fa-connectdevelop"></i></Button>;
        
        if (setupState.connValid == 0) {
            formBtn = <div><Button onClick={testConnection}> <i className="fa fa-ban"></i> Test Failed </Button><div>Err #: {setupState.msg.errno}<br />Msg: {setupState.msg.code}</div></div>;
            
        } else if (setupState.connValid == 2) {
            formBtn = <div><i className="fa fa-spin fa-circle-o-notch"></i> Attempting Connection ...</div>;

        } else if (setupState.connValid == 1 && R.contains(setupState.selectedDb, setupState.dbsAvailable) ) {
            formBtn = <div><Button onClick={goStepTwo}>Next <i className="fa fa-ardiv-circle-o-right"></i></Button></div>;

        } else if (setupState.connValid == 1 ) {
            formBtn = null;
            
        }

        return (<div> <div></div> <div> {formBtn} </div> </div>);
    }
});

const DbDropDown = React.createClass({
    genOptions: function runGenOptionsDbDropDown() {
        const { setupState } = this.props;
        const opts           = R.prop('dbsAvailable', setupState);
        let makeRow          = function (opt) { return <option value={opt} key={opt}>{opt}</option> };
        
        return R.map(makeRow, opts);
    },
    render: function runDbDropDownRender() {
        const { rootState, setupState, updateBlur, updateDb } = this.props;
        const dbLength = R.compose(R.length, R.prop('dbsAvailable'))(setupState);
        
        if (dbLength == 0) { return null; }
        const rows = this.genOptions();
        return null;
        return (
            <div>
                <div>
                    Database
                </div>
                <div>
                    <select onChange={updateDb}>
                        <option value="select">Select Database</option>
                        {rows}
                    </select>
                </div>
            </div>
        );
    }
});

export default dbConnForm;