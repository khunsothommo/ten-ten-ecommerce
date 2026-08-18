import { Link } from 'react-router-dom';
import me from '../assets/images/me.jpg';
import me1 from '../assets/images/me1.jpg';
import me2 from '../assets/images/me2.jpg';

const features = [
  {
    title: 'Good Formula',
    text: 'Our products are made with carefully selected, skin-friendly ingredients that are gentle for everyday use. We focus on quality and safety to help you achieve healthy, radiant skin with confidence.',
  },
  {
    title: 'Long Lasting Moisture',
    text: 'Enjoy long-lasting hydration that keeps your skin soft, smooth, and refreshed throughout the day. Our nourishing formula helps lock in moisture for healthy, radiant-looking skin.',
  },
  {
    title: 'Healthy Glow',
    text: 'Nourish and hydrate your skin with products designed to keep it smooth, glow, and naturally radiant every day.',
  },
];

const feedback = [
  { img: me, title: 'Skin Tone' },
  { img: me1, title: 'Whitening, Brightening' },
  { img: me2, title: 'Glow, Smooth' },
];

export default function Home() {
  return (
    <>
      <section className="hero hero-section bg-home text-white">
        <div className="container">
          <h1>TEN TEN</h1>
          <h3 className="mb-4">Premium Body Lotion</h3>
          <p className="lead mb-4">
            Radiant, healthy-looking skin brings out your natural charm and helps you face every
            moment with confidence.
            <br />
            Our company provides premium products to take care of these concerns.
          </p>
          <Link to="/about" className="btn btn-custom btn-lg">
            View More Info
          </Link>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="text-center mb-5">Why Choose TEN TEN?</h2>
        <div className="row">
          {features.map((f) => (
            <div className="col-md-4 mb-4" key={f.title}>
              <div className="text-card">
                <div className="card-body text-center">
                  <h4>{f.title}</h4>
                  <p>{f.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-5">
        <h2 className="text-center mb-5">Feedback from Customers</h2>
        <div className="row">
          {feedback.map((f) => (
            <div className="col-md-4 mb-4" key={f.title}>
              <div className="card">
                <img src={f.img} className="card-img-top" alt={f.title} />
                <div className="card-body">
                  <h4>{f.title}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
