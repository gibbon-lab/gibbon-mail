import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

import './index.css';

const theme = extendTheme();

ReactDOM.render(
    (
        <ChakraProvider theme={theme}>
            <App />
        </ChakraProvider>
    )
    ,
    document.getElementById('root')
);

serviceWorker.unregister();
