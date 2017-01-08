import React from 'react';
import R from 'ramda';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';
import DbConnSteps from './dbConnSteps';

const RootCurrDbLens     = R.lensPath(['dbSetup', 'selectedDb']);
const RootCurrDbUserLens = R.lensPath(['dbSetup', 'entry', 'conn', 'user']);
const RootCurrDbPassLens = R.lensPath(['dbSetup', 'entry', 'conn', 'pass']);
const RootCurrDbHostLens = R.lensPath(['dbSetup', 'entry', 'conn', 'address']);

const DbTblColForm = React.createClass({
    getInitialState: function DbTblColFormInitialState() {
        return { tables: [], loading: 1, loadingMsg:'Loading Tables'};
    },
    componentWillMount: function DbTblColFormWillMount() {
        if(this.props.rootState.dbSetup.step != 2){
            hashHistory.push('/dbs');
        }  
    },
    componentDidMount: function DbTblColFormDidMount() {
        this.loadTables();
    },
    loadTables: function runLoadSetupTbls() {
        const { rootState } = this.props;
        const db   = R.view(RootCurrDbLens, rootState);
        const user = R.view(RootCurrDbUserLens, rootState);
        let pass   = R.view(RootCurrDbPassLens, rootState);
        const host = R.view(RootCurrDbHostLens, rootState);
        let tbls = [];
        // added for users who try to add port in address        
        let port = host.split(':');
        if (port.length == 2) { port = port[1]; } else { port = 3306; }
        // pass is base64 encoded but for my testing it is not
        if (this.isb(pass)) { pass = atob(pass); }

        let creds = {
            host: host,
            user: user,
            password: pass,
            port: port,
            database: db
        };
        // let con = mysql.createConnection(creds);
        // con.connect();
        // con.query("show tables;", function(err, rows, fields){
        //     if (err) {
        //         let msg = {code:err.code, errno:err.errno};
        //         this.setState({connValid:0, msg:msg});
        //     } else {
        //         const key    = fields[0].name;
        //         const tblObj = function (tblName) { return { name: tblName, cols: [], audit:0, idField:''}};
        //         tbls         = R.map(R.compose(tblObj, R.prop(key)), rows);

        //         this.setState({ tables: tbls, loadingMsg: 'Loading Columns' }, function (data) { 
        //             for (let a = 0, b = (tbls.length -1); a <= b; ++a){
        //                 con.query('DESCRIBE ' + tbls[a].name, function (err, descRows, descFields) {
        //                     tbls[a].cols = descRows;
        //                     if (a == b) {
        //                         con.end();
        //                         this.setState({ tables: tbls, loadingMsg: '', loading: 0 });
        //                     }
        //                 }.bind(this));
        //             }
        //         }.bind(this));
        //     }
        // }.bind(this));
    },
    isb: function runIsB(str) {
        try {
            atob(str);
        } catch (e) {
            return false;
        }
        return true;
    },
    render: function runDbTblColFormRender() {
        const { rootState } = this.props;

        // if (this.state.loading) {
            return (
                <Segment>
                    <Dimmer active>
                        <Loader></Loader>
                    </Dimmer>
                </Segment>
            );
        // }
        
        if (this.state.tables.length == 0) { 
            return (
                <div>
                    <div>
                        <div><DbConnSteps step={rootState.dbSetup.step} /></div>
                        <div>
                            <h3 className="text-center">{rootState.dbSetup.selectedDb}</h3>
                            {(this.state.loading) ? <div><i className="fa fa-spin fa-circle-o-notch"></i> {this.state.loadingMsg} ...</div> : null}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div>
                <div>
                    <div><DbConnSteps step={rootState.dbSetup.step} /></div>
                    <div>
                        <h3 className="text-center">{rootState.dbSetup.selectedDb}</h3>
                        <DBSchemaList tables={this.state.tables} />
                    </div>
                </div>
            </div>
        );
    }
});
                        // {this.state.tables.map(function (tbl, i) {
                        //     let tblColHeaders = R.compose(R.keys, R.head, R.prop('cols'))(tbl);
                        //     return <Panel header={<div><i className="fa fa=fw fa-table"></i> {tbl.name}</div>} key={tbl.name}>
                        //         <Table responsive condensed>
                        //             <thead>
                        //                 <tr>{tblColHeaders.map(function (head, i) {
                        //                         return <td key={head+i}>{head}</td>
                        //                     })
                        //                 }</tr>
                        //             </thead>
                        //             <tbody>
                        //                 {tbl.cols.map(function(col, ind){
                        //                     let be = R.values(col);
                        //                     return <tr key={Math.random()}>{
                        //                         be.map(function (colval) { 
                        //                             return <td key={Math.random()}>{colval}</td>
                        //                         })
                        //                     }</tr>
                        //                 })}
                        //             </tbody>        
                        //         </Table>    
                        //     </Panel>
                        // })}

const DBSchemaList = React.createClass({
    render: function DBSchemaListRender () {
        const { tables } = this.props;
        return (<div>{tables.map(function (tbl, i) { return <DBSchemaPanel key={tbl.name + '_' + i} tbl={tbl} /> })}</div> );
    }
});

const DBSchemaPanel = React.createClass({
    getInitialState:function DBSchemaPanelInitialState () {
        return { open: false , checked:true};
    },
    updateChecked: function updateCheckedDBSchemaPanel () {
        console.log('update checked ran');
        this.setState({ checked: !this.state.checked });
    },
    updateOpen: function  (e) {
        console.log('update open ran', e);
        /*this.setState({ open: !this.state.open })*/
    },
    render: function DBSchemaPanelRender() {
        const {tbl}         = this.props;
        const tblColHeaders = R.compose(R.keys, R.head, R.prop('cols'))(tbl);
        const chexPad       = {marginRight:10, display:"inline-block"};
        const header = <div onClick={() => this.updateOpen }><input style={chexPad} type="checkbox" value={this.state.checked} ref="userInput" onChange={this.updateChecked}/><i className = "fa fa = fw fa-table"></i> {tbl.name}</div>;
        
        return (
            <div> {header} 
                <table responsive condensed>
                    <thead>
                        <tr>{
                            tblColHeaders.map(function (head, i) {
                                return <td key={head+i}>{head}</td>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {tbl.cols.map(function(col, ind){
                            let be = R.values(col);
                            return <tr key={Math.random()}>{
                                be.map(function (colval) { 
                                    return <td key={Math.random()}>{colval}</td>
                                })
                            }</tr>
                        })}
                    </tbody>        
                </table>    
            </div>
        );
    }
});

const DbSchemaColRows = React.createClass({
    render:function runDbSchemaColRowsRender(){
        return(
            <div>Hello from DbSchemaColRows</div>
        );
     }
});

export default DbTblColForm;