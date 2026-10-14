// Certificates: the originals live on Google Drive (shared as "anyone with the link can view");
// the preview images in src/assets/certs are copies of Drive's own thumbnails, so builds never
// depend on Google being reachable.
import type { ImageMetadata } from 'astro';
import ml from '../assets/certs/ml.png';
import oop from '../assets/certs/oop.png';
import dsa from '../assets/certs/dsa.png';

export interface Certificate {
  title: string;
  issuer: string;
  topic: string;
  url: string;
  image: ImageMetadata;
  hue: string; // CSS colour used for the card's glow
}

export const certificates: Certificate[] = [
  {
    title: 'Machine Learning Specialization',
    issuer: 'DeepLearning.AI · Stanford Online',
    topic: 'Supervised & unsupervised learning, neural networks, recommender systems',
    url: 'https://drive.google.com/file/d/19BY-gK3QZd_LZPSOo5vNilvp6GducOpa/view',
    image: ml,
    hue: 'var(--blue)',
  },
  {
    title: 'Object-Oriented Programming',
    issuer: 'TakeUForward (Striver)',
    topic: 'Classes, inheritance, polymorphism, design principles',
    url: 'https://drive.google.com/file/d/1iKkHvNHeVB1xmkAIPOsbGQLsTJxjwSyh/view',
    image: oop,
    hue: 'var(--aether)',
  },
  {
    title: 'Data Structures & Algorithms',
    issuer: 'Apna College',
    topic: 'Arrays to graphs, dynamic programming, problem solving',
    url: 'https://drive.google.com/file/d/12vW5vpwAmxD6GRfzI7hl-OR3Di5HxvgU/view',
    image: dsa,
    hue: 'var(--fintrust)',
  },
];
