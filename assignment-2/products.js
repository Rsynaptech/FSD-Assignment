const categories = [
  'Electronics',
  'Home & Kitchen',
  'Books',
  'Sports',
  'Clothing'
];

const productNames = [
  'Wireless Headphones',
  'Smart LED Lamp',
  'Everyday Backpack',
  'Stainless Steel Bottle',
  'Mechanical Keyboard',
  'Cotton Hoodie',
  'Ceramic Coffee Mug',
  'Yoga Mat',
  'Portable Bluetooth Speaker',
  'Desk Organizer'
];

const products = Array.from({ length: 100 }, (_, index) => {
  const id = index + 1;
  const category = categories[index % categories.length];
  const name = `${productNames[index % productNames.length]} ${id}`;

  return {
    id,
    name,
    description: `Reliable ${category.toLowerCase()} product for everyday use.`,
    category,
    price: Number((19.99 + (index * 7.5) % 180).toFixed(2)),
    inStock: index % 7 !== 0,
    rating: Number((3.5 + (index % 16) / 10).toFixed(1))
  };
});

module.exports = products;
