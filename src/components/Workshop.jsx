import { Image, Carousel } from "react-bootstrap";
export default function Workshop() {
  return (
    <>
      <div className="maincontent">
        <h1>Workshop on Google AI and Machine Learning</h1>
        <p>
          Infinity 2k22 presents a two day hands on live workshop on AI and
          Machine Learning
        </p>
        <Carousel fade style={{ marginBottom: "10vh" }}>
          {[...Array(14)].map((image, idx) => (
            <Carousel.Item>
              <Image
                key={image}
                src={`workshop/${idx + 1}.webp`}
                alt={`${image}`}
                className="w-100 d-block"
              />
            </Carousel.Item>
          ))}
        </Carousel>
        <Image src="workshop.jpg" className="d-block w-100" />
        <br />
        <br />
      </div>
      <div className="secondarycontent">
        <h1>Workshop Objectives</h1>
        <p>At the end of this Workshop, participants will be able to:</p>
        <ul>
          <li>Understand AI , Machine Learning Processes and It's types.</li>
          <li>Transform their Idea to Implementation using ML.</li>
          <li>
            Understand Neural networks and Implementation using practical
            approach.
          </li>
          <li>
            Understand ML using real life problem statements (Predicting a House
            price, Next video recommendation for a user).
          </li>
          <li>
            Use Python Libraries: Numpy, Pandas, Matplotlib, Scikit-learn,
            TensorFlow.
          </li>
          <li>Projects like Image captioning, classifiers.</li>
        </ul>
        <p>
          Each and every detail such as libraries used in the code to how the
          output got produced will be explained in practical approach
          Certificate by Google ExploreML will be provided for participants for
          both beginner and Intermediate tracks.
        </p>
        <h1>Eligibility</h1>
        <p>
          All undergraduate and postgraduate students can participate in the
          workshop. Students from other backgrounds who are passionate about
          technology are encouraged to participate. All Computer Science,
          Electronics faculty members of the institution can also participate.
        </p>
        <h1>Prerequisites</h1>
        <p>
          Basic Knowledge of Computers &amp; Internet Participants should bring
          their own laptops. (A group of 2-3 students can also share a laptop).
        </p>
        <div className="centerbtn">
          <button className="registerbtn">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeZYilfQxo00pKvxIfP3XKwq6k5HKsoJFHLQwmAwLNFMSkEjA/viewform"
              rel="noreferrer"
              target="_blank"
              style={{ textDecoration: "none" }}
            >
              <p>Register</p>
            </a>
          </button>
        </div>
      </div>
    </>
  );
}
