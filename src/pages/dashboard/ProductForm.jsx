import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addProduct, updateProduct, getProductsOnce } from '../../firebase/firestore';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = {
  name: '',
  category: '',
  description: '',
  price: '',
  image: '',
  status: 'active',
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      try {
        const all = await getProductsOnce();
        const existing = all.find((p) => p.id === id);
        if (existing) {
          setForm({
            name: existing.name || '',
            category: existing.category || '',
            description: existing.description || '',
            price: existing.price ?? '',
            image: existing.image || '',
            status: existing.status || 'active',
          });
        } else {
          toast.error('Product not found.');
          navigate('/dashboard/products');
        }
      } catch (err) {
        toast.error('Failed to load product: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate]);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Product name is required.';
    if (!form.category.trim()) next.category = 'Category is required.';
    if (!form.description.trim()) next.description = 'Description is required.';
    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0) {
      next.price = 'Enter a valid, non-negative price.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload = { ...form, price: Number(form.price) };

    try {
      if (isEdit) {
        await updateProduct(id, payload);
        toast.success('Product updated successfully.');
      } else {
        await addProduct(payload);
        toast.success('Product created successfully.');
      }
      navigate('/dashboard/products');
    } catch (err) {
      toast.error('Failed to save product: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading product..." />;

  return (
    <div>
      <div className="dashboard-topbar">
        <h2 className="mb-0">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
      </div>

      <div className="dashboard-card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className={`form-control bg-transparent text-white border-secondary ${errors.name ? 'is-invalid' : ''}`}
              value={form.name}
              onChange={handleChange('name')}
              placeholder="e.g. TN Gluta Extra"
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Category</label>
              <input
                type="text"
                className={`form-control bg-transparent text-white border-secondary ${errors.category ? 'is-invalid' : ''}`}
                value={form.category}
                onChange={handleChange('category')}
                placeholder="e.g. Lotion"
              />
              {errors.category && <div className="invalid-feedback">{errors.category}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`form-control bg-transparent text-white border-secondary ${errors.price ? 'is-invalid' : ''}`}
                value={form.price}
                onChange={handleChange('price')}
                placeholder="0.00"
              />
              {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              rows="4"
              className={`form-control bg-transparent text-white border-secondary ${errors.description ? 'is-invalid' : ''}`}
              value={form.description}
              onChange={handleChange('description')}
              placeholder="Short product description"
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Image URL</label>
            <input
              type="text"
              className="form-control bg-transparent text-white border-secondary"
              value={form.image}
              onChange={handleChange('image')}
              placeholder="https://..."
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Status</label>
            <select
              className="form-select bg-transparent text-white border-secondary"
              value={form.status}
              onChange={handleChange('status')}
            >
              <option value="active" className="text-dark">Active</option>
              <option value="bestseller" className="text-dark">Best Seller</option>
              <option value="new" className="text-dark">New</option>
              <option value="inactive" className="text-dark">Inactive</option>
            </select>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button type="submit" className="btn btn-custom" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
            <button
              type="button"
              className="btn btn-outline-light"
              onClick={() => navigate('/dashboard/products')}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}