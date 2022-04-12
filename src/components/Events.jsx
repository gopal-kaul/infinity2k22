import { Card, Image } from "react-bootstrap";

function MyCard({ image, name, info, quote, registerlink }) {
  if (name !== "") {
    return (
      <Card style={{ width: "18rem" }}>
        <Card.Img src={`${image}`} variant="top" />
        <Card.Body>
          <Card.Title>{name}</Card.Title>
          <Card.Text>{info}</Card.Text>
          <Card.Text>{quote}</Card.Text>
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
            <Card.Text>{quote}</Card.Text>
          </Card.Body>
        </Card>
      </>
    );
  }
}

export default function Events() {
  const events = [
    {
      image: "queryshots.svg",
      name: "Query Shots",
      info: "This is a competition where participants get to showcase your DBMS skills in a series of challenges by using their SQL knowledge.",
      quote: "SELECT students from 'any college' where interest in DBMS;",
      registerlink: "#",
    },
    {
      image: "incognito.svg",
      name: "Incognito",
      info: "Experience a situation where a laptop goes incognito on you. Students are supposed to code with their screens being off, followed by debugging in the second round.",
      quote: "'The eyes are useless when the mind awakens.",
      registerlink: "#",
    },
    {
      image: "technergy.svg",
      name: "Technergy",
      info: "Students are put through a series of competitions where their synergy with their teammates plays the most crucial role. The first round is a relay coding round which is followed by the second round- a debate on the current trending technologies lke cryptocurrencies, AI etc.",
      quote:
        "'The best teamwork comes from people who are working independently towards one goal in unison' - James Penny",
      registerlink: "#",
    },
    {
      image: "techfeud.svg",
      name: "Techfeud",
      info: "A fun logo based event to enjoy with your team where you test whether brand recall exists without a brand's defining characteristic- it's name followed by a feud based event in which two teams compete to name the most popular answers to survey questions in order to win points.",
      quote: "'The strongest logos tell the simplest stories'",
      registerlink: "#",
    },
    {
      image: "techtactoe.svg",
      name: "Tech Tac Toe",
      info: "Students are taken back to their childhood games while they use their current technological knowledge. The first round is a tic-tac-toe game where participants can mark X or O only when they answer to a technical question. The second round is going to be a snakes & ladders game following the same theme.",
      quote: "",
      registerlink: "#",
    },
    { image: "", name: "", info: "", quote: "", register: "" },
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
            registerlink={event.registerlink}
          />
        );
      })}
    </div>
  );
}
