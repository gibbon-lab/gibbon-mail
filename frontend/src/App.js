import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import useAxios from 'axios-hooks';

import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom';
import {
    Button, ButtonToolbar,
    Container, Row, Col,
    Breadcrumb, BreadcrumbItem,
    ListGroup, ListGroupItem,
    Card,
    Dropdown, ButtonGroup
} from 'react-bootstrap';

import ReactMarkdown from 'react-markdown';
import Form from '@rjsf/bootstrap-4';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
import { defaultTo, get } from 'lodash';

const GetByPathWithDefault = (data, path, defaultValue) => defaultTo(get(data, path), defaultValue);
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
    <Breadcrumb tag='nav'>
        {breadcrumbs.map(({ match, breadcrumb }) => (
            <BreadcrumbItem active key={match.url}>
                <NavLink to={match.url}>{breadcrumb}</NavLink>
            </BreadcrumbItem>
        ))}
    </Breadcrumb>
));

function App() {
    return (
        <Router>
            <div className='App'>
                <Container>
                    <Row>
                        <Col>
                            <Breadcrumbs />
                        </Col>
                    </Row>
                    <Route exact path='/' component={Home} />
                    <Route exact path='/:id' component={RessourceForm} />
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
        <ListGroup>
            {data.map(item => (
                <ListGroupItem key={item}><NavLink to={`/${item}/`}>{item}</NavLink></ListGroupItem>
            ))}
        </ListGroup>
    );
}

function RessourceForm({ match }) {
    const [
        {
            data: templateData,
            error: templateError
        }
    ] = useAxios(
        `${apiURL}/v1/templates/${match.params.id}`
    );
    const [
        {
            data: smtpData,
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

    const onSelectStmp = (eventKey) => {
        setSmtpSelected(eventKey);
    };

    if (templateError || smtpError) {
        console.error(templateError || smtpError);
    }

    return (
        <div>
            {
                GetByPathWithDefault(templateData, 'readme') && (
                    <Card
                        className='mt-1'
                    >
                        <Card.Header>README</Card.Header>
                        <Card.Body>
                            <ReactMarkdown source={GetByPathWithDefault(templateData, 'readme')} />
                        </Card.Body>
                    </Card>
                )
            }
            <Card
                className={GetByPathWithDefault(templateData, 'readme') ? 'mt-3' : 'mt-1'}
            >
                <Card.Header>Form</Card.Header>
                <Card.Body>
                    <Form
                        schema={GetByPathWithDefault(templateData, 'json_schema', {})}
                        formData={fieldValues}
                        ref={formEl}
                    >
                        <ButtonToolbar
                            className='justify-content-end'
                        >
                            <Button
                                variant='primary'
                                onClick={submitPreview}
                                className='mr-2'
                            >Preview</Button>
                            {
                                smtpData ? (
                                    (Object.keys(smtpData).length < 2)
                                        ? (
                                            <Button
                                                onClick={submitSendMail}
                                            >Send mail</Button>
                                        ) : (
                                            <Dropdown as={ButtonGroup}>
                                                <Button 
                                                    onClick={submitSendMail}
                                                    className='dropdown-menu-right'
                                                    id='smtp-button'
                                                    variant="success"
                                                >
                                                    {GetByPathWithDefault(smtpData, `${smtpSelected}.label`)}
                                                </Button>

                                                <Dropdown.Toggle split variant="success" id="dropdown-split-basic" />

                                                <Dropdown.Menu>
                                                    {Object.entries(smtpData).map(([key, {label}], i) => (
                                                        <Dropdown.Item
                                                            key={i}
                                                            eventKey={key}
                                                            onSelect={onSelectStmp}
                                                        >{label}</Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        )
                                ) : null
                            }
                        </ButtonToolbar>
                    </Form>
                </Card.Body>
            </Card>
            <Card
                className='mt-3'
            >
                <Card.Header>HTML Preview</Card.Header>
                <Card.Body>
                    <Preview
                        resourceId={match.params.id}
                        values={fieldValues}
                        format='html' />
                </Card.Body>
            </Card>
            <Card
                className='mt-3'
            >
                <Card.Header>Txt Preview</Card.Header>
                <Card.Body>
                    <Preview
                        resourceId={match.params.id}
                        values={fieldValues}
                        format='txt' />
                </Card.Body>
            </Card>
        </div>
    );
}

function Preview({ resourceId, values, format }) {
    const [
        {
            data: data,
            error: error
        }
    ] = useAxios(
        {
            url: `${apiURL}/v1/templates/${resourceId}/preview`,
            method: 'POST',
            data: values
        }
    );

    if (error) {
        console.error(error);
    }

    return (
        <div>
            <p><strong>Subject: { GetByPathWithDefault(data, 'subject') }</strong></p>
            {
                format === 'html'
                    ? <div style={{ all: 'unset' }} dangerouslySetInnerHTML={{ __html: GetByPathWithDefault(data, format) }} />
                    : <pre>{GetByPathWithDefault(data, format)}</pre>
            }
        </div>
    );
}

export default App;
