import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { resolveProductImage } from '../utils/productImages';

export default function ProductCard({ product }) {
  const { name, description, price, image, status } = product;
  const imageUrl = resolveProductImage(image);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success(`${name} added to cart.`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(product, 1);
    navigate('/cart');
  };

  return (
    <div className="card product-card h-100">
      {status === 'inactive' ? null : (
        <div className="badge-featured">{status === 'new' ? 'NEW' : 'BEST SELLER'}</div>
      )}
      {imageUrl ? (
        <img
          src={imageUrl}
          className="card-img-top"
          alt={name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div
          className="card-img-top d-flex align-items-center justify-content-center bg-white bg-opacity-10 text-white-50"
          style={{ height: 280 }}
        >
          <i className="bi bi-image fs-1" />
        </div>
      )}
      <div className="card-body text-center d-flex flex-column">
        <h3>{name}</h3>
        <p className="flex-grow-1">{description}</p>
        <div className="price">${Number(price).toFixed(2)}</div>
        <br />
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-outline-light" onClick={handleAddToCart}>
            <i className={`bi ${justAdded ? 'bi-check-lg' : 'bi-cart-plus'} me-1`} />
            {justAdded ? 'Added' : 'Add to Cart'}
          </button>
          <button className="btn btn-custom" onClick={handleBuyNow}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
