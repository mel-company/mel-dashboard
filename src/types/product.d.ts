export type ProductType = {
    id: string;
    image: string;
    title: string;
    description: string;
    rate: number;
    price: number;
    enabled: boolean;
    createdAt: string;
    categories: CategoryType[];
}

export type CategoryType = {
    id: string;
    name: string;
    image: string;
}