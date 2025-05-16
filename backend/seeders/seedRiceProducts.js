// backend/seeders/seedRiceProducts.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const RiceProduct = require('../models/RiceProduct');

connectDB();

// --- IMPORTANT: Replace these placeholder URLs with your actual public image URLs ---
const PLACEHOLDER_IMAGE_URL = 'https://via.placeholder.com/300x200.png?text=Rice+Image'; // Generic placeholder

const initialRiceProducts = [
  { name: "Basmati Rice", description: "Long-grain, aromatic rice for Biryani.", originalPrice: 100, discountPercentage: 0, imageUrl: "https://images.pexels.com/photos/723043/pexels-photo-723043.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", category: "Biryani" },
  { name: "Jasmine Rice", description: "Fragrant rice, ideal for Asian dishes.", originalPrice: 150, discountPercentage: 0, imageUrl: "https://images.pexels.com/photos/17575133/pexels-photo-17575133/free-photo-of-cooked-rice-with-spices.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", category: "General" },
  { name: "Red Rice", description: "Nutritious rice with a nutty flavor.", originalPrice: 200, discountPercentage: 0, imageUrl: "https://images.pexels.com/photos/5949281/pexels-photo-5949281.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", category: "General" },
  { name: "Mogra Rice", description: "Broken Basmati, good for kheer.", originalPrice: 250, discountPercentage: 0, imageUrl: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/05/basmati-rice-2.jpg", category: "General" },
  { name: "Brown Rice", description: "Whole grain rice, high in fiber.", originalPrice: 300, discountPercentage: 0, imageUrl: "https://images.pexels.com/photos/162397/famine-grain-rice-brown-rice-162397.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", category: "General" },
  { name: "Black Rice", description: "Forbidden rice, rich in antioxidants.", originalPrice: 350, discountPercentage: 0, imageUrl: "https://www.simplyrecipes.com/thmb/zSgAVX1PTKlWM832d2qg0RSL0PM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Forbidden-Rice-LEAD-05-b838f3689993492ab6217e9a72f6a56c.jpg", category: "General" },
  { name: "Sona Masuri Rice", description: "Lightweight and aromatic, for daily use.", originalPrice: 400, discountPercentage: 0, imageUrl: "https://static.toiimg.com/thumb/60915309.cms?width=1200&height=900", category: "General" },
  { name: "Ambemohar Rice", description: "Fragrant short-grain rice from Maharashtra.", originalPrice: 450, discountPercentage: 0, imageUrl: "https://prabhatdairy.in/wp-content/uploads/2023/08/Govindbhog-Rice.webp", category: "General" },
  { name: "Kala Jeera Rice (Jeerakasala)", description: "Short-grain aromatic rice for pulao/biryani.", originalPrice: 500, discountPercentage: 0, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSYg39wYt6R-oXo4nEwF9cWzN4K4P9T0Z5Ww&s", category: "Biryani" },
  { name: "Bamboo Rice", description: "Unique rice grown from bamboo shoots.", originalPrice: 550, discountPercentage: 0, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5kCnjSjW9tE6Tqg-Fw7qK_4K5oXzQj_yT4w&s", category: "General" },
  { name: "Premium Idly Rice", description: "Parboiled rice perfect for soft, fluffy idlis.", originalPrice: 120, discountPercentage: 0, imageUrl: "https://www.shasthaonline.com/images/thumbs/0000079_idli-rice_600.jpeg", category: "Idly" },
  { name: "Crispy Dosa Rice", description: "Raw rice blend ideal for making crispy dosas.", originalPrice: 110, discountPercentage: 0, imageUrl: "https://rukminim2.flixcart.com/image/850/1000/k6gsk280/rice/h/k/s/5-dosa-rice-sri-ayyappa-original-imafzxejzxtzzvyh.jpeg?q=90&crop=false", category: "Dosa" },
  { name: "Seeraga Samba Rice", description: "Tiny aromatic rice, for South Indian Biryani.", originalPrice: 180, discountPercentage: 0, imageUrl: "https://sargramostav.sargakshetra.org/public//storage/products/52372194385675.jpg", category: "Biryani" },
];

const seedDB = async () => {
  try {
    await RiceProduct.deleteMany({});
    console.log('Old rice products removed!');

    await RiceProduct.insertMany(initialRiceProducts);
    console.log(`${initialRiceProducts.length} rice products have been seeded with URL images!`);
    process.exit();
  } catch (error) {
    console.error('Error seeding rice products:', error);
    process.exit(1);
  }
};

seedDB();