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
                    src={`events/${image}`}
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
            image: "CodeFury.webp",
            name: "CodeFury",
            info: "This is a callout to all the coding geeks out there. Showcase your coding and problem-solving skills by participating in the grand coding competition of Infinity 2022 - Codefury. Win exciting cash prizes and gifts by performing exceptionally. Anyone with a knack for coding is welcome to join the competition and who knows, you might end up being the champion.",
            quote: `Process: 
      3 Rounds of coding competition`,
            register: "https://docs.google.com/forms/d/18PQr9f48hM2OsklvMULryGXM9kpeHEAVTgg3kdyZSKc/edit",
        },
        {
            image: "InfyHunt.webp",
            name: "InfyHunt",
            info: `Have a knack for hunting games and mystery solving? This one's for you! Participate in the hunt of infinity as you unravel many clues and find yourself pushing your limits of creative thinking. However, it’s not an event of CSE without its own spice of technology. Register here to uncover what that is and win awesome prizes.`,
            quote: `Process: 
Round 1:  Solve the mystery!
Round 2: This one’s a mystery ;)`,
            register: "https://docs.google.com/forms/d/1Y5aZclvDYX84lTJdkR6B-Sps0WAHYAClfTdcm8Dkm2o/edit",
        },
        {
            image: "Poster Presentation.webp",
            name: "Poster Presentation",
            info: "How would you feel if you had the chance to pitch in your ideas to make something creative and get the feedback from experts? If this makes you excited, then we are happy to announce that we are ready to provide a platform for you for the same. Explain your ideas in the form of posters to our mentors and get more ideas to explore it! What are you waiting for? Let’s get started, Register here.",
            quote: `Process:
Everyone is welcome to explain your ideas here!
`,
            register: "https://docs.google.com/forms/d/1Bp02qLXQQY1QG-NKxBbFQvHJ6uI4q1esqtnvY1xim94/edit",
        },
        {
            image: "ProjectExpo.webp",
            name: "Project Expo",
            info: "Want to explain your projects or a research topic to an audience who can understand and provide you with feedback to expand your horizons? We welcome you to our event Infinity to appreciate your talent and help with improvements, if any. Explain your project or a research paper to subject matter experts and get suggestions. The best presentation gets a prize",
            quote: `Process:
Everyone is welcome to explain your project here!
`,
            register: "https://docs.google.com/forms/d/1tKte2NxvC3ZdNYCvj6icFMXA4hg6CCrLHGyMFIZX8k8/edit",
        },
        {
            image: "QueryShots.webp",
            name: "Query Shots",
            info: `Select students
From any_college
Where interest in ("DBMS");


Yes, you guessed it right! If you have an interest or a knack for the famous subject- Database Management Systems, you are at the right place. This is a competition where you get to showcase your DBMS skills in a series of challenges through quizzes and query making. We welcome you all to explore this corner of yours. Get registered.`,
            quote: `
Round-1: DBMS quiz a theme based quiz where you need to answer the quiz and take the shots for your correct answer
Round 2: Unlock shots of fun by making queries`,
            register: "https://docs.google.com/forms/d/1YvHsuLPoZGhD68qZ8S1wffwYRewpXpLCvd-r-lxJEsI/edit",
        },
        {
            image: "Incognito.webp",
            name: "Incognito",
            info: "At some point, we all have blinded chrome by using the incognito tab but did you ever wonder how the other side would have felt like? Experience it here through a series of events which come with their own twist of blindness added to them. Experience it in infinity’s incognito ;)",
            quote: `Round 1:  Stand out from the crowd with your fundamentals
Round 2:  Unbug the bugs 
Round 3:  Let's go blind coding and make a chance to win INCOGNITO
`,
            register: "https://docs.google.com/forms/d/1UVo69RSH1gBKsQiZ85hc1x5uvWpoelYeQSib_2hAgOA/viewform",
        },
        {
            image: "Technergy.webp",
            name: "Technergy",
            info: `When in a room, be a roommate!
When in a team, be a teammate!

Have you ever wondered what these quotes really mean? They ask you to build synergy with the members you are with and so does our event where the synergy with your team-members plays the most crucial role. Explore these events and experience some fun. Get registered!
`,
            quote: `Round 1: Relay coding
Round 2: Build a code based on the input and output given
`,
            register: "https://docs.google.com/forms/d/1kI72-z7_JiwcL5GgMDCckK4nw5kPsqpt_ObMqvbreMw/edit",
        },
        {
            image: "TechTacToe.webp",
            name: "Tech Tac Toe",
            info: "Remember the good old game tic-tac-toe, snakes and ladders? How would you feel playing them at a tech event with some technological spice mix added? We are definitely sure that you would have plenty of fun since it’s not just about game tactics but also your mind-tactics. Participate by registering here.",
            quote: `Round 1: tic tac toe with quiz where the team can mark X or O only when you get the quiz question right
Round 2: Snakes and ladders infused with quiz
`,
            register: "https://docs.google.com/forms/d/19TgSTX3FqH-fVK_qtu14xPoKLemxt3PDLkUt0zXovq0/edit",
        },
        {
            image: "Logophilia.webp",
            name: "Logophilia",
            info: "Think you know your logos well? Then use your gray matter to find the gray matter (logo’s silhouette). A fun logo based event to enjoy with your team where you test whether brand recall exists without a brand's defining characteristic—its name.",
            quote: `Round 1: Quiz based on logos
Round 2: Who am I?
`,
            register: "https://docs.google.com/forms/d/1_FJqarhYa8spYxMDAyw5NOCybuhXr2QZCHtvoqZZSsw/edit",
        },
        {
            image: "TechnoThrone.webp",
            name: "Technothrone",
            info: "If you risk nothing then you risk everything ! That’s how we play the game! A Casino Party event where you experience the fun and excitement of playing in a real casino, but instead of you and your team going to a casino to play, the 'casino' is brought to you! Put your gambling skills to the test with this fun event, the idea is simple: bet your knowledge and ascend the throne. Risk it here",
            quote: `Round: Play an exciting quiz to earn points, but this comes at a price: deposit your points into a pool where the highest risk taker+correct answer combo receives all the points from the pool.`,
            register: "https://docs.google.com/forms/d/11tIVI-qfX4Uld47vyWiLBaU9WT08nkrWqmyb2GPgvGE/edit",
        },
        {
            image: "ThinkVest.webp",
            name: "Thinkvest",
            info: "Ever wanted to be in a real shark tank? This is your chance. Pitch in your ideas, get suggestions and build a virtual startup. We welcome all the entrepreneurs to bring your creative ideas to the bench",
            quote: `Round 1: Start a company,design a logo,think big 
Round 2: Choose a brand ambassador,make your company more successful`,
            register: "https://docs.google.com/forms/d/1JHMkTCNJ34iF1bDACpeNd2-5xyxSWGXAC5UFChf5ums/edit",
        },
        {
            image: "Hackathon.webp",
            name: "Hackathon",
            info: "Solve problems and develop solutions to issues in your own unique way. All you need to do is assemble your team. ",
            quote: ``,
            register: "https://forms.gle/Qfbh8cQdayKpKWBN7",
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
