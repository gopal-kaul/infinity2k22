import { Image } from "react-bootstrap";
import { Marquee } from "react-easy-marquee";
export default function Sponsors() {
  const photos1 = [
    "Being Zero",
    "Clear Trip",
    "Cyient",
    "DRDO",
    "IndianImmunologicals",
  ];
  const photos2 = [
    "K Raheja Corp",
    "Magnaquest",
    "NMDC",
    "Wesley College",
    "Zetagile",
  ];
  return (
    <>
      <h1 style={{ color: "white", fontSize: "2.5rem" }}>
        Previous Sponsors :
      </h1>
      <Marquee duration={15000} background="#fafafa" className="sponsorrow">
        {photos1.map((image) => (
          <Image
            key={image}
            src={`sponsors/${image}.svg`}
            alt="picsum"
            className="sponsorchild"
          />
        ))}
      </Marquee>
      <Marquee
        duration={15000}
        background="#fafafa"
        className="sponsorrow"
        reverse
      >
        {photos2.map((image) => (
          <Image
            key={image}
            src={`sponsors/${image}.svg`}
            alt="picsum"
            className="sponsorchild"
          />
        ))}
      </Marquee>
    </>
  );
}
