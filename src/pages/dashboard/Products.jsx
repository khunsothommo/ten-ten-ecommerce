import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useProducts from '../../hooks/useProducts';
import { deleteProduct, bulkAddProducts } from '../../firebase/firestore';
import { fallbackProducts } from '../../utils/seedProducts';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { resolveProductImage } from '../../utils/productImages';

export default function Products() {
  const { products, loading } = useProducts();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const visibleProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((p) => (p.status || 'active') === statusFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    return list;
  }, [products, search, statusFilter, sortBy]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Failed to delete product: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const { succeeded, failed } = await bulkAddProducts(fallbackProducts);
      if (succeeded > 0) {
        toast.success(`Added ${succeeded} sample product${succeeded === 1 ? '' : 's'} to Firestore.`);
      }
      if (failed > 0) {
        toast.error(`${failed} product${failed === 1 ? '' : 's'} failed to save.`);
      }
      setShowSeedModal(false);
    } catch (err) {
      toast.error('Failed to seed products: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div>
      <div className="dashboard-topbar">
        <h2 className="mb-0">Manage Products</h2>
        <div className="d-flex gap-2 flex-wrap">
          {!loading && products.length === 0 && (
            <button className="btn btn-outline-light" onClick={() => setShowSeedModal(true)}>
              <i className="bi bi-database-add me-1" /> Seed Sample Products
            </button>
          )}
          <Link to="/dashboard/products/new" className="btn btn-custom">
            <i className="bi bi-plus-lg me-1" /> Add Product
          </Link>
        </div>
      </div>

      <div className="dashboard-card mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-auto">
            <SearchBar value={search} onChange={setSearch} placeholder="Search products..." />
          </div>
          <div className="col-12 col-md-auto">
            <select
              className="form-select bg-transparent text-white border-secondary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all" className="text-dark">All Statuses</option>
              <option value="active" className="text-dark">Active</option>
              <option value="bestseller" className="text-dark">Best Seller</option>
              <option value="new" className="text-dark">New</option>
              <option value="inactive" className="text-dark">Inactive</option>
            </select>
          </div>
          <div className="col-12 col-md-auto">
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
          <div className="col-12 col-md-auto ms-md-auto text-white-50 small">
            {visibleProducts.length} of {products.length} products
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        {loading ? (
          <LoadingSpinner />
        ) : visibleProducts.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inboxes fs-1 d-block mb-3" />
            No products found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark-custom align-middle mb-0">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.image ? (
                        <img
                          src={resolveProductImage(p.image)}
                          alt={p.name}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className="bg-white bg-opacity-10 rounded d-flex align-items-center justify-content-center"
                          style={{ width: 48, height: 48 }}
                        >
                          <i className="bi bi-image text-white-50" />
                        </div>
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>
                      <span
                        className={`status-badge ${p.status === 'inactive' ? 'status-inactive' : 'status-active'}`}
                      >
                        {p.status || 'active'}
                      </span>
                    </td>
                    <td className="text-50 small">
                      {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : '—'}
                    </td>
                    <td className="text-end">
                      <Link
                        to={`/dashboard/products/${p.id}/edit`}
                        className="btn btn-sm btn-outline-dark me-2"
                      >
                        <i className="bi bi-pencil" />
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setDeleteTarget(p)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        show={!!deleteTarget}
        title="Delete Product"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirmLabel="Delete"
        confirmVariant="danger"
        busy={deleting}
      >
        Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot
        be undone.
      </Modal>

      <Modal
        show={showSeedModal}
        title="Seed Sample Products"
        onClose={() => setShowSeedModal(false)}
        onConfirm={handleSeed}
        confirmLabel="Add Products"
        confirmVariant="light"
        busy={seeding}
      >
        This will add {fallbackProducts.length} sample products (Body Spa, TN Gluta Extra, TEN
        3in1, and more) to your Firestore database. You can edit or delete any of them afterward.
        This button disappears once you have at least one product.
      </Modal>
    </div>
  );
}