export interface AttributeValue {
    id: number;
    name: string;
    price_extra: number;
}

export interface Attribute {
    id: number;
    name: string;
    type: 'radio' | 'checkbox';
    values: AttributeValue[];
}

export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    image?: string;
    attributes?: Attribute[];
}

export interface Category {
    id: number;
    name: string;
    image?: string;
}

export interface CartItem extends Product {
    uniqueKey: string;
    quantity: number;
    total_price: number;
    selectedAttributes?: {
        id: number;
        name: string;
        values: AttributeValue[];
    }[];
}

export interface Cart {
    items: CartItem[];
    total: number;
}
