import { Container, Image, Carousel } from "react-bootstrap";
import { useEffect, useState } from "react";
export default function HomePage() {
  let userInteracted = false;
  useEffect(() => {
    setTimeout(() => {
      if (userInteracted === false) {
        const element = document.getElementById("maincontent");
        const el = document.getElementsByClassName("mynav");
        const headerOffset = el[0].offsetHeight;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 5000);
  }, []);
  return (
    <div
      onWheel={() => {
        userInteracted = true;
      }}
      onMouseMove={() => {
        userInteracted = true;
      }}
      onTouchStart={() => {
        userInteracted = true;
      }}
    >
      <div className="titlecont">
        <h1>
          <span className="title1">Infinity </span>
          <span className="title2">2k22</span>
        </h1>
      </div>
      <section id="maincontent"></section>
      <section className="maincontent">
        <h1>WELCOME TO INFINITY 2K22</h1>
        <p>
          INFINITY is an annual event being conducted for more than a decade now
          and also considered as a top notch event and has attracted many
          brilliant minds by expanding by line of thought and giving them a
          greater exposure to what the industries expect from students. This
          year too we expect a response that would surpass the ones in the past
          as we are back with a lot of rejuvenating events for computer science
          geeks!
        </p>
        <Carousel fade>
          <Carousel.Item>
            <Image src="incognito.svg" className="d-block w-100" />
          </Carousel.Item>
          <Carousel.Item>
            <Image src="queryshots.svg" className="d-block w-100" />
          </Carousel.Item>
          <Carousel.Item>
            <Image src="techfeud.svg" className="d-block w-100" />
          </Carousel.Item>
          <Carousel.Item>
            <Image src="technergy.svg" className="d-block w-100" />
          </Carousel.Item>
          <Carousel.Item>
            <Image src="techtactoe.svg" className="d-block w-100" />
          </Carousel.Item>
        </Carousel>
        <br />
        <h1>ABOUT CSE DEPARTMENT</h1>
        <p>
          The Department of Computer Science and Engineering came into being in
          the year 1988. Since then it is offering most sought after courses in
          the field of Computer Science and Engineering, both at undergraduate
          and graduate levels. The department has well qualified staff,
          Infrastructure and state-of- the- art equipment. Apart from regular
          academic work, the department is actively involved in industrial
          training, consultancy, research and other professional activities. The
          department has close interaction with software development firms and
          R&amp;D establishments.
        </p>
        <h1>Head of Department</h1>
        <Image src="hod.jpg" className="d-block w-100 circleimg centreimage" />
        <h2>Prof. K. Shyamala</h2>
      </section>
    </div>
  );
}
