const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Property = require("./models/Property");
const Review = require("./models/Review");

// ─── IMAGE URLS (using picsum.photos for real property-like images) ───
const propertyImages = [
  // Apartments & Flats
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=500&fit=crop",
  // Houses
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop",
  // Villas
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=500&fit=crop",
  // Interior shots
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=500&fit=crop",
  // Modern buildings
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=500&fit=crop",
];

function getRandomImages() {
  const count = 2 + Math.floor(Math.random() * 3); // 2-4 images per property
  const shuffled = [...propertyImages].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─── CITIES & LOCALITIES ───
const locations = [
  { city: "Mumbai", localities: ["Andheri West", "Bandra", "Powai", "Juhu", "Worli", "Lower Parel", "Goregaon", "Malad", "Borivali", "Thane"], pincodes: ["400053", "400050", "400076", "400049", "400018", "400013", "400062", "400064", "400066", "400601"] },
  { city: "Delhi", localities: ["Dwarka", "Rohini", "Saket", "Vasant Kunj", "Greater Kailash", "Lajpat Nagar", "Hauz Khas", "Janakpuri", "Pitampura", "Nehru Place"], pincodes: ["110075", "110085", "110017", "110070", "110048", "110024", "110016", "110058", "110034", "110019"] },
  { city: "Bangalore", localities: ["Whitefield", "Koramangala", "HSR Layout", "Electronic City", "Indiranagar", "Jayanagar", "JP Nagar", "Marathahalli", "Bannerghatta Road", "Yelahanka"], pincodes: ["560066", "560034", "560102", "560100", "560038", "560011", "560078", "560037", "560076", "560064"] },
  { city: "Hyderabad", localities: ["Gachibowli", "HITEC City", "Banjara Hills", "Jubilee Hills", "Kondapur", "Madhapur", "Kukatpally", "Secunderabad", "Begumpet", "Miyapur"], pincodes: ["500032", "500081", "500034", "500033", "500084", "500081", "500072", "500003", "500016", "500049"] },
  { city: "Chennai", localities: ["Adyar", "T Nagar", "Anna Nagar", "Velachery", "OMR", "Porur", "Tambaram", "Sholinganallur", "Guindy", "Mylapore"], pincodes: ["600020", "600017", "600040", "600042", "600119", "600116", "600045", "600119", "600032", "600004"] },
  { city: "Pune", localities: ["Koregaon Park", "Hinjawadi", "Baner", "Wakad", "Kharadi", "Viman Nagar", "Hadapsar", "Kothrud", "Aundh", "Pimpri"], pincodes: ["411001", "411057", "411045", "411057", "411014", "411014", "411028", "411038", "411007", "411018"] },
  { city: "Kolkata", localities: ["Salt Lake", "New Town", "Park Street", "Alipore", "Ballygunge", "Howrah", "Dum Dum", "Jadavpur", "Behala", "Garia"], pincodes: ["700091", "700156", "700016", "700027", "700019", "711101", "700028", "700032", "700034", "700084"] },
  { city: "Ahmedabad", localities: ["SG Highway", "Prahlad Nagar", "Satellite", "Bodakdev", "Navrangpura", "Vastrapur", "Bopal", "Thaltej", "Gota", "Chandkheda"], pincodes: ["380054", "380015", "380015", "380054", "380009", "380015", "380058", "380054", "382481", "382424"] },
  { city: "Jaipur", localities: ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme", "Tonk Road", "Jagatpura", "Ajmer Road", "Sodala", "Raja Park", "Bani Park"], pincodes: ["302017", "302021", "302020", "302001", "302015", "302017", "302006", "302006", "302004", "302016"] },
  { city: "Lucknow", localities: ["Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar", "Mahanagar", "Aminabad", "Alambagh", "Jankipuram", "Vikas Nagar", "Chinhat"], pincodes: ["226010", "226001", "226024", "226016", "226006", "226018", "226005", "226021", "226022", "226028"] },
  { city: "Chandigarh", localities: ["Sector 17", "Sector 22", "Sector 35", "Sector 43", "Sector 44", "Manimajra", "Panchkula", "Mohali Phase 5", "Zirakpur", "Kharar"], pincodes: ["160017", "160022", "160035", "160043", "160044", "160101", "134109", "160059", "140603", "140301"] },
  { city: "Goa", localities: ["Panaji", "Margao", "Calangute", "Candolim", "Anjuna", "Vagator", "Ponda", "Mapusa", "Vasco", "Porvorim"], pincodes: ["403001", "403601", "403516", "403515", "403509", "403509", "403401", "403507", "403802", "403521"] },
];

const propertyTypes = ["flat", "house", "plot", "villa", "penthouse", "commercial"];
const listingTypes = ["sale", "rent"];
const furnishingTypes = ["furnished", "semi-furnished", "unfurnished"];
const amenitiesList = [
  "Parking", "Lift", "Swimming Pool", "Gym", "Garden", "Security",
  "Power Backup", "Water Supply", "Club House", "Children Play Area",
  "Fire Safety", "Intercom", "Gas Pipeline", "Rainwater Harvesting",
  "Visitor Parking", "ATM", "CCTV", "Wi-Fi", "AC", "Balcony"
];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function getRandomAmenities() {
  const count = randomBetween(4, 10);
  const shuffled = [...amenitiesList].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─── PROPERTY NAME TEMPLATES ───
const titleTemplates = {
  flat: [
    "{bhk}BHK Premium Apartment in {locality}",
    "Spacious {bhk}BHK Flat near {locality}",
    "Modern {bhk}BHK Apartment with Balcony in {locality}",
    "Luxury {bhk}BHK Flat with Pool View in {locality}",
    "Newly Built {bhk}BHK Apartment in {locality}",
    "Affordable {bhk}BHK Flat in {locality}, {city}",
    "Sea-Facing {bhk}BHK Flat in {locality}",
    "High-Rise {bhk}BHK Apartment in {locality}",
  ],
  house: [
    "Beautiful Independent House in {locality}",
    "{bhk}BHK Row House with Garden in {locality}",
    "Duplex House for {type} in {locality}",
    "Spacious Independent Villa in {locality}, {city}",
    "Corner Plot House in {locality}",
  ],
  plot: [
    "Prime Residential Plot in {locality}",
    "{area} sqft Plot for {type} in {locality}",
    "RERA Approved Plot in {locality}, {city}",
    "Corner Plot with East Facing in {locality}",
    "Gated Community Plot in {locality}",
  ],
  villa: [
    "Luxurious 4BHK Villa in {locality}",
    "Premium Villa with Private Pool in {locality}",
    "Spanish Style Villa in {locality}, {city}",
    "Gated Community Villa in {locality}",
    "Modern Contemporary Villa in {locality}",
  ],
  penthouse: [
    "Ultra Luxury Penthouse in {locality}",
    "Sky Villa Penthouse in {locality}, {city}",
    "Duplex Penthouse with Terrace in {locality}",
    "Premium Penthouse in {locality}",
  ],
  commercial: [
    "Office Space for {type} in {locality}",
    "Commercial Shop in {locality}, {city}",
    "Co-working Space in {locality}",
    "Showroom for {type} in {locality}",
    "Warehouse Space in {locality}",
  ]
};

const descriptions = [
  "This beautifully designed property offers a perfect blend of modern architecture and comfort. Located in one of the most sought-after areas, it provides easy access to schools, hospitals, shopping centers, and public transport. The property features premium fittings, ample natural light, and spacious rooms that make it ideal for families. The society offers world-class amenities including a swimming pool, gym, and 24/7 security.",
  "An excellent investment opportunity in a rapidly developing area. This property comes with all modern amenities and is built with premium quality materials. The neighborhood is well-connected to major IT parks and business hubs. With its thoughtful design and spacious layout, this property is perfect for those seeking comfort and convenience.",
  "Nestled in a serene locality, this property offers the perfect escape from the hustle and bustle of city life while being well-connected to all major landmarks. The property boasts high ceilings, Italian marble flooring, modular kitchen, and designer bathrooms. The gated community ensures privacy and security for all residents.",
  "A stunning property that redefines luxury living. Every corner of this home has been designed with attention to detail, from the premium wooden flooring to the state-of-the-art kitchen. The expansive windows offer breathtaking views of the city skyline. Residents can enjoy access to a clubhouse, jogging track, and landscaped gardens.",
  "This property is a rare find in this prime location. With its strategic position near major commercial centers and entertainment zones, it offers unmatched convenience. The spacious interiors are complemented by modern amenities, making it an ideal choice for families and professionals alike. Don't miss this opportunity to own a piece of premium real estate.",
  "Welcome to your dream home! This thoughtfully designed property features open-plan living spaces, a gourmet kitchen with top-of-the-line appliances, and luxurious bedrooms with en-suite bathrooms. The property is located in a prestigious gated community with round-the-clock security, making it perfect for families.",
  "A landmark property in the heart of the city. This meticulously maintained home offers a blend of traditional charm and modern comfort. The property features a private garden, covered parking, and is within walking distance of metro stations and popular restaurants. An ideal home for those who value location and lifestyle.",
  "Discover this exceptional property set in a thriving neighborhood. The contemporary design features floor-to-ceiling windows that flood the space with natural light. Premium fixtures and finishes throughout, including smart home automation, imported bathroom fittings, and a fully equipped modular kitchen. The community offers extensive recreational facilities.",
];

// ─── USERS DATA ───
const users = [
  // Admin
  { name: "Admin DealBridge", email: "admin@dealbridge.com", password: "admin123", phone: "9000000001", role: "admin", bio: "Platform administrator", city: "Mumbai", verified: true },
  // Sellers
  { name: "Rajesh Kumar", email: "rajesh@example.com", password: "seller123", phone: "9876543210", role: "seller", bio: "Experienced property developer with 15+ years in Mumbai real estate.", city: "Mumbai", verified: true },
  { name: "Priya Sharma", email: "priya@example.com", password: "seller123", phone: "9876543211", role: "seller", bio: "Trusted seller in Delhi NCR. Specializing in luxury apartments.", city: "Delhi", verified: true },
  { name: "Vikram Singh", email: "vikram@example.com", password: "seller123", phone: "9876543212", role: "seller", bio: "Premium villa developer in Bangalore.", city: "Bangalore", verified: true },
  { name: "Ananya Patel", email: "ananya@example.com", password: "seller123", phone: "9876543213", role: "seller", bio: "Leading property seller in Ahmedabad.", city: "Ahmedabad", verified: true },
  { name: "Suresh Reddy", email: "suresh@example.com", password: "seller123", phone: "9876543214", role: "seller", bio: "Hyderabad's most trusted property dealer.", city: "Hyderabad", verified: true },
  // Agents
  { name: "Meera Iyer", email: "meera@example.com", password: "agent123", phone: "9876543220", role: "agent", bio: "Top-rated agent in Chennai. 500+ deals closed.", city: "Chennai", verified: true },
  { name: "Arjun Mehta", email: "arjun@example.com", password: "agent123", phone: "9876543221", role: "agent", bio: "Pune real estate specialist. Helping families find dream homes.", city: "Pune", verified: true },
  { name: "Kavita Desai", email: "kavita@example.com", password: "agent123", phone: "9876543222", role: "agent", bio: "Goa property expert. Specializing in beachside villas.", city: "Goa", verified: true },
  { name: "Rohit Gupta", email: "rohit@example.com", password: "agent123", phone: "9876543223", role: "agent", bio: "Jaipur heritage properties specialist.", city: "Jaipur", verified: true },
  // Buyers (5+)
  { name: "Amit Verma", email: "amit@example.com", password: "buyer123", phone: "9876543230", role: "buyer", bio: "Looking for a 3BHK in Mumbai.", city: "Mumbai" },
  { name: "Neha Kapoor", email: "neha@example.com", password: "buyer123", phone: "9876543231", role: "buyer", bio: "First-time home buyer in Delhi.", city: "Delhi" },
  { name: "Sanjay Mishra", email: "sanjay@example.com", password: "buyer123", phone: "9876543232", role: "buyer", bio: "Relocating to Bangalore for work.", city: "Bangalore" },
  { name: "Divya Nair", email: "divya@example.com", password: "buyer123", phone: "9876543233", role: "buyer", bio: "Looking for rental apartments in Pune.", city: "Pune" },
  { name: "Karan Malhotra", email: "karan@example.com", password: "buyer123", phone: "9876543234", role: "buyer", bio: "Investing in real estate across India.", city: "Hyderabad" },
  { name: "Pooja Rao", email: "pooja@example.com", password: "buyer123", phone: "9876543235", role: "buyer", bio: "Searching for a villa in Goa.", city: "Goa" },
  { name: "Manish Joshi", email: "manish@example.com", password: "buyer123", phone: "9876543236", role: "buyer", bio: "Looking for commercial space in Chennai.", city: "Chennai" },
];

function generateProperty(index, ownerIds) {
  const loc = locations[index % locations.length];
  const localityIndex = index % loc.localities.length;
  const locality = loc.localities[localityIndex];
  const pincode = loc.pincodes[localityIndex];
  const city = loc.city;

  const propType = propertyTypes[index % propertyTypes.length];
  const listType = listingTypes[index % 2];

  let bhk = 0;
  let area, price, floor, totalFloors;

  switch (propType) {
    case "flat":
      bhk = randomBetween(1, 4);
      area = bhk * randomBetween(350, 550);
      price = listType === "rent" ? bhk * randomBetween(8000, 25000) : bhk * randomBetween(2000000, 8000000);
      floor = randomBetween(1, 20);
      totalFloors = randomBetween(floor, 30);
      break;
    case "house":
      bhk = randomBetween(2, 5);
      area = bhk * randomBetween(400, 700);
      price = listType === "rent" ? bhk * randomBetween(12000, 35000) : bhk * randomBetween(3000000, 12000000);
      floor = 0; totalFloors = randomBetween(1, 3);
      break;
    case "plot":
      area = randomBetween(800, 5000);
      price = area * randomBetween(2000, 15000);
      floor = 0; totalFloors = 0;
      break;
    case "villa":
      bhk = randomBetween(3, 6);
      area = bhk * randomBetween(500, 900);
      price = listType === "rent" ? bhk * randomBetween(25000, 80000) : bhk * randomBetween(5000000, 20000000);
      floor = 0; totalFloors = randomBetween(2, 3);
      break;
    case "penthouse":
      bhk = randomBetween(3, 5);
      area = bhk * randomBetween(600, 1000);
      price = listType === "rent" ? bhk * randomBetween(40000, 100000) : bhk * randomBetween(8000000, 30000000);
      floor = randomBetween(15, 30);
      totalFloors = floor + randomBetween(0, 3);
      break;
    case "commercial":
      area = randomBetween(300, 3000);
      price = listType === "rent" ? area * randomBetween(30, 100) : area * randomBetween(5000, 20000);
      floor = randomBetween(0, 5);
      totalFloors = randomBetween(floor, 10);
      break;
  }

  const templates = titleTemplates[propType];
  let title = randomFrom(templates)
    .replace("{bhk}", bhk.toString())
    .replace("{locality}", locality)
    .replace("{city}", city)
    .replace("{area}", area.toString())
    .replace("{type}", listType === "sale" ? "Sale" : "Rent");

  const furnishing = propType === "plot" ? "unfurnished" : randomFrom(furnishingTypes);
  const ageOptions = ["new", "1-3 years", "3-5 years", "5-10 years", "10+ years"];

  return {
    title,
    description: randomFrom(descriptions),
    price,
    propertyType: propType,
    listingType: listType,
    bhk: bhk || 0,
    area,
    areaUnit: "sqft",
    furnishing,
    city,
    locality,
    address: `${randomBetween(1, 500)}, ${locality}, ${city}`,
    pincode,
    latitude: 0,
    longitude: 0,
    images: getRandomImages(),
    owner: randomFrom(ownerIds),
    status: "approved",
    isFeatured: index < 12, // First 12 are featured
    isVerified: Math.random() > 0.3,
    views: randomBetween(10, 5000),
    floor: floor || 0,
    totalFloors: totalFloors || 0,
    ageOfProperty: randomFrom(ageOptions),
    amenities: propType === "plot" ? ["Parking", "Security"] : getRandomAmenities(),
    availableFrom: new Date(Date.now() + randomBetween(-30, 90) * 86400000),
  };
}

// ─── MAIN SEED FUNCTION ───
async function seed() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected!\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Property.deleteMany({});
    await Review.deleteMany({});
    console.log("✅ Cleared!\n");

    // Create users
    console.log("👥 Creating users...");
    const hashedPassword = await bcrypt.hash("password123", 12);
    const createdUsers = [];

    for (const u of users) {
      const hashed = await bcrypt.hash(u.password, 12);
      const user = await User.create({
        ...u,
        password: hashed,
      });
      createdUsers.push(user);
      console.log(`   ✓ ${user.role.padEnd(6)} | ${user.name.padEnd(20)} | ${user.email}`);
    }

    // Get seller and agent IDs for property ownership
    const ownerIds = createdUsers
      .filter(u => ["seller", "agent", "admin"].includes(u.role))
      .map(u => u._id);

    console.log(`\n📊 Created: ${createdUsers.filter(u => u.role === 'buyer').length} buyers, ${createdUsers.filter(u => u.role === 'seller').length} sellers, ${createdUsers.filter(u => u.role === 'agent').length} agents, 1 admin\n`);

    // Create 100 properties
    console.log("🏠 Creating 100 properties...");
    const properties = [];

    for (let i = 0; i < 100; i++) {
      const propData = generateProperty(i, ownerIds);
      const property = await Property.create(propData);
      properties.push(property);

      if ((i + 1) % 10 === 0) {
        console.log(`   ✓ ${i + 1}/100 properties created`);
      }
    }

    // Add some reviews
    console.log("\n⭐ Adding reviews...");
    const buyerIds = createdUsers.filter(u => u.role === "buyer").map(u => u._id);
    let reviewCount = 0;

    for (let i = 0; i < 30; i++) {
      const prop = properties[randomBetween(0, properties.length - 1)];
      await Review.create({
        user: randomFrom(buyerIds),
        property: prop._id,
        rating: randomBetween(3, 5),
        comment: randomFrom([
          "Amazing property! Loved the location and amenities.",
          "Great value for money. The neighborhood is peaceful and well-connected.",
          "Very spacious and well-maintained. Highly recommended!",
          "Nice property with good ventilation and natural light.",
          "The owner was very cooperative. Smooth transaction experience.",
          "Perfect for families. Close to schools and hospitals.",
          "Modern design with quality construction. Worth every penny.",
          "Excellent property in a prime location. All amenities as described.",
          "Good property but could use some renovation. Location is great though.",
          "Beautiful interiors and the society is very well maintained.",
        ]),
      });
      reviewCount++;
    }
    console.log(`   ✓ ${reviewCount} reviews added\n`);

    // Add favorites for buyers
    console.log("❤️  Adding favorites for buyers...");
    for (const buyer of createdUsers.filter(u => u.role === "buyer")) {
      const favCount = randomBetween(3, 8);
      const shuffledProps = [...properties].sort(() => Math.random() - 0.5);
      const favIds = shuffledProps.slice(0, favCount).map(p => p._id);
      await User.findByIdAndUpdate(buyer._id, { favorites: favIds });
      console.log(`   ✓ ${buyer.name} — ${favCount} favorites`);
    }

    console.log("\n" + "═".repeat(50));
    console.log("🎉 SEED COMPLETE!");
    console.log("═".repeat(50));
    console.log(`\n📊 Summary:`);
    console.log(`   Users:      ${createdUsers.length} (${createdUsers.filter(u=>u.role==='buyer').length} buyers, ${createdUsers.filter(u=>u.role==='seller').length} sellers, ${createdUsers.filter(u=>u.role==='agent').length} agents, 1 admin)`);
    console.log(`   Properties: ${properties.length}`);
    console.log(`   Reviews:    ${reviewCount}`);
    console.log(`   Featured:   12`);
    console.log(`\n🔑 Login Credentials:`);
    console.log(`   Admin:  admin@dealbridge.com / admin123`);
    console.log(`   Seller: rajesh@example.com / seller123`);
    console.log(`   Agent:  meera@example.com / agent123`);
    console.log(`   Buyer:  amit@example.com / buyer123`);
    console.log();

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
