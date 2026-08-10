export default function ProductChatCard({ product }) {
  if (!product) return null;

  return (
    <div className="card mb-2 shadow-sm">
      <div className="card-body p-3">

        <h6 className="card-title mb-1">
          {product.name}
        </h6>

        <div className="text-muted small">
          {product.brand}
        </div>

        <div className="fw-bold mt-2">
          ₹{product.price}
        </div>

        <div className="text-success small mt-1">
          {product.availableQuantity} pcs in stock
        </div>

      </div>
    </div>
  );
}