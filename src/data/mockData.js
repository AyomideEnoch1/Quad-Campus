export const SCHOOLS = [
  { id: 'harvard_univ', name: 'Harvard University', shortName: 'Harvard', domain: 'harvard.edu' },
  { id: 'mit_univ', name: 'MIT', shortName: 'MIT', domain: 'mit.edu' },
  { id: 'stanford_univ', name: 'Stanford University', shortName: 'Stanford', domain: 'stanford.edu' },
  { id: 'nyu_univ', name: 'NYU', shortName: 'NYU', domain: 'nyu.edu' }
];

export const CURRENT_USER = {
  uid: 'usr_jenny',
  displayName: 'Jenny Wilson',
  username: 'jenny_wilson',
  email: 'jenny@harvard.edu',
  schoolId: 'harvard_univ',
  schoolName: 'Harvard University',
  isVerifiedSchool: true,
  major: 'Computer Science & AI',
  gradYear: 2026,
  bio: 'CS \'26 | Tech Lead @ QUAD Society 🚀 | Photographer & Tech enthusiast. Always down for hackathons!',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
  followersCount: 672,
  followingCount: 248,
  likesReceived: 27700,
  reputationScore: 99
};

export const INITIAL_POSTS = [
  {
    id: 'post_1',
    authorId: 'usr_jenny',
    authorName: 'Jenny Wilson',
    authorUsername: 'jenny_wilson',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    authorSchoolId: 'harvard_univ',
    authorSchoolName: 'Harvard University',
    isVerifiedAuthor: true,
    content: 'Who else is grinding at Cabot Science Library right now? We have free coffee & donuts for CS students until 2 AM! ☕🍩💻',
    mediaUrls: ['https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80'],
    poll: {
      question: 'Best study spot on campus?',
      options: [
        { id: 'opt_1', text: 'Cabot Science Library', votes: 48 },
        { id: 'opt_2', text: 'Widener Library Stacks', votes: 29 },
        { id: 'opt_3', text: 'Science Center Cafe', votes: 14 }
      ],
      userVotedOption: 'opt_1'
    },
    likesCount: 64,
    repostsCount: 12,
    commentsCount: 18,
    isLiked: true,
    scope: 'my_school',
    createdAt: '25m ago'
  },
  {
    id: 'post_2',
    authorId: 'usr_alex',
    authorName: 'Alex Rivera',
    authorUsername: 'arivera_mit',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    authorSchoolId: 'mit_univ',
    authorSchoolName: 'MIT',
    isVerifiedAuthor: true,
    content: '🚀 ANNOUNCEMENT: Inter-School Hackathon 2026 registration is OPEN! Harvard, MIT, Stanford, NYU & Columbia teams are eligible. $15k prize pool.',
    mediaUrls: ['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80'],
    likesCount: 189,
    repostsCount: 45,
    commentsCount: 32,
    isLiked: false,
    scope: 'all_schools',
    createdAt: '2h ago'
  }
];

export const INITIAL_MARKETPLACE = [
  {
    id: 'item_1',
    sellerId: 'usr_sophia',
    sellerName: 'Sophia Chen',
    sellerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    sellerSchoolId: 'stanford_univ',
    sellerSchoolName: 'Stanford',
    isVerifiedSeller: true,
    title: 'Calculus: Early Transcendentals (8th Ed)',
    price: 45.00,
    category: 'Textbooks',
    condition: 'Like New',
    description: 'Zero highlight marks, crisp pages. Mandatory textbook for Math 21 / Calc sequence.',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    location: 'Stanford Campus / Mail Room',
    status: 'available',
    createdAt: '1d ago'
  },
  {
    id: 'item_2',
    sellerId: 'usr_alex',
    sellerName: 'Alex Rivera',
    sellerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    sellerSchoolId: 'mit_univ',
    sellerSchoolName: 'MIT',
    isVerifiedSeller: true,
    title: 'Apple iPad Air M1 (64GB) + Apple Pencil',
    price: 340.00,
    category: 'Tech',
    condition: 'Excellent',
    description: 'Used for one semester of digital note taking. Battery health 97%. Includes magnetic case.',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    location: 'MIT Student Center / Boston delivery',
    status: 'available',
    createdAt: '3h ago'
  }
];

export const INITIAL_CLUBS = [
  {
    id: 'club_1',
    name: 'QUAD Tech & AI Builders',
    tagline: 'Cross-campus student founder network',
    schoolId: 'harvard_univ',
    schoolName: 'Harvard University',
    isInterSchool: true,
    category: 'Technology',
    memberCount: 342,
    logoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    isJoined: true
  }
];

export const INITIAL_CHATS = [
  {
    id: 'chat_1',
    partner: {
      uid: 'usr_sophia',
      displayName: 'Sophia Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    },
    lastMessage: 'Is the iPad still available?',
    lastMessageTime: '2m ago',
    unread: 2,
  },
  {
    id: 'chat_2',
    partner: {
      uid: 'usr_alex',
      displayName: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    },
    lastMessage: 'See you at the hackathon!',
    lastMessageTime: '1h ago',
    unread: 0,
  },
  {
    id: 'chat_3',
    partner: {
      uid: 'usr_maya',
      displayName: 'Maya Okafor',
      avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
    },
    lastMessage: 'Thanks for the notes 🙏',
    lastMessageTime: '3h ago',
    unread: 0,
  },
];
