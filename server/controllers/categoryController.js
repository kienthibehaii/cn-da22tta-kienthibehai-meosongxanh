const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createCategory = async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: "Chỉ Admin mới được tạo danh mục tin tức" });
  try {
    const newCat = new Category({ name: req.body.name, description: req.body.description });
    await newCat.save();
    res.json(newCat);
  } catch (e) { res.status(500).json({ message: "Lỗi tạo danh mục" }); }
};

exports.deleteCategory = async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: "Access Denied" });
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};