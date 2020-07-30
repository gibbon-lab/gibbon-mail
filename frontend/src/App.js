import axios from 'axios';
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom';
import {
    Button, ButtonToolbar,
    Grid, Row, Col,
    Breadcrumb, BreadcrumbItem,
    ListGroup, ListGroupItem,
    Panel,
    SplitButton, MenuItem
} from 'react-bootstrap';

import ReactMarkdown from 'react-markdown';
import Form from 'react-jsonschema-form';
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
                <Grid>
                    <Row>
                        <Col>
                            <Breadcrumbs />
                        </Col>
                    </Row>
                    <Route exact path='/' component={Home} />
                    <Route exact path='/:id' component={RessourceForm} />
                </Grid>
            </div>
        </Router>
    );
}

function Home() {
    const [mailList, setMailList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios(`${apiURL}/v1/templates/`);
            setMailList(result.data);
        };

        fetchData();
    }, []);

    return (
        <ListGroup>
            {mailList.map(item => (
                <ListGroupItem key={item}><NavLink to={`/${item}/`}>{item}</NavLink></ListGroupItem>
            ))}
        </ListGroup>
    );
}

function RessourceForm({ match }) {
    const [readme, setReadme] = useState(null);
    const [jsonSchema, setJsonSchema] = useState(null);
    const [smtpList, setSmtpList] = useState({});
    const [smtpSelected, setSmtpSelected] = useState('smtp1');
    const [fieldValues, setFieldValues] = useState({});
    const formEl = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            let result = await axios(`${apiURL}/v1/templates/${match.params.id}`);
            setJsonSchema(result.data.json_schema);
            setReadme(result.data.readme); 
            result = await axios(`${apiURL}/v1/smtp/`);
            setSmtpList(result.data);
        };

        fetchData();
    }, [match.params.id]);

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

    if (jsonSchema === null) return <p>Loading</p>;

    return (
        <div>
            {
                readme && (
                    <Panel>
                        <Panel.Heading>README</Panel.Heading>
                        <Panel.Body>
                            <ReactMarkdown source={readme} />
                        </Panel.Body>
                    </Panel>
                )
            }
            <Panel>
                <Panel.Heading>Form</Panel.Heading>
                <Panel.Body>
                    <Form
                        schema={jsonSchema}
                        formData={fieldValues}
                        ref={formEl}
                    >
                        <div className='pull-right'>
                            <ButtonToolbar className='btn-toolbar'>
                                <Button
                                    bsStyle='primary'
                                    onClick={submitPreview}>Preview</Button>
                                {
                                    (Object.keys(smtpList).length < 2) 
                                        ? (
                                            <Button
                                                onClick={submitSendMail}
                                            >Send mail</Button>
                                        ) : (
                                            <SplitButton
                                                title={smtpList[smtpSelected].label}
                                                onClick={submitSendMail}
                                                className='dropdown-menu-right'
                                                id='smtp-button'
                                            >
                                                {Object.entries(smtpList).map(([key, {label}], i) => (
                                                    <MenuItem
                                                        key={i}
                                                        eventKey={key}
                                                        onSelect={onSelectStmp}
                                                    >{label}</MenuItem>
                                                ))}
                                            </SplitButton>
                                        )
                                }
                            </ButtonToolbar>
                        </div>
                    </Form>
                </Panel.Body>
            </Panel>
            <Panel>
                <Panel.Heading>HTML Preview</Panel.Heading>
                <Panel.Body>
                    <Preview
                        resourceId={match.params.id}
                        values={fieldValues}
                        format='html' />
                </Panel.Body>
            </Panel>
            <Panel>
                <Panel.Heading>Txt Preview</Panel.Heading>
                <Panel.Body>
                    <Preview
                        resourceId={match.params.id}
                        values={fieldValues}
                        format='txt' />
                </Panel.Body>
            </Panel>
        </div>
    );
}

function Preview({ resourceId, values, format }) {
    const [previewResult, setPreviewResult] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios.post(
                `${apiURL}/v1/templates/${resourceId}/preview`,
                values
            );
            setPreviewResult(result.data);
        };
        fetchData();
    }, [resourceId, values]);

    if (previewResult === null) return <p>Loading...</p>;

    return (
        <div>
            <p><strong>Subject: { previewResult.subject }</strong></p>
            {
                format === 'html'
                    ? <div style={{all: 'unset'}} dangerouslySetInnerHTML={{ __html: previewResult[format] }} />
                    : <pre>{previewResult[format]}</pre>
            }
        </div>
    );
}

export default App;
