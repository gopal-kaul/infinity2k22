import { NavDropdown, Container, Nav, Navbar, Image } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
export default function MyNavbar() {
  return (
    <>
      <Navbar
        collapseOnSelect
        expand="lg"
        variant="dark"
        fixed={"top"}
        className={"position-sticky mynav ps-0"}
      >
        <Container fluid>
          <LinkContainer to={"/"}>
            <Navbar.Brand>
              <Image
                width={60}
                height={60}
                src="logo.png"
                alt="Infinity 2k22 Logo"
              />
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto"></Nav>
            <Nav className="movenav">
              <LinkContainer to={"/workshop"}>
                <Nav.Link>Workshop</Nav.Link>
              </LinkContainer>
              <LinkContainer to={"/sponsors"}>
                <Nav.Link>Sponsors</Nav.Link>
              </LinkContainer>
              <LinkContainer to={"/events"}>
                <Nav.Link>Events</Nav.Link>
              </LinkContainer>
              <LinkContainer to={"/contact"}>
                <Nav.Link>Contact Us</Nav.Link>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
