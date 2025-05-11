// data.js
// Detailed information for each rice product

// Import images if you want to display product image in the details modal as well
// For now, we'll just focus on textual details.
// import img1 from "./basmati.jpeg";
// import img2 from "./Jasmine.jpeg";
// ... etc.

export const riceDetailsData = [
  {
    id: 1, // Must match the ID in productsData
    name: "Basmati Rice",
    healthBenefits: [
      "Low in fat and cholesterol.",
      "Good source of carbohydrates for energy.",
      "Naturally gluten-free.",
      "Some varieties have a lower glycemic index compared to other white rices."
    ],
    contents: [
      "Primarily starch (amylose and amylopectin).",
      "Vitamins: Thiamin, Niacin.",
      "Minerals: Selenium, Manganese.",
      "Dietary Fiber (more in brown Basmati)."
    ],
    usage: [
      "Ideal for Biryani, Pulao, and as a side for curries.",
      "Its fluffy, separate grains make it perfect for dishes where grain integrity is important."
    ],
    dishes: [
      "Chicken Biryani",
      "Vegetable Pulao",
      "Mutton Biryani",
      "Zafrani Pulao",
      "Plain steamed Basmati"
    ]
  },
  {
    id: 2,
    name: "Jasmine Rice",
    healthBenefits: [
      "Provides energy through carbohydrates.",
      "Typically low in fat.",
      "Source of some B vitamins."
    ],
    contents: [
      "Starch",
      "Aromatic compounds (responsible for its distinct fragrance)",
      "Folate (if enriched)"
    ],
    usage: [
      "Excellent for Thai and other Southeast Asian cuisines.",
      "Good for steamed rice, fried rice, and desserts."
    ],
    dishes: [
      "Thai Green Curry with Jasmine Rice",
      "Pineapple Fried Rice",
      "Mango Sticky Rice",
      "Plain Steamed Jasmine Rice"
    ]
  },
  {
    id: 3,
    name: "Red Rice",
    healthBenefits: [
      "Rich in antioxidants (anthocyanins).",
      "Higher fiber content than white rice, aids digestion.",
      "May help in managing blood sugar levels due to fiber.",
      "Good source of magnesium and iron."
    ],
    contents: [
      "Anthocyanins (in the bran)",
      "Dietary Fiber",
      "Iron, Magnesium, Manganese",
      "Complex Carbohydrates"
    ],
    usage: [
      "Suitable for salads, pilafs, and as a nutritious side.",
      "Its nutty flavor and chewy texture add character to dishes."
    ],
    dishes: [
      "Red Rice Puttu",
      "Red Rice Salad",
      "Red Rice Risotto",
      "Kanjhi (Porridge) with Red Rice"
    ]
  },
  {
    id: 4,
    name: "Mogra Rice",
    healthBenefits: [
      "Similar nutritional profile to Basmati, but as broken grains, might cook faster.",
      "Provides carbohydrates for energy."
    ],
    contents: [
      "Broken Basmati rice grains, primarily starch."
    ],
    usage: [
      "Great for Kheer (rice pudding), Khichdi, and everyday meals where texture is less critical.",
      "Often used for idli/dosa batter by some."
    ],
    dishes: [
      "Rice Kheer",
      "Masala Khichdi",
      "Rice Upma",
      "Porridge"
    ]
  },
  {
    id: 5,
    name: "Brown Rice",
    healthBenefits: [
      "Excellent source of dietary fiber.",
      "Rich in manganese, selenium, and magnesium.",
      "Helps in weight management due to fiber content.",
      "Lower glycemic index than white rice."
    ],
    contents: [
      "Whole grain (bran, germ, endosperm)",
      "High Dietary Fiber",
      "Manganese, Selenium, Magnesium, Phosphorus",
      "Vitamins B1, B3, B6"
    ],
    usage: [
      "Versatile for daily meals, salads, bowls, and stuffing.",
      "Healthier alternative to white rice."
    ],
    dishes: [
      "Brown Rice Pulao",
      "Brown Rice Stir-fry",
      "Burrito Bowls",
      "Stuffed Bell Peppers with Brown Rice"
    ]
  },
  {
    id: 6,
    name: "Black Rice",
    healthBenefits: [
      "Highest in antioxidants (anthocyanins) among all rice types.",
      "Good source of fiber and iron.",
      "May have anti-inflammatory properties."
    ],
    contents: [
      "Anthocyanins (giving its black-purple color)",
      "High Dietary Fiber",
      "Iron, Vitamin E",
      "Protein (relatively higher than white rice)"
    ],
    usage: [
      "Used in desserts, porridges, salads, and specialty dishes.",
      "Adds a striking color and nutty flavor."
    ],
    dishes: [
      "Black Rice Pudding (Kheer)",
      "Black Rice Salad with Mango",
      "Black Rice Porridge",
      "Sushi with Black Rice"
    ]
  },
  {
    id: 7,
    name: "Sona Masuri Rice",
    healthBenefits: [
      "Lower in calories and starch compared to some other white rices.",
      "Easily digestible.",
      "Provides carbohydrates for sustained energy."
    ],
    contents: [
      "Medium-grain rice, primarily starch.",
      "Low in fat."
    ],
    usage: [
      "Popular in South India for everyday meals, biryani, pulao.",
      "Good for idli and dosa batter as well."
    ],
    dishes: [
      "Plain Sona Masuri Rice",
      "Vegetable Biryani",
      "Lemon Rice",
      "Tamarind Rice (Pulihora)"
    ]
  },
  {
    id: 8,
    name: "Ambemohar Rice",
    healthBenefits: [
      "Distinct aroma of mango blossoms.",
      "Easily digestible short-grain rice.",
      "Provides quick energy."
    ],
    contents: [
      "Short-grain rice, starch.",
      "Aromatic compounds specific to the variety."
    ],
    usage: [
      "Popular in Maharashtra, India, for special occasions and daily meals.",
      "Used for making soft Bhakri (rice flour flatbread), Kheer, and Varan Bhaat."
    ],
    dishes: [
      "Varan Bhaat (Dal Rice)",
      "Masale Bhaat",
      "Ambemohar Rice Kheer",
      "Tandalachi Bhakri (Rice Roti)"
    ]
  },
  {
    id: 9,
    name: "Kala Jeera Rice (Jeerakasala)",
    healthBenefits: [
      "Small aromatic grains, easy to digest.",
      "Used in traditional Ayurvedic preparations."
    ],
    contents: [
      "Short-grain aromatic rice, starch.",
      "Specific aromatic compounds."
    ],
    usage: [
      "Primarily used for making Biryanis, especially Thalassery Biryani in Kerala.",
      "Good for Ghee Rice and Pulaos."
    ],
    dishes: [
      "Thalassery Chicken Biryani",
      "Malabar Fish Biryani",
      "Ghee Rice",
      "Jeera Rice"
    ]
  },
  {
    id: 10,
    name: "Bamboo Rice",
    healthBenefits: [
      "Claimed to be rich in protein and fiber.",
      "Low glycemic index.",
      "Believed to have medicinal properties in traditional systems."
    ],
    contents: [
      "Seeds from flowered bamboo, can vary based on bamboo species.",
      "Reported to be higher in protein than common rice/wheat."
    ],
    usage: [
      "Cooked like regular rice.",
      "Used for making Kheer, Upma, and other specialty dishes."
    ],
    dishes: [
      "Bamboo Rice Kheer",
      "Bamboo Rice Upma",
      "Steamed Bamboo Rice",
      "Bamboo Rice Payasam"
    ]
  },
  {
    id: 11,
    name: "Premium Idly Rice",
    healthBenefits: [
      "Specifically processed (parboiled) for idli making.",
      "Parboiling retains some nutrients.",
      "Easy to digest when made into idlis."
    ],
    contents: [
      "Parboiled rice grains, rich in starch.",
      "Slightly higher B vitamin content due to parboiling."
    ],
    usage: [
      "Primarily used for making soft and fluffy Idlis.",
      "Can also be used for Dosa batter."
    ],
    dishes: [
      "Idli",
      "Dosa (when mixed with urad dal)",
      "Rice Rava Idli"
    ]
  },
  {
    id: 12,
    name: "Crispy Dosa Rice",
    healthBenefits: [
      "Raw rice chosen for its ability to make crispy dosas.",
      "Provides carbohydrates."
    ],
    contents: [
      "Raw rice grains, high in starch content suitable for fermentation and crispiness."
    ],
    usage: [
      "Main ingredient for making crispy Dosa batter.",
      "Can be used for Paniyaram, Appam."
    ],
    dishes: [
      "Masala Dosa",
      "Plain Dosa",
      "Rava Dosa (sometimes includes a portion of this rice)",
      "Uttapam"
    ]
  },
  {
    id: 13,
    name: "Seeraga Samba Rice",
    healthBenefits: [
      "Small, flavorful grains.",
      "Easy to digest.",
      "Known for its unique aroma that enhances biryani."
    ],
    contents: [
      "Short-grain aromatic rice, starch.",
      "Distinctive aromatic oils."
    ],
    usage: [
      "Signature rice for South Indian Biryanis, especially Dindigul Biryani.",
      "Good for Pulaos and Ghee Rice."
    ],
    dishes: [
      "Dindigul Thalappakatti Biryani",
      "Ambur Biryani",
      "Seeraga Samba Mutton Biryani",
      "Kuska (Plain Biryani Rice)"
    ]
  }
];