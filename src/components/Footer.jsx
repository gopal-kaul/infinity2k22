import { Envelope, Instagram, Whatsapp } from "react-bootstrap-icons";
export default function Footer() {
  return (
    <footer className="myfooter">
      <strong>Infinity 2k22</strong>
      <br />
      <i>
        Department of Computer Science and Engineering
        <br /> Osmania University, Hyderabad
        <br /> 500 007
      </i>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            marginTop: "15px",
            width: "150px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <a
            rel="noreferrer"
            target="_blank"
            href="https://www.instagram.com/infinity2k22ou/"
          >
            <Instagram size={20} />
          </a>
          <a
            target="_blank"
            href="https://wa.me/+918008495710"
            rel="noreferrer"
          >
            <Whatsapp size={20} />
          </a>
          <a
            target="_blank"
            href="mailto:infinity2k22.ou@gmail.com"
            rel="noreferrer"
          >
            <Envelope size={20} />
          </a>
        </div>
      </div>
      <p>&copy;2022 Copyright Infinity 2k22 </p>
    </footer>
  );
}
