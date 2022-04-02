export interface MenuData {
  itemDescription: string;
  itemName: string;
  itemPhoto: string;
  images: {
    item: {
      resizedImages: {
        [key: string]: string;
      };
    };
  };
  price: number;
}

export class Menu {}
