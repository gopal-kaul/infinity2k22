import { Image } from "react-bootstrap";
import { Marquee } from "react-easy-marquee";
export default function Sponsors() {
  const photos1 = [
    {
      name: "Being Zero",
      extension: "png",
    },
    {
      name: "Cleartrip",
      extension: "svg",
    },
    {
      name: "Cyient",
      extension: "svg",
    },
    {
      name: "DRDO",
      extension: "svg",
    },
    {
      name: "Indian Immunologicals Limited",
      extension: "png",
    },
  ];
  const photos2 = [
    {
      name: "K Raheja Corp",
      extension: "png",
    },
    {
      name: "Magnaquest",
      extension: "png",
    },
    {
      name: "NMDC",
      extension: "png",
    },
    {
      name: "Wesley College",
      extension: "png",
    },
    {
      name: "Zetagile",
      extension: "png",
    },
  ];
  return (
    <>
      <h1 style={{ color: "white", fontSize: "3rem" }}>
        Previous Sponsors :
      </h1>
      <Marquee
        duration={15000}
        background="#fafafa"
        className="sponsorrow"
        height={"20vh"}
      >
        {photos1.map((image) => (
          <Image
            key={image}
            src={`sponsors/${image.name}.${image.extension}`}
            alt="picsum"
            className="sponsorchild"
          />
        ))}
      </Marquee>
      <Marquee
        duration={15000}
        background="#fafafa"
        className="sponsorrow"
        height={"20vh"}
        reverse
      >
        {photos2.map((image) => (
          <Image
            key={image}
            src={`sponsors/${image.name}.${image.extension}`}
            alt="picsum"
            className="sponsorchild"
          />
        ))}
      </Marquee>
    </>
  );
}
