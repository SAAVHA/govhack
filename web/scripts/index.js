import React from 'react';
import { render } from 'react-dom';
import { IndexRoute, Router, Route, IndexRedirect, hashHistory } from 'react-router';

import App from './components/App';
import Login from './components/Login';
import Logout from './components/Logout';
import Database from './components/Database';
import DatabaseSetup from './components/DatabaseSetup';
import Reports from './components/Reports';
import ReportList from './components/ReportList';
import ReportView from './components/ReportView';

const router = (
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Login} />
            <Route path="/reports" component={Reports} />
            <Route path="/reports/:appid" component={ReportList} />                
            <Route path="/reports/:appid/run-report" component={ReportView} />                
            <Route path="/login" component={Login} />
        </Route>
    </Router>
);
            // <Route path="/dbs" component={Database} />
            //     <Route path="/dbs/:id" component={DatabaseSetup}/>

render(router, document.getElementById('saavah'));
