import React from 'react';
import { Header, Icon } from 'semantic-ui-react';

const ReportAppHeader = React.createClass({
    render: function runReportAppHeaderRender() {
        return (
            <Header as='h2'>
                <Icon name={this.props.icon} />
                <Header.Content>
                    {this.props.name}
                    <Header.Subheader>
                        {this.props.subHeader}
                    </Header.Subheader>
                </Header.Content>
            </Header>
        );
    }
});

export default ReportAppHeader;