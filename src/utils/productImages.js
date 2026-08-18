import spa from '../assets/images/spa.jpg';
import extra from '../assets/images/extra.jpg';
import threeInOne from '../assets/images/3in1.jpg';
import serum from '../assets/images/serum.jpg';
import scrub from '../assets/images/scrub.jpg';
import bodyOil from '../assets/images/body_oil1.jpg';
import glutaX2 from '../assets/images/x2.png';

const localProductImages = {
  'spa.jpg': spa,
  'extra.jpg': extra,
  '3in1.jpg': threeInOne,
  'serum.jpg': serum,
  'scrub.jpg': scrub,
  'body_oil1.jpg': bodyOil,
  'x2.png': glutaX2,
};

export function resolveProductImage(image) {
  if (!image) return '';

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  const filename = image.split('/').pop();

  return localProductImages[filename] || image;
}