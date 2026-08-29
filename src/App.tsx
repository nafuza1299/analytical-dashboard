import { Layout } from './catalyst-ui/components/Layout/Layout'
import { MenuBar } from './catalyst-ui/components/MenuBar/MenuBar'
import { Row } from './catalyst-ui/components/Grid/Row'
import { Col } from './catalyst-ui/components/Grid/Col'
import { Card } from './catalyst-ui/components/Card/Card'

function App() {
  return (
    <Layout>
      <Layout.Header>
        <MenuBar>
          <MenuBar.Brand>Analytical Dashboard</MenuBar.Brand>
          <MenuBar.Nav>
            <MenuBar.Link href="#economy">Economy</MenuBar.Link>
            <MenuBar.Link href="#health">Health</MenuBar.Link>
            <MenuBar.Link href="#education">Education</MenuBar.Link>
            <MenuBar.Link href="#environment">Environment</MenuBar.Link>
          </MenuBar.Nav>
        </MenuBar>
      </Layout.Header>

      <Layout.Content>
        <Row gutter={16}>
          <Col span={12} md={6}>
            <Card>
              <Card.Header>
                <Card.Title>catalyst-ui wired up</Card.Title>
              </Card.Header>
              <Card.Body>Row/Col grid, Layout, and MenuBar are live.</Card.Body>
            </Card>
          </Col>
          <Col span={12} md={6}>
            <Card>
              <Card.Header>
                <Card.Title>Next</Card.Title>
              </Card.Header>
              <Card.Body>World Bank fetch layer + normalizer.</Card.Body>
            </Card>
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  )
}

export default App
