import { useEffect, useMemo, useState } from 'react';
import { subscribeToProducts } from '../firebase/firestore';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import productHero from '../assets/images/product1.png';

export default function Services() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (data) => {
        setProducts(data);
        setLoading(false);
        setError(null);
      },
      () => {
        setLoading(false);
        setError('Failed to load products. Please try again.');
      }
    );
    return unsubscribe;
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [products]);

  const visibleProducts = useMemo(() => {
    let list = products.filter((p) => p.status !== 'inactive');

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term)
      );
    }

    if (category !== 'all') {
      list = list.filter((p) => p.category === category);
    }

    list = [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0; // newest = Firestore's default order
    });

    return list;
  }, [products, search, category, sortBy]);

  return (
    <>
      <section
        className="page-header hero-section text-white"
        style={{ backgroundImage: `url(${productHero})` }}
      >
        <div className="container">
          <h1 className="display-4 fw-bold">Our Products</h1>
          <p className="lead">Premium lotion for whitening and smooth skin.</p>
        </div>
      </section>

      <section className="container py-4">
        <div className="row g-3 align-items-center justify-content-center mb-4">
          <div className="col-auto">
            <SearchBar value={search} onChange={setSearch} placeholder="Search products..." />
          </div>
          <div className="col-auto">
            <select
              className="form-select bg-transparent text-white border-secondary"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c} className="text-dark">
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-auto">
            <select
              className="form-select bg-transparent text-white border-secondary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest" className="text-dark">Newest</option>
              <option value="price-asc" className="text-dark">Price: Low to High</option>
              <option value="price-desc" className="text-dark">Price: High to Low</option>
              <option value="name" className="text-dark">Name: A-Z</option>
            </select>
          </div>
        </div>
      </section>

      <section className="container py-5 pb-0">
        {loading ? (
          <LoadingSpinner label="Loading products..." />
        ) : error ? (
          <div className="empty-state">
            <i className="bi bi-exclamation-triangle fs-1 d-block mb-3" />
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inboxes fs-1 d-block mb-3" />
            No products available.
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-search fs-1 d-block mb-3" />
            No products match your search.
          </div>
        ) : (
          <div className="row">
            {visibleProducts.map((product) => (
              <div className="col-lg-4 mb-4" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="container py-5">
        <h2 className="text-center mb-5">Why Customers Love TEN TEN Products</h2>
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="feature-box">
              <h4>Best Solution</h4>
              <p>Helping customers achieve smoother, brighter, and glowing skin.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="feature-box">
              <h4>CEO Friendly and Teamwork</h4>
              <p>Friendly recommendations, real experiences, and polite customer service.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="feature-box">
              <h4>Provide Job Opportunities</h4>
              <p>Customers can also gain experience as product promoters and earn income.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
