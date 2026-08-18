import spa from '../assets/images/spa.jpg';
import extra from '../assets/images/extra.jpg';
import threeInOne from '../assets/images/3in1.jpg';
import serum from '../assets/images/serum.jpg';
import scrub from '../assets/images/scrub.jpg';
import bodyOil from '../assets/images/body_oil1.jpg';
import glutaX2 from '../assets/images/x2.png';

export const fallbackProducts = [
  {
    id: 'fallback-1',
    name: 'Body Spa',
    category: 'Treatment',
    description:
      'Reduce old cell. Help boosting whitening (extra solution for applying lotion to get quick result).',
    price: 5.99,
    image: spa,
    status: 'active',
  },
  {
    id: 'fallback-2',
    name: 'TN Gluta Extra',
    category: 'Lotion',
    description:
      'Help boost whitening skin for all skin types. Best recommendation for dark skin and helps improve skin tone.',
    price: 26.99,
    image: extra,
    status: 'bestseller',
  },
  {
    id: 'fallback-3',
    name: 'TEN 3in1',
    category: 'Lotion',
    description: 'Best for mixing with TN Gluta Extra, providing extra whitening support.',
    price: 8.99,
    image: threeInOne,
    status: 'bestseller',
  },
  {
    id: 'fallback-4',
    name: 'TN Vitamin',
    category: 'Serum',
    description:
      'Best for mixing with TN Gluta Extra, TN x2, and TEN 3in1 for additional whitening support.',
    price: 11.99,
    image: serum,
    status: 'bestseller',
  },
  {
    id: 'fallback-5',
    name: 'Body Scrub',
    category: 'Treatment',
    description: 'Removes old skin cells, supports brighter skin, and helps reduce scars.',
    price: 5.99,
    image: scrub,
    status: 'bestseller',
  },
  {
    id: 'fallback-6',
    name: 'Body Oil',
    category: 'Oil',
    description: 'Best for mixing with TN lotion, providing extra whitening support and helping reduce scars.',
    price: 9.99,
    image: bodyOil,
    status: 'new',
  },
  {
    id: 'fallback-7',
    name: 'TN Gluta x2',
    category: 'Lotion',
    description: 'Best for people with scars and can be mixed with whitening lotion.',
    price: 12.99,
    image: glutaX2,
    status: 'active',
  },
];
