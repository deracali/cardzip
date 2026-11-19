export const featuredCreators = [
  { handle: 'maya-chen', displayName: 'Maya Chen', category: 'DESIGN EDUCATOR', tagline: 'Design educator', bio: 'Design systems, thoughtful products and creative business notes.', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&h=240&q=85' },
  { handle: 'alex-rivera', displayName: 'Alex Rivera', category: 'INDEPENDENT PHOTOGRAPHER', tagline: 'Independent photographer', bio: 'Field stories, practical camera notes and selected prints.', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&h=240&q=85' },
  { handle: 'nina-patel', displayName: 'Nina Patel', category: 'WRITER & NEWSLETTER CREATOR', tagline: 'Writer & newsletter creator', bio: 'Essays on building a writing practice and sharing work consistently.', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&h=240&q=85' },
  { handle: 'sam-okafor', displayName: 'Sam Okafor', category: 'MUSIC PRODUCER', tagline: 'Music producer', bio: 'New releases, studio notes, sample packs and behind-the-scenes clips.', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&h=240&q=85' },
  { handle: 'jules-martin', displayName: 'Jules Martin', category: 'ILLUSTRATOR', tagline: 'Illustrator', bio: 'Illustration projects, process notes and downloadable resources.', avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&h=240&q=85' },
  { handle: 'the-maker-notes', displayName: 'The Maker Notes', category: 'SMALL CREATIVE STUDIO', tagline: 'Small creative studio', bio: 'A shared home for the studio’s work, updates and useful links.', avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&h=240&q=85' },
]

export const resourceArticles = [
  {
    slug: 'creator-bio-that-connects',
    category: 'PROFILE DESIGN',
    readTime: '5 min read',
    title: 'Write a creator bio that gives people a next step',
    summary: 'A practical structure for explaining who you help, what you make and where a new visitor should go next.',
    takeaway: 'A strong bio is not a full autobiography. It is a clear invitation to explore one useful next step.',
    sections: [
      ['Lead with the work', ['Start with a plain-language description of what you create or teach. A visitor should not have to decode a job title or a clever slogan before understanding the page.', 'If your work covers several topics, name the connection between them. A short promise is more useful than a long list of unrelated roles.']],
      ['Give the visitor context', ['Add one detail that helps a new person understand your point of view: the audience you serve, the kind of projects you take on or the questions you return to.', 'Use proof only when it is accurate and current. If a number needs explanation or frequent updating, a specific project or example may be more helpful.']],
      ['Choose one next step', ['Give the most important action visual priority: read your latest work, join your newsletter, explore a product or contact you. Keep secondary links available without making every option look equally urgent.', 'Review the page on a phone. If the first screen is crowded, remove a link or shorten the introduction.']],
    ],
  },
  {
    slug: 'plan-a-sustainable-publishing-rhythm',
    category: 'PUBLISHING',
    readTime: '6 min read',
    title: 'Plan a publishing rhythm you can actually keep',
    summary: 'Build a simple cadence around your available time, your audience and the formats that suit your work.',
    takeaway: 'Consistency is a system you can repeat, not a promise to publish every day.',
    sections: [
      ['Choose a home format', ['Pick the format in which you can explain your ideas clearly. A useful article can later become a short post, a video outline or a newsletter note, but the original work should fit your strengths.', 'A defined series makes planning easier. It gives you a repeatable structure while leaving room for new ideas.']],
      ['Set a realistic cadence', ['Look at your actual calendar and decide how often you can make something useful without rushing it. Monthly publishing can be consistent when it is planned and maintained.', 'Reserve time for editing, thumbnails, links and publishing. Production tasks are part of the work, not an afterthought.']],
      ['Make a light review loop', ['At the end of each cycle, note what you finished, what readers responded to and what felt expensive in time. Keep the next plan small enough to complete.', 'Use your CreatorHub page to keep the latest work visible and make the next step easy to find.']],
    ],
  },
  {
    slug: 'launch-your-first-digital-product',
    category: 'DIGITAL PRODUCTS',
    readTime: '7 min read',
    title: 'Launch a first digital product with fewer surprises',
    summary: 'A checklist for describing the product, preparing delivery and setting buyer expectations before opening checkout.',
    takeaway: 'A good checkout starts with a clear product promise and a delivery plan, not just a price field.',
    sections: [
      ['Define the outcome', ['Describe who the product is for, what it contains and what the buyer can reasonably expect to do with it. Avoid promises that depend on each buyer’s circumstances.', 'If the product has requirements, file formats or compatibility limits, put them beside the description rather than hiding them after checkout.']],
      ['Prepare delivery and support', ['Test the delivery link in a private browser and confirm that it points to the correct file or destination. Use access controls or expiring links for private files.', 'Decide who handles buyer questions, what the refund policy is and how you will communicate any delivery problem. State these rules before launch.']],
      ['Test the payment path', ['In the connected Next.js edition, Paystack credentials and the product currency are configured on the backend. Test with provider test mode and verify the full return flow before enabling live checkout.', 'Keep payment records and reconcile them with provider reports. The site operator should review settlement, tax and consumer obligations for each selling region.']],
    ],
  },
  {
    slug: 'make-a-welcome-email-worth-reading',
    category: 'AUDIENCE',
    readTime: '4 min read',
    title: 'Make a welcome email worth opening',
    summary: 'Set a clear expectation, deliver the promised value and help new subscribers choose what to read next.',
    takeaway: 'A helpful welcome email tells people what they signed up for and gives them a simple way to manage that choice.',
    sections: [
      ['Confirm the promise', ['Use the first lines to remind subscribers why they joined and what kind of updates they can expect. Be specific about the format and the pace.', 'Do not add people to unrelated campaigns or share their addresses without a lawful basis and transparent notice.']],
      ['Deliver something useful', ['If you promised a guide or resource, put the access link where it is easy to find. If there is no download, point to one article or project that represents your work.', 'Avoid sending a long catalogue on day one. A small, relevant starting point is easier to act on.']],
      ['Keep control with the reader', ['Include a clear unsubscribe path in every marketing email and honor it promptly. Explain how people can update their preferences or contact the service operator.', 'Review the signup notice, privacy policy and email provider settings before collecting real subscriber data.']],
    ],
  },
]
