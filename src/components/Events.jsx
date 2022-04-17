import { Card } from "react-bootstrap";
import { ThreeDotsVertical, X } from "react-bootstrap-icons";
import { useState } from "react";

function MyCard({ image, name, info, quote, registerlink }) {
  const [hide, setHide] = useState(false);
  if (name !== "") {
    return (
      <Card>
        <Card.Img
          style={{ backgroundColor: "black" }}
          className={`${hide ? "hideimg" : "showimg"}`}
          src={`${image}`}
          variant="top"
        />
        <Card.Body>
          <div onClick={() => setHide((old) => !old)}>
            <Card.Title
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <h2>{name}</h2>
              {!hide ? (
                <ThreeDotsVertical style={{ left: "0%", color: "black" }} />
              ) : (
                <X style={{ left: "0%", color: "black" }} />
              )}
            </Card.Title>
            {info.split("\n").map((line) => {
              return (
                <div key={line}>
                  <Card.Text>{line}</Card.Text>
                </div>
              );
            })}
            {hide && (
              <>
                {quote.split("\n").map((line) => {
                  return (
                    <div key={line}>
                      <Card.Text
                        className={`cardquote ${hide ? "showimg" : "hideimg"}`}
                      >
                        <strong>{line}</strong>
                      </Card.Text>
                    </div>
                  );
                })}
              </>
            )}
          </div>
          <div>
            <a
              href={`${registerlink}`}
              rel="noreferrer"
              target="_blank"
              style={{ textDecoration: "none" }}
            >
              <button className="registerbtn">
                <p>Register</p>
              </button>
            </a>
          </div>
        </Card.Body>
      </Card>
    );
  } else {
    return (
      <>
        <Card style={{ width: "0%", height: "0%", backgroundColor: "black" }}>
          <Card.Body>
            <Card.Title>{name}</Card.Title>
            <Card.Text>{info}</Card.Text>
          </Card.Body>
        </Card>
      </>
    );
  }
}

export default function Events() {
  const events = [
    {
      image: "Hackathon.webp",
      name: "Hackathon",
      info: "Solve problems and develop solutions to issues in your own unique way. All you need to do is assemble your team. ",
      quote: ``,
      register: "https://forms.gle/Qfbh8cQdayKpKWBN7",
    },
    {
      image: "CodeFury.webp",
      name: "CodeFury",
      info: "This is a callout to all the coding geeks out there. Showcase your coding and problem-solving skills by participating in the grand coding competition of Infinity 2022 - Codefury. Win exciting cash prizes and gifts by performing exceptionally. Anyone with a knack for coding is welcome to join the competition and who knows, you might end up being the champion.",
      quote: `Process: 
      3 Rounds of coding competition`,
      register: "https://forms.gle/auFTMry5qA54qe6m6",
    },
    {
      image: "InfyHunt.webp",
      name: "InfyHunt",
      info: `Have a knack for hunting games and mystery solving? This one's for you! Participate in the hunt of infinity as you unravel many clues and find yourself pushing your limits of creative thinking. However, it’s not an event of CSE without its own spice of technology. Register here to uncover what that is and win awesome prizes.`,
      quote: `Process: 
Round 1:  Solve the mystery!
Round 2: This one’s a mystery ;)`,
      register: "",
    },
    {
      image: "Poster Presentation.webp",
      name: "Poster Presentation",
      info: "How would you feel if you had the chance to pitch in your ideas to make something creative and get the feedback from experts? If this makes you excited, then we are happy to announce that we are ready to provide a platform for you for the same. Explain your ideas in the form of posters to our mentors and get more ideas to explore it! What are you waiting for? Let’s get started, Register here.",
      quote: `Process:
Everyone is welcome to explain your ideas here!
`,
      register: "",
    },
    {
      image: "Project Expo.webp",
      name: "Project Expo",
      info: "Want to explain your projects or a research topic to an audience who can understand and provide you with feedback to expand your horizons? We welcome you to our event Infinity to appreciate your talent and help with improvements, if any. Explain your project or a research paper to subject matter experts and get suggestions. The best presentation gets a prize",
      quote: `Process:
Everyone is welcome to explain your project here!
`,
      register: "",
    },
    {
      image: "Query Shots.webp",
      name: "Query Shots",
      info: `Select students
From any_college
Where interest in (“DATABASE MANAGEMENT SYSTEMS”,”DATA MODELING”);


Yes, you guessed it right! If you have an interest or a knack for the famous subject- Database Management Systems, you are at the right place. This is a competition where you get to showcase your DBMS skills in a series of challenges through quizzes and query making. We welcome you all to explore this corner of yours. Get registered.`,
      quote: "SELECT students from 'any college' where interest in DBMS;",
      registerlink: "#",
    },
    {
      image: "Incognito.webp",
      name: "Incognito",
      info: "At some point, we all have blinded chrome by using the incognito tab but did you ever wonder how the other side would have felt like? Experience it here through a series of events which come with their own twist of blindness added to them. Experience it in infinity’s incognito ;)",
      quote: `Process:
Round 1: Blind Coding
Round 2: Debugging
`,
      registerlink: "#",
    },
    {
      image: "Technergy.webp",
      name: "Technergy",
      info: `When in a room, be a roommate!
When in a team, be a teammate!
 
Have you ever wondered what these quotes really mean? They ask you to build synergy with the members you are with and so does our event where the synergy with your team-members plays the most crucial role. Explore these events and experience some fun. Get registered!
`,
      quote: `Process:
        Round 1: Relay Coding where team members are informed of the problem statement at once and members have to develop code one by one taking breaks after a certain interval and the next member has to develop on the previous member’s code.
Round 2: A debate round where you have to make use of your wit to convince the other team about your argument.
`,
      registerlink: "#",
    },
    {
      image: "Tech-Tac-Toe.webp",
      name: "Tech Tac Toe",
      info: "Remember the good old game tic-tac-toe, snakes and ladders? How would you feel playing them at a tech event with some technological spice mix added? We are definitely sure that you would have plenty of fun since it’s not just about game tactics but also your mind-tactics. Participate by registering here.",
      quote: `Round 1: tic tac toe with quiz where the team can mark X or O only when you get the quiz question right
Round 2: Snakes and ladders infused with quiz
`,
      registerlink: "#",
    },
    {
      image: "Logophilia.webp",
      name: "Logophilia",
      info: "Think you know your logos well? Then use your gray matter to find the gray matter (logo’s silhouette). A fun logo based event to enjoy with your team where you test whether brand recall exists without a brand's defining characteristic—its name. A feud based event in which two teams compete to name the most popular answers to survey questions in order to win points. Participate by registering here",
      quote: `Round 1: Questions based on opinion or expectations in tech are taken from a survey before the event. Participants must respond not with their own opinions and expectations, but with guesses as to which answers were common or popular.
Round 2: A quiz based on logos and company descriptions 
`,
      register: "",
    },
    {
      image: "Technothrone.webp",
      name: "Technothrone",
      info: "If you risk nothing then you risk everything ! That’s how we play the game! A Casino Party event where you experience the fun and excitement of playing in a real casino, but instead of you and your team going to a casino to play, the 'casino' is brought to you! Put your gambling skills to the test with this fun event, the idea is simple: bet your knowledge and ascend the throne. Risk it here",
      quote: `Round:: Play an exciting quiz to earn points, but this comes at a price: deposit your points into a pool where the highest risk taker+correct answer combo receives all the points from the pool.`,
      register: "",
    },
    {
      image: "Thinkvest.webp",
      name: "Thinkvest",
      info: "Ever wanted to be in a real shark tank? This is your chance. Pitch in your ideas, get suggestions and build a virtual startup. We welcome all the entrepreneurs to bring your creative ideas to the bench",
      quote: ``,
      register: "",
    },
    { image: "", name: "", info: "", quote: ``, register: "" },
  ];
  return (
    <div className="eventcontainer">
      {events.map((event) => {
        return (
          <MyCard
            key={event}
            image={event.image}
            name={event.name}
            info={event.info}
            quote={event.quote}
            registerlink={event.register}
          />
        );
      })}
    </div>
  );
}
