import { Envelope, Instagram, Telephone } from "react-bootstrap-icons";
import { Ratio } from "react-bootstrap";
export default function ContactUs() {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div className="contactchild">
          <div className="imagecenter">
            <div></div>
            <Telephone width={75} height={75} />
            <div></div>
          </div>
          <h1>Convenor: Sanath</h1>
          <a
            target="_blank"
            href="https://wa.me/+918008495710"
            rel="noreferrer"
          >
            8008495710
          </a>
          <h1>Treasurer: Rupesh</h1>
          <a target="_blank" href="https://wa.me/+91773195395" rel="noreferrer">
            773195395
          </a>
        </div>
        <div className="contactchild">
          <div className="imagecenter">
            <div></div>
            <Envelope width={75} height={75} />
            <div></div>
          </div>
          <h1>Mail ID:</h1>
          <a
            target="_blank"
            href="mailto:infinity2k22.ou@gmail.com"
            rel="noreferrer"
          >
            infinity2k22.ou@gmail.com
          </a>
        </div>
        <div className="contactchild">
          <div className="imagecenter">
            <div></div>
            <Instagram width={75} height={75} />
            <div></div>
          </div>
          <h1>Instagram : </h1>
          <a
            href="https://instagram.com/infinity2k22ou/"
            target="_blank"
            rel="noreferrer"
          >
            infinity2k22ou
          </a>
        </div>
        <div className="contactchild">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1>Address: </h1>
              <p>
                Department of Computer Science and Engineering
                <br /> Osmania University, Hyderabad
                <br /> 500 007
              </p>
            </div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1570.2374466365034!2d78.51891866844238!3d17.407366381130057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb999fe3618c93%3A0x69d06ce85564c422!2sComputer%20Science%20Engineering%20Department!5e0!3m2!1sen!2sin!4v1649660461802!5m2!1sen!2sin"
              style={{ border: 0 }}
              allowfullscreen=""
              width={500}
              height={500}
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </>
  );
}
