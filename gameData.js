export const GOOD_CHOICES = [
  { id: 'recycle', text: 'Recycle paper and plastics', icon: 'ri-recycle-line', category: 'recycling' },
  { id: 'publictransport', text: 'Use public transportation', icon: 'ri-bus-line', category: 'public_transport' },
  { id: 'lightoff', text: 'Turn off lights when leaving', icon: 'ri-lightbulb-flash-line', category: 'energy_saving' },
  { id: 'reusablebag', text: 'Use reusable shopping bags', icon: 'ri-shopping-bag-line', category: 'sustainable_shopping' },
  { id: 'waterbottle', text: 'Use a reusable water bottle', icon: 'ri-water-flash-line', category: 'water_conservation' },
  { id: 'localfood', text: 'Buy local produce', icon: 'ri-store-2-line', category: 'sustainable_shopping' },
  { id: 'digitalreceipts', text: 'Choose digital receipts', icon: 'ri-file-list-3-line', category: 'recycling' },
  { id: 'walkbike', text: 'Walk or bike for short trips', icon: 'ri-bike-line', category: 'public_transport' },
  { id: 'shortshower', text: 'Take shorter showers', icon: 'ri-drop-line', category: 'water_conservation' },
  { id: 'compost', text: 'Start composting food scraps', icon: 'ri-plant-fill', category: 'recycling' },
  { id: 'energystar', text: 'Buy energy-efficient appliances', icon: 'ri-star-line', category: 'energy_saving' },
  { id: 'meatless', text: 'Have a meatless meal', icon: 'ri-leaf-line', category: 'sustainable_shopping' }
];

export const BAD_CHOICES = [
  { id: 'plasticbag', text: 'Use single-use plastic bags', icon: 'ri-bank-card-line', category: 'sustainable_shopping' },
  { id: 'bottledwater', text: 'Buy disposable water bottles', icon: 'ri-water-flash-line', category: 'water_conservation' },
  { id: 'foodwaste', text: 'Waste food', icon: 'ri-restaurant-line', category: 'sustainable_shopping' },
  { id: 'longshower', text: 'Take extra long showers', icon: 'ri-shower-line', category: 'water_conservation' },
  { id: 'driveshort', text: 'Drive for very short trips', icon: 'ri-car-line', category: 'public_transport' },
  { id: 'lighton', text: 'Leave lights on unnecessarily', icon: 'ri-lightbulb-line', category: 'energy_saving' },
  { id: 'standby', text: 'Leave electronics on standby', icon: 'ri-tv-line', category: 'energy_saving' },
  { id: 'excesspackaging', text: 'Buy items with excess packaging', icon: 'ri-archive-line', category: 'recycling' },
  { id: 'fastfashion', text: 'Buy fast fashion clothing', icon: 'ri-t-shirt-line', category: 'sustainable_shopping' },
  { id: 'disposables', text: 'Use disposable utensils', icon: 'ri-restaurant-2-line', category: 'recycling' }
];

export const PLANT_STAGES = {
  seedling: {
    name: 'Seedling',
    minLevel: 0,
    description: 'A tiny sprout just beginning its journey',
    color: '#8BC34A'
  },
  sprout: {
    name: 'Sprout',
    minLevel: 5,
    description: 'Young and growing with vibrant energy',
    color: '#4CAF50'
  },
  sapling: {
    name: 'Sapling',
    minLevel: 10,
    description: 'Developing strong roots and branches',
    color: '#2E7D32'
  },
  tree: {
    name: 'Tree',
    minLevel: 25,
    description: 'A mature tree providing shade and oxygen',
    color: '#1B5E20'
  },
  ancient: {
    name: 'Ancient Tree',
    minLevel: 50,
    description: 'A legendary ancient tree, wise and majestic',
    color: '#795548'
  }
};
