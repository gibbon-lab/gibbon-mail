import { useState } from 'react';
import axios from 'axios';
import useAxios from 'axios-hooks';

import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useParams,
} from 'react-router-dom';

import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';

import BreadcrumbItem from 'react-bootstrap/BreadcrumbItem';

import Markdown from 'react-markdown';

import Form from '@rjsf/bootstrap-4';
import validator from '@rjsf/validator-ajv8';

import useBreadcrumbs, {
  BreadcrumbComponentProps,
} from 'use-react-router-breadcrumbs';

import type { Smtp } from './type';

const apiURL =
  import.meta.env.VITE_API_URL ||
  `${window.location.href.split('/')[0]}//${
    window.location.href.split('/')[2]
  }`;

const routes = [
  { path: '/', breadcrumb: 'Home' },
  {
    path: '/:id',
    breadcrumb: ({ match }: BreadcrumbComponentProps) => {
      return match?.params?.id;
    },
  },
];
const Breadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs(routes);

  return (
    <Breadcrumb>
      {breadcrumbs.map(({ match, breadcrumb }) => (
        <BreadcrumbItem active key={match.pathname}>
          <NavLink to={match.pathname}>{breadcrumb}</NavLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Container>
          <Row>
            <Col>
              <Breadcrumbs />
            </Col>
          </Row>
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/:id" Component={RessourceForm} />
          </Routes>
        </Container>
      </div>
    </BrowserRouter>
  );
}

function Home() {
  const [{ data: data, loading: loading, error: error }] = useAxios(
    `${apiURL}/v1/templates/`
  );

  if (loading) return <p>Loading</p>;
  if (error) {
    console.error(error);
    return <p>Error</p>;
  }

  return (
    <ListGroup>
      {data.map((item: string) => (
        <ListGroupItem key={item}>
          <NavLink to={`/${item}/`}>{item}</NavLink>
        </ListGroupItem>
      ))}
    </ListGroup>
  );
}

function RessourceForm() {
  const { id: templateId } = useParams();
  const [smtpSelected, setSmtpSelected] = useState('smtp1');
  const [fieldValues, setFieldValues] = useState({});
  const [previewValue, setPreviewValues] = useState(fieldValues);

  const [{ data: templateData, error: templateError }] = useAxios(
    `${apiURL}/v1/templates/${templateId}`
  );
  const [{ data: smtpData, error: smtpError }] = useAxios<{
      smtp1: Smtp;
      smtp2: Smtp | undefined;
    }>(`${apiURL}/v1/smtp/`);

  const onSelectStmp = (eventKey: string | null) => {
    if (typeof eventKey === 'string') {
      setSmtpSelected(eventKey);
    }
  };

  if (templateError || smtpError) {
    console.error(templateError || smtpError);
  }

  return (
    <div>
      {templateData?.readme && (
        <Card className="mt-1">
          <Card.Header>README</Card.Header>
          <Card.Body>
            <Markdown>{templateData?.readme}</Markdown>
          </Card.Body>
        </Card>
      )}
      <Card className={templateData?.readme ? 'mt-3' : 'mt-1'}>
        <Card.Header>Form</Card.Header>
        <Card.Body>
          <Form
            noHtml5Validate
            validator={validator}
            schema={templateData?.json_schema ?? {}}
            formData={fieldValues}
            onChange={(e) => setFieldValues(e.formData)}
            onSubmit={async () => {
              await axios.post(
                `${apiURL}/v1/templates/${templateId}/send/${smtpSelected}`,
                fieldValues
              );
            }}
          >
            <ButtonToolbar className="justify-content-end">
              <Button
                variant="primary"
                className="mr-2"
                onClick={() => setPreviewValues(fieldValues)}
              >
                                Preview
              </Button>
              {smtpData ? (
                Object.keys(smtpData).length < 2 ? (
                  <Button type="submit">Send mail</Button>
                ) : (
                  <Dropdown as={ButtonGroup}>
                    <Button
                      type="submit"
                      className="dropdown-menu-right"
                      id="smtp-button"
                      variant="success"
                    >
                      {smtpSelected === 'smtp1'
                        ? smtpData?.smtp1?.label ?? 'SMTP 1'
                        : smtpSelected === 'smtp2'
                          ? smtpData?.smtp2?.label ?? 'SMTP 2'
                          : 'Unknown SMTP'}
                    </Button>

                    <Dropdown.Toggle
                      split
                      variant="success"
                      id="dropdown-split-basic"
                    />

                    <Dropdown.Menu>
                      {Object.entries(smtpData).map(([key, smtp], i) => (
                        <Dropdown.Item
                          key={i}
                          eventKey={key}
                          onSelect={onSelectStmp}
                        >
                          {smtp?.label ?? 'Unknow SMTP'}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                )
              ) : null}
            </ButtonToolbar>
          </Form>
        </Card.Body>
      </Card>
      <Card className="mt-3">
        <Card.Header>HTML Preview</Card.Header>
        <Card.Body>
          <Preview
            resourceId={templateId}
            values={previewValue}
            format="html"
          />
        </Card.Body>
      </Card>
      <Card className="mt-3">
        <Card.Header>Txt Preview</Card.Header>
        <Card.Body>
          <Preview resourceId={templateId} values={previewValue} format="txt" />
        </Card.Body>
      </Card>
    </div>
  );
}

function Preview({
  resourceId,
  values,
  format,
}: {
  resourceId: string | undefined;
  values: object;
  format: string;
}) {
  const [{ data: data, error: error }] = useAxios({
    url: `${apiURL}/v1/templates/${resourceId}/preview`,
    method: 'POST',
    data: values,
  });

  if (error) {
    console.error(error);
  }

  return (
    <div>
      <p>
        <strong>Subject: {data?.subject}</strong>
      </p>
      {format === 'html' ? (
        <div
          style={{ all: 'unset' }}
          dangerouslySetInnerHTML={{ __html: data?.[format] }}
        />
      ) : (
        <pre>{data?.[format]}</pre>
      )}
    </div>
  );
}

export default App;
