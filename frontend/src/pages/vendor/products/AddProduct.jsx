import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';
import { addProduct, getProductById, updateProduct, getPresignedUploadUrl } from '../../../apis/services/product-service';

const AddProduct = () => {
  const navigate = useNavigate();
  const { id: productId } = useParams();

  // Form states
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [productCategory, setProductCategory] = useState('ELECTRONICS');
  
  // Image handling states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch product details if editing
  useEffect(() => {
    if (productId) {
      const fetchProductDetails = async () => {
        try {
          const data = await getProductById(productId);
          setProductName(data.name || '');
          setProductDescription(data.description || '');
          setProductPrice(data.price || '');
          setProductStock(data.availableQuantity ?? data.quantity ?? '');
          setImageUrl(data.image || '');
          setPreviewUrl(data.image || '');
          setProductBrand(data.brand || '');
          setProductCategory(data.category || 'ELECTRONICS');
        } catch (error) {
          console.error("Failed to fetch product details", error);
          toast.error("Could not load product details for editing.");
        }
      };
      fetchProductDetails();
    }
  }, [productId]);

  // Handle local file selection and type validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, and PNG image formats are allowed.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Upload image handler: hits pre-signed URL mapping and uploads binary to S3
  const handleImageUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image file first.");
      return;
    }

    try {
      setUploadingImage(true);
      const fileExtension = selectedFile.name.split('.').pop();
      
      const presignedData = await getPresignedUploadUrl(fileExtension, selectedFile.type);
      
      const uploadUrl = presignedData.uploadUrl || presignedData.url;
      const publicFileUrl = presignedData.fileUrl || presignedData.imageUrl || selectedFile.name;

      if (uploadUrl) {
        const s3Response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': selectedFile.type,
          },
          body: selectedFile,
        });

        if (!s3Response.ok) {
          throw new Error("Failed to upload file to S3 storage.");
        }
      }

      setImageUrl(publicFileUrl);
      toast.success("Image Uploaded Successfully!");
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error("Failed to upload image to S3.");
    } finally {
      setUploadingImage(false);
    }
  };
   
  const handleSave = async () => {
    if (!productName || !productPrice || !productStock || !imageUrl || !productBrand || !productDescription) {
      toast.error("Please fill in all fields and ensure the image is uploaded.");
      return;
    }

    const payload = {
      name: productName,
      description: productDescription,
      price: parseFloat(productPrice),
      image: imageUrl,
      brand: productBrand,
      availableQuantity: parseInt(productStock, 10),
      category: productCategory,
    };

    try {
      setLoading(true);
      if (productId) {
        await updateProduct({ ...payload, productId: Number(productId) });
        toast.success("Product Updated Successfully");
      } else {
        await addProduct(payload);
        toast.success("Product Added Successfully");
      }

      setTimeout(() => {
        navigate('/vendor/products');
      }, 1500);
    } catch (error) {
      console.error("Operation failed", error);
      toast.error(error.response?.data?.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid pt-5 px-2 px-md-4 bg-light min-vh-100 d-flex flex-column align-items-center">
      <ToastContainer />
      
      <div className="w-100" style={{ maxWidth: '750px' }}>
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center mb-4 gap-2">
          <div>
            <h2 className="fw-bold text-dark mb-0 fs-2">
              {productId ? "Modify Product Details" : "Add New Product"}
            </h2>
            <p className="text-muted small mb-0">
              {productId ? `Editing Entry Code Reference: ${productId}` : "Launch a brand new storefront item listing"}
            </p>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3 p-4 p-md-5 bg-white w-100 mb-5" style={{ maxWidth: '750px' }}>
        
        {/* INPUT: Product Name */}
        <div className="mb-4">
          <label className="form-label fw-bold text-secondary small">Product Name</label>
          <input 
            type="text" 
            className="form-control form-control-sm rounded-2 py-2.5" 
            placeholder="e.g., Realme 12 Pro Plus"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        {/* INPUT: Description */}
        <div className="mb-4">
          <label className="form-label fw-bold text-secondary small">Description</label>
          <textarea 
            className="form-control form-control-sm rounded-2 py-2.5" 
            rows="3"
            placeholder="Detailed product specifications..."
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
          />
        </div>

        {/* PRICE & STOCK */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6">
            <label className="form-label fw-bold text-secondary small">Price (₹)</label>
            <input 
              type="number" 
              className="form-control form-control-sm rounded-2 py-2.5" 
              placeholder="e.g., 32000"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
          </div>

          <div className="col-12 col-sm-6">
            <label className="form-label fw-bold text-secondary small">Stock Units (Available Quantity)</label>
            <input 
              type="number" 
              className="form-control form-control-sm rounded-2 py-2.5" 
              placeholder="e.g., 1"
              value={productStock}
              onChange={(e) => setProductStock(e.target.value)}
            />
          </div>
        </div>

        {/* BRAND & CATEGORY */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6">
            <label className="form-label fw-bold text-secondary small">Brand</label>
            <input 
              type="text" 
              className="form-control form-control-sm rounded-2 py-2.5" 
              placeholder="e.g., Realme"
              value={productBrand}
              onChange={(e) => setProductBrand(e.target.value)}
            />
          </div>

          <div className="col-12 col-sm-6">
            <label className="form-label fw-bold text-secondary small">Category</label>
            <select 
              className="form-select form-select-sm rounded-2 py-2.5"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
            >
              <option value="ELECTRONICS">ELECTRONICS</option>
              <option value="CLOTHING">CLOTHING</option>
              <option value="HOME_APPLIANCES">HOME_APPLIANCES</option>
               <option value="BOOKS">BOOKS</option>
               <option value="BEAUTY">BEAUTY</option>
              <option value="SPORTS">SPORTS</option>
              <option value="GROCERY">GROCERY</option>
             
            </select>
          </div>
        </div>

        {/* IMAGE FILE UPLOAD SECTION WITH UPDATE BUTTON */}
        <div className="mb-5">
          <label className="form-label fw-bold text-secondary small">Product Image (JPG, JPEG, PNG)</label>
          <div className="input-group input-group-sm mb-2">
            <input 
              type="file" 
              className="form-control rounded-2" 
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleFileChange}
            />
            <button 
              type="button" 
              className="btn btn-outline-primary fw-semibold px-3"
              onClick={handleImageUpload}
              disabled={uploadingImage || !selectedFile}
            >
              {uploadingImage ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
          <div className="form-text text-muted" style={{ fontSize: '0.75rem' }}>
            Select an image file and click 'Upload Image' to generate and save the S3 asset URL.
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="mt-3 p-2 border rounded bg-light d-inline-block">
              <img 
                src={previewUrl} 
                alt="Preview Thumbnail" 
                style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                className="rounded shadow-sm"
              />
              <p className="small text-muted mb-0 mt-1 text-truncate" style={{ maxWidth: '200px' }}>
                {imageUrl ? `Saved URL: ${imageUrl}` : 'Pending Upload...'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-column gap-2 mt-4">
          <button 
            type="button" 
            className={`btn w-100 py-2.5 fw-bold rounded-2 shadow-sm ${productId ? 'btn-success' : 'btn-primary'}`}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Processing...' : productId ? 'Update Product' : 'Add Product'}
          </button>
          <button 
            type="button" 
            className="btn btn-outline-secondary w-100 py-2.5 rounded-2 fw-semibold"
            onClick={() => navigate('/vendor/products')}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddProduct;