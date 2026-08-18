import { Link } from 'react-router-dom';
import p from '../assets/images/p.jpg';
import p1 from '../assets/images/p1.jpg';
import p2 from '../assets/images/p2.jpg';

const mission = [
  {
    title: 'Set of Product',
    text: 'Customer should have a set of products recommended by the CEO to achieve quicker results.',
  },
  {
    title: 'Posting',
    text: 'Customers create daily video reviews using the product set and share them on platforms such as TikTok and Facebook. These videos serve as feedback and are reviewed by the team.',
  },
  {
    title: 'Sharing Group',
    text: "Customers should share new video posts from the teamwork or the CEO's official account page.",
  },
];

const chosen = [
  { img: p, name: 'Raa' },
  { img: p1, name: 'Mak Ny' },
  { img: p2, name: 'TongXie' },
];

export default function About() {
  return (
    <>
      <section className="hero hero-section bg-about text-white">
        <div className="container">
          <h1>TEN TEN</h1>
          <h3 className="mb-4">Job Opportunities</h3>
          <p className="lead mb-4">
            We help people create new income opportunities by promoting our trusted products.
            Join our simple 3-step program and start your journey toward growth, success, and
            financial rewards.
          </p>
          <Link to="/services" className="btn btn-custom btn-lg">
            View Products
          </Link>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="text-center mb-5">Customer Mission</h2>
        <div className="row">
          {mission.map((m) => (
            <div className="col-md-4 mb-4" key={m.title}>
              <div className="card-mission">
                <div className="card-body text-center p-4">
                  <h4>{m.title}</h4>
                  <p className="px-2">{m.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-5">
        <h2 className="text-center mb-5">Customer Who Chosen</h2>
        <div className="row">
          {chosen.map((c) => (
            <div className="col-md-4 mb-4 d-flex" key={c.name}>
              <div className="card w-100">
                <img src={c.img} className="card-img-top" alt={c.name} />
                <div className="card-body text-center">
                  <h4>{c.name}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
