import React from 'react';
import { Form, Segment, Icon, Input, Button, Grid, Message, Header, Menu, Image } from 'semantic-ui-react';
import R from 'ramda';
import { removeNonLoginChars } from './StateFunctions';

const Login = React.createClass({
    getInitialState: function runGetInitialState() {
        let ns = R.clone(this.props.rootState.login);
            ns = R.assoc('loading', false, ns);
            ns = R.assoc('error', false, ns);
            ns = R.assoc('errorMsg', '', ns);
        
        return ns;
    },
    userChange: function runUserChange(e) {
        const us = removeNonLoginChars(e.target.value).substr(0, 30);
        this.setState({ user: us });
    },
    passChange: function runpassChange(e) {
        const p = R.replace(/['";]+/g, '', e.target.value).substr(0,30);
        this.setState({ pass: p });
    },
    updateBlur: function runUpdateBlur(field, event) {
        const { rootState, updateRootState } = this.props;
        let value = '';

        // Does the root state differ?
        switch (field.field) {
            case 'user':
                const us = removeNonLoginChars(event.target.value).substr(0, 30);
                if (rootState.login.user == us) { return false; }
                value = us;

            case 'pass':
                const p = R.replace(/['";]+/g, '', event.target.value).substr(0, 30);
                if (rootState.login.pass == p) { return false; }
                value = p;
        }

        updateRootState({
            action: 'updateLoginCreds',
            data: {
                field: field.field,
                val: value
            }
        });
    },
    performLogin: function runPerformLogin(e) {
        e.preventDefault();
        let msgs = [];
        // lets do some form validation before we log the user in
        if (this.state.user == '') {
            msgs = R.append('User name is required', msgs);
        }

        if (this.state.pass == '') {
            msgs = R.append('Password is required', msgs);            
        } else if (this.state.pass.length < 8) {
            msgs = R.append('Pass did not meet minimum length requirements.', msgs);
        }
        
        if (msgs.length > 0) {
            this.setState({ error: true, errorMsg: R.join(', ', msgs) });
        } else {
            this.setState({ loading: true }, function () { 
                setTimeout(function () {
                    let error = (+(Math.random() * 100).toFixed(0) > 50) ? true : false;
                    this.setState({ loading: false, error:error});
                }.bind(this), 5600)
            }.bind(this))
        }
        
    },
    render: function runLoginRender() {
        const { rootState, updateRootState } = this.props;
        
        return (
            <Grid centered>
                <Grid.Row verticalAlign='middle'>
                    <Grid.Column computer={8} mobile={14}>
                        <Image src="images/saavha.svg" shape="rounded" fluid />
                        <Form size="large">
                            <Segment stacked>
                                <Form.Field>
                                    <Input
                                        iconPosition="left"
                                        icon={<Icon name='user' />}
                                        error={R.test(/User/g, this.state.errorMsg)}
                                        placeholder='User'
                                        value={this.state.user}
                                        onChange={this.userChange}
                                        onBlur={this.updateBlur.bind(this, { field: 'user' })}
                                        />
                                </Form.Field>
                                <Form.Field>
                                    <Input
                                        type="password"
                                        iconPosition="left"
                                        icon={<Icon name='lock' />}
                                        error={R.test(/Pass/g, this.state.errorMsg)}
                                        placeholder='password'
                                        value={this.state.pass}
                                        onChange={this.passChange}
                                        onBlur={this.updateBlur.bind(this, { field: 'pass' })}
                                        />
                                </Form.Field>
                                <Form.Field>
                                    <Button loading={this.state.loading} animated='vertical' color="teal" size="large" fluid onClick={this.performLogin}>
                                        <Button.Content visible><Icon name="computer" /></Button.Content>
                                        <Button.Content hidden><Icon name="arrow circle right" />Login</Button.Content>
                                    </Button>
                                </Form.Field>
                            </Segment>
                        </Form>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <ChooseMsg rootState={this.state}/>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
});

const MessageLoginFailed = React.createClass({
    render: function runMessageLoginFailed() {
        return (
            <Message negative>
                <Icon.Group size='large'>
                    <Icon size='large' color='red' name='dont' />
                    <Icon color='black' name='user' />
                </Icon.Group>
                <Message.Header>Login Error</Message.Header>
                <p>{this.props.errorMsg}</p>
            </Message>
        );
    }
});

const ChooseMsg = React.createClass({
    render:function runChooseMsgRender(){
        const { rootState } = this.props;

        if(R.propEq('error', true, rootState)) {
            return <MessageLoginFailed errorMsg={rootState.errorMsg} />
        }

        return ( <div></div> );
    }
});

export default Login;