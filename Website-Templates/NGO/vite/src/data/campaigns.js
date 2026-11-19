export const campaigns = [
  {
    slug: 'clean-water-schools',
    category: 'Clean Water',
    title: 'Provide Clean Water to Rural Schools',
    location: 'Kigali, Rwanda',
    raised: 45000,
    goal: 60000,
    image: '/clean-water.jpg',
    description: 'Help install reliable water points at rural schools so children can learn, grow, and stay healthy without walking miles for clean water.',
    impact: '$25 provides safe water for one student for a year.',
    updates: ['Well #12 complete — 620 students served', 'Solar pumps arrived in Kigali', 'Community hygiene training begins next month'],
  },
  {
    slug: 'classrooms-teachers',
    category: 'Education',
    title: 'Build Classrooms & Train 200 Teachers',
    location: 'Northern Province, Rwanda',
    raised: 28600,
    goal: 40000,
    image: '/classroom.jpg',
    description: 'Build welcoming classrooms and give local teachers the materials and training to help every child reach their potential.',
    impact: '$40 equips a classroom with books and learning materials.',
    updates: ['Two classrooms completed this term', 'Teacher workshop welcomed 48 educators', 'New books delivered to three schools'],
  },
  {
    slug: 'mobile-clinics',
    category: 'Healthcare',
    title: 'Mobile Clinics for Remote Villages',
    location: 'Eastern Province, Rwanda',
    raised: 18300,
    goal: 30000,
    image: '/mobile-clinic.jpg',
    description: 'Bring essential checkups, maternal care, and health education directly to families in rural communities.',
    impact: '$18 helps provide a checkup and essential care.',
    updates: ['Clinic visited 11 villages this month', 'Maternal care kits delivered', 'Community health workers trained'],
  },
]

export const formatMoney = (amount) => `$${amount.toLocaleString('en-US')}`
export const donationPresets = [25, 50, 100, 250]
