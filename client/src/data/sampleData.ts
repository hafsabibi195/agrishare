export type DemoRole = "farmer" | "owner" | "admin";
export type EquipmentCategory = "Tractor" | "Harvester" | "Sprayer" | "Thresher" | "Rotavator";
export type BookingStatus = "pending" | "accepted" | "rejected" | "approved" | "completed";
export type EquipmentStatus = "available" | "rented" | "pending approval";
export type CityName = string;

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: DemoRole;
  password: string;
  twoFactorEnabled: boolean;
}

export interface Equipment {
  id: string;
  ownerId: string;
  title: string;
  category: EquipmentCategory;
  city: CityName;
  location: { lat: number; lng: number };
  pricePerDay: number;
  availability: "available" | "booked" | "maintenance";
  status: EquipmentStatus;
  rating: number;
  ownerName: string;
  contactPhone?: string;
  description: string;
}

export interface Booking {
  id: string;
  equipmentId: string;
  renterId: string;
  ownerId: string;
  status: BookingStatus;
  bookedDates: string;
  totalAmount: number;
  notes: string;
}

export interface Review {
  id: string;
  equipmentId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}

export interface AdminStat {
  label: string;
  value: string;
  change: string;
}

export const demoUsers: DemoUser[] = [
  { id: "user-farmer", name: "Ayesha Khan", email: "farmer@agrishare.pk", phone: "+923001234567", role: "farmer", password: "Agri@1234", twoFactorEnabled: true },
  { id: "user-owner", name: "Hassan Ali", email: "owner@agrishare.pk", phone: "+923001234568", role: "owner", password: "Agri@1234", twoFactorEnabled: true },
  { id: "user-admin", name: "Saima Qureshi", email: "admin@agrishare.pk", phone: "+923001234569", role: "admin", password: "Agri@1234", twoFactorEnabled: true }
];

export const demoEquipment: Equipment[] = [
  { id: "eq-tractor-lahore", ownerId: "user-owner", title: "Massey Ferguson 385", category: "Tractor", city: "Lahore", location: { lat: 31.5204, lng: 74.3587 }, pricePerDay: 4200, availability: "available", status: "available", rating: 4.8, ownerName: "Hassan Ali", description: "Reliable 4WD tractor for field preparation, haulage, and seedbed work." },
  { id: "eq-sprayer-faisalabad", ownerId: "user-owner", title: "Boom Sprayer 250L", category: "Sprayer", city: "Faisalabad", location: { lat: 31.4187, lng: 73.0791 }, pricePerDay: 2600, availability: "available", status: "available", rating: 4.7, ownerName: "Hassan Ali", description: "High-coverage field sprayer suited for cotton and wheat crop protection." },
  { id: "eq-harvester-multan", ownerId: "user-owner", title: "Combine Harvester 60HP", category: "Harvester", city: "Multan", location: { lat: 30.1575, lng: 71.5249 }, pricePerDay: 7500, availability: "available", status: "available", rating: 4.9, ownerName: "Hassan Ali", description: "Efficient wheat harvesting machine for large acreages and timed harvesting windows." },
  { id: "eq-thresher-okara", ownerId: "user-owner", title: "Axial Flow Thresher", category: "Thresher", city: "Okara", location: { lat: 30.8104, lng: 73.4564 }, pricePerDay: 3900, availability: "booked", status: "rented", rating: 4.6, ownerName: "Hassan Ali", description: "Strong crop processing unit for wheat and rice with fast turnaround." },
  { id: "eq-rotavator-lahore", ownerId: "user-owner", title: "Rotavator 10 Feet", category: "Rotavator", city: "Lahore", location: { lat: 31.4504, lng: 74.2712 }, pricePerDay: 3200, availability: "available", status: "available", rating: 4.5, ownerName: "Hassan Ali", description: "Deep tillage equipment for fine seedbed preparation and residue mixing." },
  { id: "eq-tractor-faisalabad", ownerId: "user-owner", title: "John Deere 5045", category: "Tractor", city: "Faisalabad", location: { lat: 31.4508, lng: 73.1350 }, pricePerDay: 4700, availability: "maintenance", status: "pending approval", rating: 4.8, ownerName: "Hassan Ali", description: "Popular 50HP tractor with low fuel usage and strong compatibility with implements." },
  { id: "eq-sprayer-sahiwal", ownerId: "user-owner", title: "Pulled Boom Sprayer", category: "Sprayer", city: "Sahiwal", location: { lat: 30.6667, lng: 73.1083 }, pricePerDay: 2300, availability: "available", status: "available", rating: 4.4, ownerName: "Hassan Ali", description: "Compact boom sprayer designed for rice and wheat field protection." },
  { id: "eq-harvester-islamabad", ownerId: "user-owner", title: "Wheat Harvester Pro 7", category: "Harvester", city: "Islamabad", location: { lat: 33.6844, lng: 73.0479 }, pricePerDay: 8200, availability: "available", status: "available", rating: 4.9, ownerName: "Hassan Ali", description: "High-capacity harvester for large farm blocks and controlled grain movement." },
  { id: "eq-tractor-okara", ownerId: "user-owner", title: "New Holland 3630", category: "Tractor", city: "Okara", location: { lat: 30.8090, lng: 73.4453 }, pricePerDay: 5000, availability: "booked", status: "rented", rating: 4.7, ownerName: "Hassan Ali", description: "Strong utility tractor for tillage, haulage, and loader tasks." },
  { id: "eq-thresher-lahore", ownerId: "user-owner", title: "Rice Thresher 3500", category: "Thresher", city: "Lahore", location: { lat: 31.5572, lng: 74.3492 }, pricePerDay: 4100, availability: "available", status: "available", rating: 4.6, ownerName: "Hassan Ali", description: "Reliable thresher for rice fields and compact storage setups." },
  { id: "eq-rotavator-multan", ownerId: "user-owner", title: "Farmking Rotavator", category: "Rotavator", city: "Multan", location: { lat: 30.1862, lng: 71.4667 }, pricePerDay: 3100, availability: "available", status: "available", rating: 4.5, ownerName: "Hassan Ali", description: "Useful for soil mixing, seedbed prep, and residue incorporation." },
  { id: "eq-sprayer-lahore", ownerId: "user-owner", title: "Knapsack Spray Unit 300L", category: "Sprayer", city: "Lahore", location: { lat: 31.4897, lng: 74.3249 }, pricePerDay: 2100, availability: "available", status: "available", rating: 4.3, ownerName: "Hassan Ali", description: "Ideal for orchard and vegetable crop maintenance with controlled spraying." },
  { id: "eq-tractor-sahiwal", ownerId: "user-owner", title: "Case IH 4230", category: "Tractor", city: "Sahiwal", location: { lat: 30.6455, lng: 73.1060 }, pricePerDay: 5500, availability: "available", status: "available", rating: 4.8, ownerName: "Hassan Ali", description: "High-torque tractor suited to field prep and transport operations." },
  { id: "eq-harvester-faisalabad", ownerId: "user-owner", title: "Agri King X1", category: "Harvester", city: "Faisalabad", location: { lat: 31.4507, lng: 73.1356 }, pricePerDay: 7200, availability: "booked", status: "rented", rating: 4.8, ownerName: "Hassan Ali", description: "Trusted wheat harvester for high-throughput harvesting windows." },
  { id: "eq-thresher-multan", ownerId: "user-owner", title: "Turbo Thresher Mini", category: "Thresher", city: "Multan", location: { lat: 30.2208, lng: 71.5304 }, pricePerDay: 3600, availability: "available", status: "available", rating: 4.4, ownerName: "Hassan Ali", description: "Compact system for efficient crop separation and reduced grain loss." },
  { id: "eq-tractor-islamabad", ownerId: "user-owner", title: "Powertrac 439", category: "Tractor", city: "Islamabad", location: { lat: 33.6846, lng: 73.0498 }, pricePerDay: 6100, availability: "available", status: "available", rating: 4.7, ownerName: "Hassan Ali", description: "Well-equipped tractor for farm roads, hauling, and cultivation tasks." },
  { id: "eq-rotavator-okara", ownerId: "user-owner", title: "Shaktiman Rota 9", category: "Rotavator", city: "Okara", location: { lat: 30.8045, lng: 73.4425 }, pricePerDay: 2900, availability: "available", status: "available", rating: 4.4, ownerName: "Hassan Ali", description: "Efficient rotavator for active field preparation and land leveling." },
  { id: "eq-sprayer-multan", ownerId: "user-owner", title: "SprayJet 500", category: "Sprayer", city: "Multan", location: { lat: 30.1919, lng: 71.4697 }, pricePerDay: 2800, availability: "available", status: "available", rating: 4.5, ownerName: "Hassan Ali", description: "Wide-area spray machine for wheat, cotton, and vegetable farms." },
  { id: "eq-tractor-lahore-2", ownerId: "user-owner", title: "Mitsubishi 5500", category: "Tractor", city: "Lahore", location: { lat: 31.5232, lng: 74.3751 }, pricePerDay: 4900, availability: "maintenance", status: "pending approval", rating: 4.6, ownerName: "Hassan Ali", description: "Newer tractor awaiting approval for market listing and schedule release." },
  { id: "eq-harvester-okara", ownerId: "user-owner", title: "Punjab Harvest 9", category: "Harvester", city: "Okara", location: { lat: 30.8233, lng: 73.4704 }, pricePerDay: 7900, availability: "available", status: "available", rating: 4.9, ownerName: "Hassan Ali", description: "High-output combine suitable for large and mid-size harvesting windows." },
  { id: "eq-thresher-faisalabad", ownerId: "user-owner", title: "HD Thresher 2T", category: "Thresher", city: "Faisalabad", location: { lat: 31.4305, lng: 73.0905 }, pricePerDay: 3300, availability: "available", status: "available", rating: 4.5, ownerName: "Hassan Ali", description: "A mid-sized thresher ideal for wheat and rice harvest cleaning." },
  { id: "eq-rotavator-sahiwal", ownerId: "user-owner", title: "Pioneer Rotavator", category: "Rotavator", city: "Sahiwal", location: { lat: 30.6184, lng: 73.0961 }, pricePerDay: 3000, availability: "available", status: "available", rating: 4.3, ownerName: "Hassan Ali", description: "Simple and sturdy cultivation equipment for soft soil operations." },
  { id: "eq-trailer-islamabad", ownerId: "user-owner", title: "Trailer 12ft", category: "Tractor", city: "Islamabad", location: { lat: 33.6953, lng: 73.0910 }, pricePerDay: 2400, availability: "available", status: "available", rating: 4.1, ownerName: "Hassan Ali", description: "Practical trailer unit for bulk crop movement and haulage support." }
];

export const demoBookings: Booking[] = [
  { id: "booking-1", equipmentId: "eq-tractor-lahore", renterId: "user-farmer", ownerId: "user-owner", status: "pending", bookedDates: "2026-10-02 to 2026-10-04", totalAmount: 12600, notes: "Need the tractor for land preparation before sowing." },
  { id: "booking-2", equipmentId: "eq-harvester-multan", renterId: "user-farmer", ownerId: "user-owner", status: "accepted", bookedDates: "2026-09-18 to 2026-09-20", totalAmount: 22500, notes: "Harvesting for wheat field near Multan city boundary." },
  { id: "booking-3", equipmentId: "eq-sprayer-faisalabad", renterId: "user-farmer", ownerId: "user-owner", status: "approved", bookedDates: "2026-09-12 to 2026-09-13", totalAmount: 5200, notes: "Cotton field spraying request for two days." },
  { id: "booking-4", equipmentId: "eq-thresher-okara", renterId: "user-farmer", ownerId: "user-owner", status: "rejected", bookedDates: "2026-09-25 to 2026-09-27", totalAmount: 11700, notes: "Requested on the same dates as another booking." }
];

export const demoReviews: Review[] = [
  { id: "review-1", equipmentId: "eq-tractor-lahore", userId: "user-farmer", userName: "Ayesha Khan", rating: 5, comment: "Very punctual and the machine was in great condition." },
  { id: "review-2", equipmentId: "eq-harvester-multan", userId: "user-farmer", userName: "Ayesha Khan", rating: 4, comment: "The combine worked fast and the owner communicated clearly." },
  { id: "review-3", equipmentId: "eq-sprayer-faisalabad", userId: "user-farmer", userName: "Ayesha Khan", rating: 5, comment: "Spraying coverage was even and crop health improved noticeably." }
];

export const adminStats: AdminStat[] = [
  { label: "Total users", value: "12,480", change: "+8.2%" },
  { label: "Equipment listed", value: "642", change: "+12.4%" },
  { label: "Active rentals", value: "1,204", change: "+6.7%" },
  { label: "Pending approvals", value: "84", change: "+14.1%" }
];

export const demoCities = ["Lahore", "Faisalabad", "Multan", "Okara", "Sahiwal", "Islamabad"] as const;

export function getEquipmentById(id: string): Equipment | undefined {
  return demoEquipment.find((equipment) => equipment.id === id);
}

export function getUserByEmail(email: string): DemoUser | undefined {
  return demoUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): DemoUser | undefined {
  return demoUsers.find((user) => user.id === id);
}
