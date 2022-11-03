import React, { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import {
  addToDb,
  deleteShoppingCart,
  getStoredCart
} from "../../utilities/fakedb";
import Cart from "../Cart/Cart";
import Product from "../Product/Product";
import "./Shop.css";

const Shop = () => {
  //   const { count, products } = useLoaderData();
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [curPage, setCurPage] = useState(0);
  const [size, setSize] = useState(10);
  const [cart, setCart] = useState([]);
  const pages = Math.ceil(count / size);

  useEffect(() => {
    fetch(`http://localhost:5000/products?page=${curPage}&size=${size}`)
      .then(res => res.json())
      .then(data => {
        setCount(data.count);
        setProducts(data.products);
      })
      .catch(err => console.error(err));
  }, [curPage, size]);

  const clearCart = () => {
    setCart([]);
    deleteShoppingCart();
  };

  useEffect(() => {
    const storedCart = getStoredCart();
    const savedCart = [];
    const ids = Object.keys(storedCart);
    fetch(`http://localhost:5000/productsByIds`, {
      method: "post",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(ids)
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        for (const id in storedCart) {
          const addedProduct = data.find(product => product._id === id);
          if (addedProduct) {
            const quantity = storedCart[id];
            addedProduct.quantity = quantity;
            savedCart.push(addedProduct);
          }
        }
        setCart(savedCart);
      })
      .catch(err => console.error(err));
  }, [products]);

  const handleAddToCart = selectedProduct => {
    console.log(selectedProduct);
    let newCart = [];
    const exists = cart.find(product => product._id === selectedProduct._id);
    if (!exists) {
      selectedProduct.quantity = 1;
      newCart = [...cart, selectedProduct];
    } else {
      const rest = cart.filter(product => product._id !== selectedProduct._id);
      exists.quantity = exists.quantity + 1;
      newCart = [...rest, exists];
    }

    setCart(newCart);
    addToDb(selectedProduct._id);
  };

  return (
    <div className="shop-container">
      <div className="products-container">
        {products.map(product => (
          <Product
            key={product._id}
            product={product}
            handleAddToCart={handleAddToCart}></Product>
        ))}
      </div>
      <div className="cart-container">
        <Cart clearCart={clearCart} cart={cart}>
          <Link to="/orders">
            <button>Review Order</button>
          </Link>
        </Cart>
      </div>

      <div className="pagination">
        <select onChange={ev => setSize(ev.target.value)}>
          <option value="5">5</option>
          <option value="10" selected>
            10
          </option>
          <option value="15">15</option>
        </select>
        {[...Array(pages).keys()].map(num => (
          <button
            key={`page-num-${num}`}
            type="button"
            className={curPage === num ? `selected` : undefined}
            onClick={() => setCurPage(num)}>
            {num + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Shop;
