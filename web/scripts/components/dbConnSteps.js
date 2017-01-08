import React, { Component } from 'react';
// import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Step, Icon } from 'semantic-ui-react';

class DbConnSteps extends Component {
    render() {
        const { step } = this.props;

        return (
            <Step.Group vertical>
                <Step active={(step == 1) ? true : false} completed={(step > 1) ? true : false}>
                    <Icon name='connectdevelop' />
                    <Step.Content>
                        <Step.Title>Connection</Step.Title>
                        <Step.Description></Step.Description>
                    </Step.Content>
                </Step>

                <Step active={(step == 2) ? true : false} completed={(step > 2) ? true : false}>
                    <Icon name='database' />
                    <Step.Content>
                        <Step.Title>Database</Step.Title>
                        <Step.Description><Icon name="table" />Tables</Step.Description>
                        <Step.Description><Icon name="columns" />Columns</Step.Description>
                    </Step.Content>
                </Step>

                <Step active={(step == 3) ? true : false} completed={(step > 3) ? true : false}>
                    <Icon name='clock' />
                    <Step.Content>
                        <Step.Title>Polling <br/> Interval</Step.Title>
                    </Step.Content>
                </Step>

                <Step active={(step == 3) ? true : false} completed={(step > 4) ? true : false}>
                    <Icon name='checkmark' />
                    <Step.Content>
                        <Step.Title>Confirmation</Step.Title>
                    </Step.Content>
                </Step>

            </Step.Group>
        )
    }
}

export default DbConnSteps;