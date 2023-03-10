import { createContext, useContext, useEffect, useReducer } from "react";
import styles from "./Checkout.module.css";
import { LoadingIcon } from "./Icons";

import { getProducts } from "./dataService";

// You are provided with an incomplete <Checkout /> component.
// You are not allowed to add any additional HTML elements.
// You are not allowed to use refs.

// Demo video - You can view how the completed functionality should look at: https://drive.google.com/file/d/1o2Rz5HBOPOEp9DlvE9FWnLJoW9KUp5-C/view?usp=sharing

// Once the <Checkout /> component is mounted, load the products using the getProducts function.
// Once all the data is successfully loaded, hide the loading icon.
// Render each product object as a <Product/> component, passing in the necessary props.
// Implement the following functionality:
//  - The add and remove buttons should adjust the ordered quantity of each product
//  - The add and remove buttons should be enabled/disabled to ensure that the ordered quantity can’t be negative and can’t exceed the available count for that product.
//  - The total shown for each product should be calculated based on the ordered quantity and the price
//  - The total in the order summary should be calculated
//  - For orders over $1000, apply a 10% discount to the order. Display the discount text only if a discount has been applied.
//  - The total should reflect any discount that has been applied
//  - All dollar amounts should be displayed to 2 decimal places

const CheckoutContext = createContext();

const initialState = {
  loading: true,
  products: [],
  order: {},
  discount: 0,
};

const checkoutReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_PRODUCTS":
      return { ...state, loading: false, products: action.payload };
    case "ADD_TO_CART":
      return {
        ...state,
        order: { ...state.order, [action.payload.id]: action.payload.quantity },
      };
    case "REMOVE_FROM_CART":
      const newOrder = { ...state.order };
      delete newOrder[action.payload];
      return { ...state, order: newOrder };
    case "SET_DISCOUNT":
      return { ...state, discount: action.payload };
    default:
      return state;
  }
};

const Product = ({ product }) => {
  const { state, dispatch } = useContext(CheckoutContext);
  const { order } = state;

  const quantity = order[product.id] || 0;
  const total = quantity * product.price;

  console.log(product);
  return (
    <tr>
      <td>{product.id}</td>
      <td>{product.name}</td>
      <td>{product.availableCount}</td>
      <td>$ {product.price}</td>
      <td>{quantity}</td>
      <td>$ {total.toFixed(2)}</td>
      <td>
        <button
          className={styles.actionButton}
          onClick={() =>
            dispatch({
              type: "ADD_TO_CART",
              payload: { id: product.id, quantity: quantity + 1 },
            })
          }
          disabled={product.availableCount <= quantity}
        >
          +
        </button>
        <button
          className={styles.actionButton}
          onClick={() =>
            dispatch({
              type: "ADD_TO_CART",
              payload: { id: product.id, quantity: quantity - 1 },
            })
          }
          disabled={quantity <= 0}
        >
          -
        </button>
      </td>
    </tr>
  );
};

const Checkout = () => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  useEffect(() => {
    getProducts().then((data) =>
      dispatch({ type: "LOAD_PRODUCTS", payload: data })
    );
  }, []);

  const { loading, products, order, discount } = state;

  const total = products.reduce((acc, product) => {
    const quantity = order[product.id] || 0;
    return acc + quantity * product.price;
  }, 0);

  const discountAmount = total > 1000 ? total * 0.1 : 0;

  useEffect(() => {
    dispatch({ type: "SET_DISCOUNT", payload: discountAmount });
  }, [discountAmount]);

  if (loading) {
    return (
      <div>
        <header className={styles.header}>
          <h1>Powered by People</h1>
        </header>
        <main>
          <LoadingIcon />
        </main>
      </div>
    );
  }

  return (
    <CheckoutContext.Provider value={{ state, dispatch }}>
      <div>
        <header className={styles.header}>
          <h1>Powered by People</h1>
        </header>
        <main>
          <LoadingIcon />
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th># Available</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {/* Products should be rendered here */}

              {products.map((product) => (
                <Product key={product.id} product={product} />
              ))}
            </tbody>
          </table>
          <h2>Order summary</h2>
          <p>
            Discount: $ {discount > 0 ? discountAmount.toFixed(2) : discount}
          </p>
          <p>Total: $ {total > 0 ? total.toFixed(2) : total}</p>
        </main>
      </div>
    </CheckoutContext.Provider>
  );
};

export default Checkout;
