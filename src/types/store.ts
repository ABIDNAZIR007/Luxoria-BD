export type Language = 'bn' | 'en';

export type ThemeMode = 'light' | 'dark';

export type Category = 'all' | 'shoes' | 'watches' | 'belts';

export type ProductCategory = Exclude<Category, 'all'>;

export type ProductTag = 'New Arrival' | 'Best Seller' | 'Sale';

export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc';

export type DeliveryZone = 'dhaka' | 'outside';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad';

export interface ProductSpec {
  labelBn: string;
  labelEn: string;
  valueBn: string;
  valueEn: string;
}

export interface Product {
  id: string;
  sku: string;
  category: ProductCategory;
  tags?: ProductTag[];
  nameBn: string;
  nameEn: string;
  subtitleBn: string;
  subtitleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  materialBn: string;
  materialEn: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  variants: string[];
  variantLabelBn: string;
  variantLabelEn: string;
  availabilityBn: string;
  availabilityEn: string;
  featuredRank: number;
  releasedAt?: string;
  specs: ProductSpec[];
}

export interface CartItem {
  key: string;
  productId: string;
  sku: string;
  nameBn: string;
  nameEn: string;
  category: ProductCategory;
  variant: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  giftWrappingFee: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  grandTotal: number;
}

export interface CheckoutFormState {
  customerName: string;
  phone: string;
  deliveryZone: DeliveryZone;
  address: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  note: string;
  giftWrapping: boolean;
  giftMessage: string;
  discountCode?: string;
}

export type ValidationErrors = Partial<Record<keyof CheckoutFormState, string>>;

export interface OrderRecord {
  orderId: string;
  createdAt: string;
  status: 'confirmed' | 'preparing' | 'shipped' | 'delivered';
  customerName: string;
  phone: string;
  deliveryZone: DeliveryZone;
  address: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  note?: string;
  giftWrapping?: boolean;
  giftMessage?: string;
  discountCode?: string;
  items: CartItem[];
  totals: CartTotals;
}

export interface ProductReview {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  authorName?: string;
  imageDataUrl?: string;
  createdAt: string;
}

export type ReviewsByProduct = Record<string, ProductReview[]>;

export type FaqTopic = 'all' | 'care' | 'delivery' | 'returns';

export interface FaqItem {
  id: string;
  topic: Exclude<FaqTopic, 'all'>;
  questionBn: string;
  questionEn: string;
  answerBn: string;
  answerEn: string;
}

export type TrackingStatus = 'Processing' | 'In Transit' | 'Delivered';

export interface TrackingCheckpoint {
  step: 'placed' | 'processing' | 'in_transit' | 'delivered';
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  locationBn: string;
  locationEn: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
}

export interface TrackingLookupResult {
  trackingId: string;
  status: TrackingStatus;
  estimatedDeliveryBn: string;
  estimatedDeliveryEn: string;
  courierName: string;
  customerName: string;
  phoneMasked: string;
  destination: string;
  paymentSummaryBn: string;
  paymentSummaryEn: string;
  itemsSummary: Array<{
    nameBn: string;
    nameEn: string;
    variant: string;
    quantity: number;
    lineTotal: number;
  }>;
  totals: {
    subtotal: number;
    discountAmount: number;
    shippingFee: number;
    giftWrappingFee: number;
    grandTotal: number;
  };
  discountCode?: string;
  giftWrapping?: boolean;
  checkpoints: TrackingCheckpoint[];
  isUserOrder?: boolean;
}

export type StoreLocationType = 'all' | 'pickup' | 'workshop';

export interface StoreLocation {
  id: string;
  type: Exclude<StoreLocationType, 'all'>;
  nameBn: string;
  nameEn: string;
  neighborhoodBn: string;
  neighborhoodEn: string;
  addressBn: string;
  addressEn: string;
  hoursBn: string;
  hoursEn: string;
  servicesBn: string;
  servicesEn: string;
  phone: string;
  mapX: number;
  mapY: number;
}

export interface PriceDropAlertPreference {
  productId: string;
  email: string;
  targetPrice: number;
  createdAt: string;
}

export type PriceDropAlertsByProduct = Record<
  string,
  PriceDropAlertPreference
>;

export interface ProductVideoClip {
  id: string;
  label: string;
  caption: string;
  durationSec: number;
  panX: string;
  panY: string;
  scaleTo: number;
}

export interface ProductVideoReel {
  productId: string;
  title: string;
  subtitle: string;
  totalDurationSec: number;
  clips: ProductVideoClip[];
}




