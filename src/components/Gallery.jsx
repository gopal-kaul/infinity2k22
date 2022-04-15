import { Carousel, Image } from "react-bootstrap";
export default function Gallery() {
  return (
    <div>
      <h2>Infinity 2k20</h2>
      <Carousel>
        {[...Array(14)].map((i, idx) => (
          <Carousel.Item key={idx}>
            <Image className="d-block w-100 galleryimg" src={`gallery/${idx + 1}.webp`} />
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}
