const multer = require('multer');
const path = require('path');
const productModel = require('./productCategory.model.js');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
const createProduct = async (req, res) => {
  try {
    const images = req.files.map(file => `http://localhost:3000/${file.filename}`);
    const product = new productModel({
      categoryName: req.body.categoryName,
      description: req.body.description,
      discount: req.body.discount,
      image: images
    });
    await product.save();
    res.send({
      message: "Product created successfully!",
      product
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the product."
    });
  }
};

const addProductTypes = async (req, res) => {
  try {
    const categoryId = req.body.categoryName;
    const category = await productModel.findById(categoryId);
    const images = req.files.map(file => `http://localhost:3000/${file.filename}`);
    category.productTypes.push({
      categoryName: req.body.categoryName,
      productName: req.body.productName,
      productType: req.body.productType,
      productPrice: req.body.productPrice,
      productQuantity: req.body.productQuantity,
      productWeight: req.body.productWeight,
      images: images
    });

    const savedProduct = await category.save();
    res.send({
      message: "Product added to category successfully!",
      product: savedProduct
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while adding product types."
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    await productModel.findByIdAndDelete(productId);
    res.status(200).json({ msg: 'Product deleted successfully', status: "success" });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', status: 500, Error: error });
  }
};

const editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = {
      categoryName: req.body.categoryName,
      description: req.body.description,
      discount: req.body.discount,
      image: `http://localhost:3000/${req.file.filename}`
    };

    const updatedProduct = await productModel.findByIdAndUpdate(productId, updatedData, { new: true });
    if (!updatedProduct) {
      res.status(404).json({ msg: 'Product not found', status: 404 });
    } else {
      res.status(200).json({ msg: 'Product updated successfully', status: "success", result: updatedProduct });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Internal server error', status: 500 });
  }
};

module.exports = {
  createProduct,
  addProductTypes,
  getAllProducts,
  deleteProduct,
  editProduct,
  upload 
};
