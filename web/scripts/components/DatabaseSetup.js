import React from 'react';
import R from 'ramda';
// import { Panel, Grid, Col, Row } from 'react-bootstrap';
import { Container, Grid, Icon, Button, Table } from 'semantic-ui-react';
import MysqlConnForm from './dbConnForm';
import DbTblColForm from './DbTblColForm';
import * as Lenses from './lenses';

const paramLens = R.lensPath(['routeParams', 'id']);

const DatabaseSetup = React.createClass({
    getInitialState:function(){
        return {step:1};
    },

    componentDidMount: function DatabaseSetupWillMount(){
        const {updateRootState} = this.props;
        const step  = 1;
        const id    = this.props.routeParams.id;
        const param = R.view(paramLens, this.props);
        updateRootState({ action: 'dbSetupStepOne', data: { step: step, id: id } });
        
        setTimeout(function updateHeaderName () {
            if (R.equals('new', param)) {
                updateRootState({ action: 'updatePageHeader', data: 'Databases - Add' });
            } else {
                updateRootState({ action: 'updatePageHeader', data: 'Databases - Edit' });
            }            
        }, 100);
    },

    dbNameLookup: function runDbNameLookup(){
        const { rootState } = this.props;
    },

    render:function(){
        const { params, rootState, updateDbSetupToStepOne } = this.props;
        const panelTitle = (params.id == 'new') ? 'New': 'Edit';
        let currentForm  = <MysqlConnForm {...this.props} />;
        
        if (R.view(Lenses.dbSetupStep, rootState) == 2) {
            currentForm = <DbTblColForm {...this.props}/>;
        }
        
        return currentForm;
    }
});

export default DatabaseSetup;