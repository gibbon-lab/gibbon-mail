import axios from 'axios';
import useAxios from 'axios-hooks';
import React, { useState, useCallback, useRef } from 'react';

import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom';

import {
    Container,
    OrderedList, ListItem,
    VStack,
    Flex,
    Box, Heading,
    Grid, GridItem,
    Button, Select,
    Breadcrumb, BreadcrumbItem, BreadcrumbLink
} from '@chakra-ui/react';

import ReactMarkdown from 'react-markdown';
import Form from '@rjsf/core';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';

const apiURL = process.env.REACT_APP_API_URL || `${window.location.href.split('/')[0]}//${window.location.href.split('/')[2]}`;

const routes = [
    { path: '/', breadcrumb: 'Home' },
    {
        path: '/:id',
        breadcrumb: ({ match }) => {
            return match.params.id;
        }
    }
];

const Breadcrumbs = withBreadcrumbs(routes)(({ breadcrumbs }) => (
    <Breadcrumb
        shadow="md"
        borderWidth="1px"
        borderRadius="sm"
        px={4}
        py={2}
        mb={2}
    >
        {breadcrumbs.map(({ match, breadcrumb }) => (
            <BreadcrumbItem key={match.url}>
                <BreadcrumbLink as={NavLink} to={match.url}>{breadcrumb}</BreadcrumbLink>
            </BreadcrumbItem>
        ))}
    </Breadcrumb>
));

function App() {
    return (
        <Router>
            <div className='App'>
                <Container
                    maxW="container.lg"
                >
                    <Grid>
                        <GridItem>
                            <Breadcrumbs />
                        </GridItem>
                        <GridItem>
                            <Route exact path='/' component={Home} />
                            <Route exact path='/:id' component={RessourceForm} />
                        </GridItem>
                    </Grid>
                </Container>
            </div>
        </Router>
    );
}

function Home() {
    const [
        {
            data: data,
            loading: loading,
            error: error
        }
    ] = useAxios(
        `${apiURL}/v1/templates/`
    );

    if (loading) return <p>Loading</p>;
    if (error) {
        console.error(error);
        return <p>Error</p>;
    }

    return (
        <OrderedList>
            {data.map(item => (
                <ListItem key={item}><NavLink to={`/${item}/`}>{item}</NavLink></ListItem>
            ))}
        </OrderedList>
    );
}

function RessourceForm({ match }) {
    const [
        {
            data: templateData,
            loading: templateLoading,
            error: templateError
        }
    ] = useAxios(
        `${apiURL}/v1/templates/${match.params.id}`
    );
    const [
        {
            data: smtpData,
            loading: smtpLoading,
            error: smtpError
        }
    ] = useAxios(
        `${apiURL}/v1/smtp/`
    );

    const [smtpSelected, setSmtpSelected] = useState('smtp1');
    const [fieldValues, setFieldValues] = useState({});
    const formEl = useRef(null);

    const submitPreview = useCallback(
        () => {
            setFieldValues(formEl.current.state.formData);
        },
        []
    );

    const submitSendMail = useCallback(
        () => {
            setFieldValues(formEl.current.state.formData);
            const sendMail = async () => {
                await axios.post(
                    `${apiURL}/v1/templates/${match.params.id}/send/${smtpSelected}`,
                    formEl.current.state.formData
                );
            };
            sendMail(match.params.id);
        },
        [match.params.id, smtpSelected]
    );

    const onSelectStmp = (event) => {
        setSmtpSelected(event.target.value);
    };

    console.log(smtpData);

    if (templateLoading || smtpLoading) return <p>Loading</p>;
    if (templateError || smtpError) {
        console.error(templateError || smtpError);
        return <p>Error</p>;
    }

    return (
        <VStack
            spacing={4}
            align="stretch"
        >
            {
                templateData.readme && (
                    <Box
                        p={5}
                        shadow="md"
                        borderWidth="1px"
                        borderRadius="base"
                    >
                        <Heading>README</Heading>
                        <Container maxW="container.lg">
                            <ReactMarkdown source={templateData.readme} />
                        </Container>
                    </Box>
                )
            }
            <Box
                p={5}
                shadow="md"
                borderWidth="1px"
                borderRadius="base"
            >
                <Heading>Form</Heading>
                <Container maxW="container.lg">
                    <Form
                        schema={templateData.json_schema}
                        formData={fieldValues}
                        ref={formEl}
                    >
                        <Flex
                            spacing={4}
                            justify='flex-end'
                            align="center"
                        >
                            <Button
                                colorScheme="blue"
                                onClick={submitPreview}
                                mr="4"
                            >
                                Preview
                            </Button>
                            {
                                (Object.keys(smtpData).length < 2) 
                                    ? (
                                        <Button
                                            onClick={submitSendMail}
                                        >
                                            Send mail
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                colorScheme="green"
                                                onClick={submitSendMail}
                                                mr="4"
                                            >
                                                Send mail
                                            </Button>
                                            <Select
                                                colorScheme="green"
                                                isFullWidth={false}
                                                defaultValue={smtpData[0]}
                                                onChange={onSelectStmp}
                                            >
                                                {Object.entries(smtpData).map(([key, {label}], i) => (
                                                    <option
                                                        key={i}
                                                        value={key}
                                                    >
                                                        {label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </>
                                    )
                            }
                        </Flex>
                    </Form>
                </Container>
            </Box>
            <Box
                p={5}
                shadow="md"
                borderWidth="1px"
                borderRadius="base"
            >
                <Heading>HTML Preview</Heading>
                <Container maxW="container.lg">
                    <Preview
                        resourceId={match.params.id}
                        values={fieldValues}
                        format='html' />
                </Container>
            </Box>
            <Box
                p={5}
                shadow="md"
                borderWidth="1px"
                borderRadius="base"
            >
                <Heading>Txt Preview</Heading>
                <Container maxW="container.lg">
                    <Preview
                        resourceId={match.params.id}
                        values={fieldValues}
                        format='txt' />
                </Container>
            </Box>
        </VStack>
    );
}

function Preview({ resourceId, values, format }) {
    const [
        {
            data: data,
            loading: loading,
            error: error
        }
    ] = useAxios(
        {
            url: `${apiURL}/v1/templates/${resourceId}/preview`,
            method: 'POST',
            data: values
        }
    );


    if (loading) return <p>Loading</p>;
    if (error) {
        console.error(error);
        return <p>Error</p>;
    }

    return (
        <div>
            <p><strong>Subject: { data.subject }</strong></p>
            {
                format === 'html'
                    ? <div style={{all: 'unset'}} dangerouslySetInnerHTML={{ __html: data[format] }} />
                    : <pre>{data[format]}</pre>
            }
        </div>
    );
}

export default App;
