import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Partial<Product>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (cart) {
        setProducts(JSON.parse(cart));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const existProduct = products.find(item => item.id === product.id);
      if (!existProduct) {
        setProducts([...products, { ...product, quantity: 1 }]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const updateProducts = products;
      const incrementProductIndex = products.findIndex(item => item.id === id);

      if (incrementProductIndex >= 0) {
        updateProducts[incrementProductIndex].quantity += 1;

        setProducts([...updateProducts]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(updateProducts),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const updateProducts = products;
      const decrementProductIndex = products.findIndex(item => item.id === id);

      if (decrementProductIndex >= 0) {
        if (updateProducts[decrementProductIndex].quantity > 1) {
          updateProducts[decrementProductIndex].quantity -= 1;
        }

        setProducts([...updateProducts]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(updateProducts),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
