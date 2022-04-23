import { Image } from "react-bootstrap";
import { Marquee } from "react-easy-marquee";
export default function Sponsors() {
  const photos1 = [
    "LIC"
  ];
  const photos2 = ["sensen.ai"];
  return (
    <>
      <h1 style={{ color: "white", fontSize: "2.5rem" }}>
        Our Sponsors :
      </h1>
      <Marquee duration={15000} background="#fafafa" className="sponsorrow">
        {photos1.map((image) => (
          <Image
            key={image}
            src={`sponsors/${image}.webp`}
            alt={`${image}`}
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
            src={`sponsors/${image}.webp`}
            alt={`${image}`}
            className="sponsorchild"
          />
        ))}
      </Marquee>
    </>
  );
}
