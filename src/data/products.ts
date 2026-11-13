import heroAtelierImg from '../assets/images/hero_luxuria_atelier_1794573663135.jpg';
import shoeOxfordImg from '../assets/images/shoe_oxford_cognac_1794573663275.jpg';
import shoeLoaferImg from '../assets/images/shoe_loafer_espresso_1794573664883.jpg';
import watchChronoImg from '../assets/images/watch_chrono_charcoal_1794573664833.jpg';
import watchDressImg from '../assets/images/watch_dress_ivory_1794573664828.jpg';
import beltSaddleImg from '../assets/images/belt_brass_saddle_1794573664660.jpg';
import beltObsidianImg from '../assets/images/belt_obsidian_reversible_1794573665910.jpg';
import type { Product } from '../types/store';

export const FACEBOOK_SHARE_URL = 'https://www.facebook.com/share/19NvPrqWBy/';
export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/LuxoriaBDoriginal';
export const WHATSAPP_NUMBER = '+8801410823868';
export const HERO_IMAGE = heroAtelierImg;

export const PRODUCTS: Product[] = [
  {
    id: 'oxford-cognac',
    sku: 'LX-SH-101',
    category: 'shoes',
    tags: ['Best Seller', 'Sale'],
    nameBn: 'কগন্যাক ব্রোগ অক্সফোর্ড',
    nameEn: 'Cognac Brogue Oxford',
    subtitleBn: 'হ্যান্ড-বার্নিশড ফুল-গ্রেইন লেদার',
    subtitleEn: 'Hand-Burnished Full-Grain Leather',
    descriptionBn:
      'অফিস, বিয়ে বা যেকোনো আনুষ্ঠানিক আয়োজনের জন্য নিখুঁত ক্যাপ-টো অক্সফোর্ড। নরম কাফস্কিন লাইনিং ও স্ট্যাকড লেদার সোল সারাদিন আরামদায়ক ব্যবহার নিশ্চিত করে।',
    descriptionEn:
      'Hand-finished cap-toe Oxford crafted for formal evenings and boardroom tailoring. Breathable calfskin lining and a stacked leather heel deliver all-day structure.',
    materialBn: 'ইতালিয়ান ফুল-গ্রেইন লেদার',
    materialEn: 'Italian Full-Grain Leather',
    price: 4850,
    compareAtPrice: 5400,
    image: shoeOxfordImg,
    variants: ['40', '41', '42', '43', '44'],
    variantLabelBn: 'জুতার সাইজ (EU)',
    variantLabelEn: 'Shoe Size (EU)',
    availabilityBn: 'ইন স্টক',
    availabilityEn: 'In Stock',
    featuredRank: 1,
    releasedAt: '2026-09-25',
    specs: [
      {
        labelBn: 'আপার মেটেরিয়াল',
        labelEn: 'Upper Material',
        valueBn: '১০০% ফুল-গ্রেইন বার্নিসড লেদার',
        valueEn: '100% Full-Grain Burnished Leather',
      },
      {
        labelBn: 'সোল ও কনস্ট্রাকশন',
        labelEn: 'Sole & Construction',
        valueBn: 'স্টিচড ওয়েল্ট ও রাবার হিল গ্রিপ',
        valueEn: 'Stitched Welt with Anti-Slip Heel',
      },
      {
        labelBn: 'ডেলিভারি ও এক্সচেঞ্জ',
        labelEn: 'Delivery & Exchange',
        valueBn: 'ঢাকায় ২৪-৪৮ ঘণ্টা · ৭ দিনের সাইজ এক্সচেঞ্জ',
        valueEn: '24–48h in Dhaka · 7-Day Size Exchange',
      },
    ],
  },
  {
    id: 'chrono-charcoal',
    sku: 'LX-WT-201',
    category: 'watches',
    tags: ['Sale'],
    nameBn: 'আর্কাইভ ক্রোনোগ্রাফ স্টিল',
    nameEn: 'Archive Chronograph Steel',
    subtitleBn: 'স্যাফায়ার ক্রিস্টাল ও ট্যান লেদার স্ট্র্যাপ',
    subtitleEn: 'Sapphire Crystal & Tan Leather Strap',
    descriptionBn:
      'ব্রাশড ৩১৬এল স্টেইনলেস স্টিল কেস ও ডিপ চারকোল ডায়ালের সাথে হ্যান্ড-স্টিচড ট্যান লেদার স্ট্র্যাপ। ফরমাল শার্ট কিংবা ক্যাজুয়াল ব্লেজারের সাথে সমান মানানসই।',
    descriptionEn:
      'Brushed 316L stainless steel case framing a slate charcoal chronograph dial, paired with a quick-release saddle-stitched leather strap and scratch-resistant sapphire glass.',
    materialBn: '৩১৬এল স্টিল · স্যাফায়ার গ্লাস',
    materialEn: '316L Steel · Sapphire Glass',
    price: 6850,
    compareAtPrice: 7600,
    image: watchChronoImg,
    variants: ['40mm Tan Strap', '42mm Tan Strap'],
    variantLabelBn: 'কেস সাইজ',
    variantLabelEn: 'Case Diameter',
    availabilityBn: 'লিমিটেড রান',
    availabilityEn: 'Limited Run',
    featuredRank: 2,
    releasedAt: '2026-10-10',
    specs: [
      {
        labelBn: 'মুভমেন্ট',
        labelEn: 'Movement',
        valueBn: 'জাপানি মিয়োটা কোয়ার্টজ ক্রোনোগ্রাফ',
        valueEn: 'Japanese Miyota Quartz Chronograph',
      },
      {
        labelBn: 'ওয়াটার রেজিস্ট্যান্স',
        labelEn: 'Water Resistance',
        valueBn: '৫ এটিএম (৫০ মিটার)',
        valueEn: '5 ATM (50 Meters)',
      },
      {
        labelBn: 'ওয়ারেন্টি',
        labelEn: 'Warranty',
        valueBn: '২ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি',
        valueEn: '2-Year Service Warranty',
      },
    ],
  },
  {
    id: 'belt-brass-saddle',
    sku: 'LX-BL-301',
    category: 'belts',
    tags: ['Best Seller'],
    nameBn: 'স্যাডল ব্রাস ড্রেস বেল্ট',
    nameEn: 'Saddle Brass Dress Belt',
    subtitleBn: 'সলিড ব্রাস বাকল ও ৩৫মিমি পেবল লেদার',
    subtitleEn: 'Solid Brass Buckle & 35mm Pebble Leather',
    descriptionBn:
      'অ্যান্টিক ব্রাশড সলিড ব্রাস বাকলের সাথে মোটা সিঙ্গেল-পিস ফুল-গ্রেইন লেদার। কোনো ফাটল বা খোসা ছাড়বে না—প্রতিদিনের ব্যবহারে আরও সুন্দর প্যাটিনা তৈরি হয়।',
    descriptionEn:
      'Single-piece full-grain pebble leather paired with a solid sand-cast brass buckle. Hand-burnished edges ensure zero peeling and a rich patina over years of wear.',
    materialBn: 'ফুল-গ্রেইন পেবল লেদার · ব্রাস',
    materialEn: 'Full-Grain Pebble Leather · Brass',
    price: 1650,
    image: beltSaddleImg,
    variants: ['32"', '34"', '36"', '38"', '40"'],
    variantLabelBn: 'কোমরের মাপ',
    variantLabelEn: 'Waist Size',
    availabilityBn: 'ইন স্টক',
    availabilityEn: 'In Stock',
    featuredRank: 3,
    releasedAt: '2026-10-18',
    specs: [
      {
        labelBn: 'লেদার প্রস্থ ও পুরুত্ব',
        labelEn: 'Strap Width & Gauge',
        valueBn: '৩৫মিমি প্রস্থ · ৩.৮মিমি সিঙ্গেল-পিস লেদার',
        valueEn: '35mm Width · 3.8mm Single-Piece Hide',
      },
      {
        labelBn: 'বাকল',
        labelEn: 'Hardware',
        valueBn: 'অ্যান্টিক ব্রাশড সলিড ব্রাস',
        valueEn: 'Antique Brushed Solid Brass',
      },
      {
        labelBn: 'প্যাকেজিং',
        labelEn: 'Packaging',
        valueBn: 'লাক্সুরিয়া বিডি কটন পাউচ ও গিফট বক্স',
        valueEn: 'Luxuria BD Cotton Pouch & Gift Box',
      },
    ],
  },
  {
    id: 'loafer-espresso',
    sku: 'LX-SH-102',
    category: 'shoes',
    tags: ['New Arrival'],
    nameBn: 'এসপ্রেসো সুয়েড পেনি লোফার',
    nameEn: 'Espresso Suede Penny Loafer',
    subtitleBn: 'হ্যান্ড-স্টিচড অ্যাপ্রন টো সুয়েড',
    subtitleEn: 'Hand-Stitched Apron Toe Suede',
    descriptionBn:
      'হালকা ও নমনীয় স্লিপ-অন লোফার যা চিনোস, ডেনিম বা স্মার্ট ক্যাজুয়াল পোশাকের সাথে অনায়াসে মানিয়ে যায়। ভেতরে কুশনড ইনসোল ও ওয়াটার-রিপেলেন্ট সুয়েড ফিনিশ।',
    descriptionEn:
      'Unlined water-repellent calf suede slip-on featuring a classic hand-stitched apron toe and cushioned leather footbed for effortless weekend-to-evening transitions.',
    materialBn: 'ওয়াটার-রিপেলেন্ট কাফ সুয়েড',
    materialEn: 'Water-Repellent Calf Suede',
    price: 4350,
    image: shoeLoaferImg,
    variants: ['40', '41', '42', '43', '44'],
    variantLabelBn: 'জুতার সাইজ (EU)',
    variantLabelEn: 'Shoe Size (EU)',
    availabilityBn: 'ইন স্টক',
    availabilityEn: 'In Stock',
    featuredRank: 4,
    releasedAt: '2026-11-06',
    specs: [
      {
        labelBn: 'আপার মেটেরিয়াল',
        labelEn: 'Upper Material',
        valueBn: 'ভেলভেট-ন্যাপ ইতালিয়ান কাফ সুয়েড',
        valueEn: 'Velvet-Nap Italian Calf Suede',
      },
      {
        labelBn: 'ইনসোল',
        labelEn: 'Footbed',
        valueBn: 'মেমোরি-ফোম লেদার কুশন',
        valueEn: 'Cushioned Leather Footbed',
      },
      {
        labelBn: 'ডেলিভারি ও এক্সচেঞ্জ',
        labelEn: 'Delivery & Exchange',
        valueBn: 'ঢাকায় ২৪-৪৮ ঘণ্টা · ৭ দিনের সাইজ এক্সচেঞ্জ',
        valueEn: '24–48h in Dhaka · 7-Day Size Exchange',
      },
    ],
  },
  {
    id: 'dress-watch-ivory',
    sku: 'LX-WT-202',
    category: 'watches',
    tags: ['New Arrival', 'Sale'],
    nameBn: 'হ্যারিটেজ আইভরি ড্রেস ওয়াচ',
    nameEn: 'Heritage Ivory Dress Watch',
    subtitleBn: 'আল্ট্রা-স্লিম গোল্ড কেস ও ব্ল্যাক স্ট্র্যাপ',
    subtitleEn: 'Ultra-Slim Gold Case & Black Strap',
    descriptionBn:
      'মাত্র ৭.২মিমি স্লিম প্রোফাইল যা শার্টের কাফের নিচে অনায়াসে বসে যায়। আইভরি টেক্সচার্ড ডায়াল ও অ্যালিগেটর-গ্রেইন কালো চামড়ার স্ট্র্যাপে আভিজাত্যের ছোঁয়া।',
    descriptionEn:
      'A refined 7.2mm ultra-slim silhouette engineered to glide under tailored shirt cuffs. Paired with a warm ivory linen-textured dial and black alligator-grain leather strap.',
    materialBn: '১৮কে গোল্ড পিভিডি · কাফস্কিন',
    materialEn: '18K Gold PVD · Calfskin',
    price: 5900,
    compareAtPrice: 6500,
    image: watchDressImg,
    variants: ['38mm Slim', '40mm Classic'],
    variantLabelBn: 'কেস সাইজ',
    variantLabelEn: 'Case Diameter',
    availabilityBn: 'ইন স্টক',
    availabilityEn: 'In Stock',
    featuredRank: 5,
    releasedAt: '2026-11-10',
    specs: [
      {
        labelBn: 'কেস থিকনেস',
        labelEn: 'Profile Thickness',
        valueBn: '৭.২ মিমি আল্ট্রা-স্লিম প্রোফাইল',
        valueEn: '7.2mm Ultra-Slim Profile',
      },
      {
        labelBn: 'গ্লাস',
        labelEn: 'Crystal',
        valueBn: 'অ্যান্টি-রিফ্লেক্টিভ স্যাফায়ার কোটেড',
        valueEn: 'Anti-Reflective Sapphire Coated',
      },
      {
        labelBn: 'ওয়ারেন্টি',
        labelEn: 'Warranty',
        valueBn: '২ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি',
        valueEn: '2-Year Service Warranty',
      },
    ],
  },
  {
    id: 'belt-obsidian-formal',
    sku: 'LX-BL-302',
    category: 'belts',
    nameBn: 'অবসিডিয়ান ব্ল্যাক ফরমাল বেল্ট',
    nameEn: 'Obsidian Black Formal Belt',
    subtitleBn: 'ব্রাশড গানমেটাল বাকল ও স্মুথ কাফস্কিন',
    subtitleEn: 'Brushed Gunmetal Buckle & Smooth Calfskin',
    descriptionBn:
      'মিনিমালিস্ট কালো স্মুথ লেদার ও ব্রাশড গানমেটাল ফিনিশ বাকল। যেকোনো স্যুট, টাক্সিডো বা কর্পোরেট ফরমাল আউটফিটের জন্য অপরিহার্য।',
    descriptionEn:
      'Sleek matte-black full-grain calfskin anchored by a minimalist brushed gunmetal buckle. Cut cleanly at 32mm to match formal trousers and black dress shoes.',
    materialBn: 'স্মুথ কাফস্কিন · গানমেটাল',
    materialEn: 'Smooth Calfskin · Gunmetal',
    price: 1550,
    image: beltObsidianImg,
    variants: ['32"', '34"', '36"', '38"', '40"'],
    variantLabelBn: 'কোমরের মাপ',
    variantLabelEn: 'Waist Size',
    availabilityBn: 'ইন স্টক',
    availabilityEn: 'In Stock',
    featuredRank: 6,
    releasedAt: '2026-10-29',
    specs: [
      {
        labelBn: 'লেদার প্রস্থ',
        labelEn: 'Strap Width',
        valueBn: '৩২মিমি ফরমাল ড্রেস কাট',
        valueEn: '32mm Formal Dress Cut',
      },
      {
        labelBn: 'বাকল',
        labelEn: 'Hardware',
        valueBn: 'স্ক্র্যাচ-রেজিস্ট্যান্ট ব্রাশড গানমেটাল',
        valueEn: 'Scratch-Resistant Brushed Gunmetal',
      },
      {
        labelBn: 'প্যাকেজিং',
        labelEn: 'Packaging',
        valueBn: 'লাক্সুরিয়া বিডি প্রেজেন্টেশন বক্স',
        valueEn: 'Luxuria BD Presentation Box',
      },
    ],
  },
];
