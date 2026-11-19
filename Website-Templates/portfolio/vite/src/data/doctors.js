import doctorSarah from '../assets/Doctor portrait.png'
import doctorJames from '../assets/Doctor portrait (1).png'
import doctorEmily from '../assets/Doctor portrait (2).png'

export const doctors = [
  {
    slug: 'sarah-mitchell',
    name: 'Dr. Sarah Mitchell',
    specialty: 'Dermatology',
    credentials: 'MD, FAAD',
    location: 'New York, NY',
    fee: 120,
    rating: 4.9,
    reviews: 128,
    experience: '12 years',
    image: doctorSarah,
    bio: 'Dr. Mitchell helps patients feel comfortable in their skin with thoughtful, evidence-based dermatology care. She specializes in preventive skin health and personalized treatment plans.',
    education: 'Columbia University College of Physicians and Surgeons',
    availability: ['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM'],
  },
  {
    slug: 'james-chen',
    name: 'Dr. James Chen',
    specialty: 'Cardiology',
    credentials: 'MD, FACC',
    location: 'Brooklyn, NY',
    fee: 150,
    rating: 4.8,
    reviews: 96,
    experience: '15 years',
    image: doctorJames,
    bio: 'Dr. Chen partners with patients to support lifelong heart health. His care focuses on prevention, clear communication, and treatment plans that work in everyday life.',
    education: 'New York University School of Medicine',
    availability: ['8:30 AM', '11:00 AM', '1:30 PM', '3:00 PM'],
  },
  {
    slug: 'emily-rodriguez',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrics',
    credentials: 'MD, FAAP',
    location: 'Queens, NY',
    fee: 100,
    rating: 5.0,
    reviews: 142,
    experience: '10 years',
    image: doctorEmily,
    bio: 'Dr. Rodriguez provides warm, family-centered care for children at every stage. She makes space for questions and helps families feel confident about their child’s health.',
    education: 'Albert Einstein College of Medicine',
    availability: ['9:30 AM', '11:30 AM', '2:00 PM', '4:00 PM'],
  },
]

export const specialties = ['Cardiology', 'Dermatology', 'Pediatrics', 'Dental']
