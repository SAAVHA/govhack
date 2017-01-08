import R from 'ramda';
import * as Lenses from './lenses';

export function removeNonLoginChars (str) {
    const matchMe = function(a){return R.match(/[\w@\.]+/g,a);};
    const joinMe  = function(a){return R.join('', a);};
    return R.compose(joinMe, matchMe)(str);
}

export function updateDbSetupToStepOne(oldState, newObj){
    let ns          = R.clone(oldState);
    ns              = R.assocPath(['dbSetup', 'step'], newObj.step, ns);
    ns              = R.assocPath(['dbSetup', 'currId'], newObj.id, ns);
    let dbListInNum = R.findIndex(R.propEq('id', +newObj.id), ns.dbList);
    let dbListInStr = R.findIndex(R.propEq('id', newObj.id), ns.dbList);
    
    if(dbListInNum > -1){
        ns.dbSetup.entry       = ns.dbList[dbListInNum];
        ns.dbSetup.dbListIndex = dbListInNum;
    } else if(dbListInStr > -1){
        ns.dbSetup.entry       = ns.dbList[dbListInStr];
        ns.dbSetup.dbListIndex = dbListInStr;
    } else {
        ns.dbSetup.entry = { id: -1, name: "", app: '', conn: { address: "", user: '', pass: '', type: 'MySQL' } };
        ns.dbSetup.dbListIndex = -1;
    }
    return ns;
}

export function updateDbSetupConnCreds(oldState, newObj) {
    let ns = R.clone(oldState);

    switch(newObj.field){
        case 'address':
            ns = R.set(Lenses.dbSetupConnAddress, newObj.val, ns);
            break;
        
        case 'user':
            ns = R.set(Lenses.dbSetupConnUser, newObj.val, ns);
            break;
        
        case 'pass':
            ns = R.set(Lenses.dbSetupConnPass, newObj.val, ns);
            break;
        
        case 'type':
            ns = R.set(Lenses.dbSetupConnType, newObj.val, ns);
            break;

        case 'availableDbs':
            ns = R.set(Lenses.dbSetupAvailableDbs, newObj.val, ns);
            break;
        case 'selectedDb':
            ns = R.set(Lenses.dbSetupSelectedDb, newObj.val, ns);
            break;
    }

    return ns;
}

export function updateDbSetupToStepTwo(oldState){
    let ns = R.clone(oldState);
        ns = R.set(Lenses.dbSetupStep, 2, ns);
    return ns;
}

export function updateLoginCreds (oldState, newObj) {
    let ns = R.clone(oldState);

    switch (newObj.field) {
        case 'user':
            ns = R.set(Lenses.loginUser, newObj.val, ns);
            break;
        
        case 'pass':
            ns = R.set(Lenses.loginPass, newObj.val, ns);
            break;
    }
    
    return ns;
}

export function loginSaavha(state) {  
    
}

export function toggleSidebar(oldState, header){
    let ns = R.clone(oldState);
        ns = R.set(Lenses.sideMenuVisible, R.not(R.view(Lenses.sideMenuVisible, oldState)))(ns);
    return ns;
}

export function toggleLoading (oldState) {
    const a = R.compose(R.not, R.view(Lenses.pageLoading))(oldState);
    let  ns = R.clone(oldState);
         ns = R.set(Lenses.pageLoading, a)(ns);
    return ns;
}

export function updatePageHeader (oldState, header) {
    let ns = R.clone(oldState);
    if (
        R.not(
            R.either(
                R.isNil,
                R.isEmpty
            )(header)
        )
    ) {
        ns = R.set(Lenses.pageHeader, header, ns);
    }
    return ns;
}

export function loadClientApps (currentState) {
    var postData = new FormData();
    postData.append('func', 'get_client_apps');
    postData.append('id', 1);
    
    return fetch('index.php', { method: 'POST', body: postData, cache: 'no-store' })
        .then(function returnClientApps(response) {
            return response.json();
        })
        .then(function updateAppStateClientApps (data) {
            let ns = R.clone(currentState);
                ns = R.set(Lenses.reportAppList, data, ns);
                ns = R.set(Lenses.pageLoading, false, ns);
                return ns;
        })
        .catch(function methodName (err) {
            console.error(err);
            alert('There was an issue loading applications');
            return currentState;
        });
}

export function loadPreviousAudits (currentState, appId) {
    var postData = new FormData();
    postData.append('func', 'get_previous_audits');
    postData.append('id', appId);
    
    return fetch('index.php', { method: 'POST', body: postData, cache: 'no-store' })
        .then(function returnClientApps(response) {
            return response.json();
        })
        .then(function updatePrevAudits (data) {
            let ns = R.clone(currentState);
                ns = R.set(Lenses.reportAppPrevAudits, data, ns);
                ns = R.set(Lenses.pageLoading, false, ns);
                return ns;
        })
        .catch(function catchLoadPreviousAuditsError (err) {
            console.error(err);
            // alert('There was an issue loading previous audits');
            return currentState;
        });
}

export function loadReportAppSummary (oldState, appSummary) {
    let ns = R.clone(oldState);
        ns = R.set(Lenses.reportAppReports, appSummary, ns);
        ns = R.set(Lenses.reportAppPrevAudits, [], ns);
        ns = R.set(Lenses.reportAppChanges, [], ns);

    return ns;
}

export function setReportAppChanges (oldState, appid) {
    var postData = new FormData();
         postData.append('func', 'get_changes');
        //  postData.append('id', R.view(Lenses.reportAppId, oldState));
         postData.append('id', appid);
    return fetch('index.php', { method: 'POST', body: postData, cache: 'no-store' })
        .then(function returnClientApps(response) {
            return response.json();
        })
        .then(function updateAppStateClientApps (data) {
            let ns = R.clone(oldState);
                ns = R.set(Lenses.reportAppChanges, data, ns);
                ns = R.set(Lenses.pageLoading, false, ns);
            return ns;
        })
        .catch(function methodName (err) {
            console.error(err);
            alert('There was an issue loading changes');
            return oldState;
        });  
    
    return oldState;
}