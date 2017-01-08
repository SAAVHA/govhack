import React from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';

const WhitePageLoader = function runWhitePageLoader() {
    const loadingStyle = { height: 400 };
    return (
        <div style={loadingStyle}>
            <Dimmer active inverted>
                <Loader inverted>Loading</Loader>
            </Dimmer>
        </div>
    );
};

export default WhitePageLoader;