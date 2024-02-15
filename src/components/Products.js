import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart from "./Cart";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

const Products = () => {
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it

  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  //original product list
  const [productDetails, setProductDetails] = useState([]);
  // filtered product list, on which product card will be rendered
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [timeoutId, setTimeoutId] = useState(null);

  const [cartItems, setCartItems] = useState([]);
  const [cartLoad, setCartLoad] = useState(false);

  let token = localStorage.getItem("token");
  let username = localStorage.getItem("username");
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    setIsLoading(true);
    try {
      let response = await axios.get(`${config.endpoint}/products`);
      setProductDetails(response.data);
      setFilteredProducts(response.data);
      // fetch Cart Items
      setCartLoad(true);
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    performAPICall();
  }, []);

  // useEffect for the fetch Cart
  useEffect(() => {
    fetchCart(token);
  }, [cartLoad]);

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    // start loading
    setIsLoading(true);
    try {
      // make a call for search query
      let response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      //if call is successful then set the response data to the filtered details on which the ui should be rendered
      setFilteredProducts(response.data);
      setProductDetails(response.data);
      // fetchCartItems
      setCartLoad(true);
    } catch (error) {
      // if products are not found
      if (error.response && error.response.status === 404) {
        // set data to an empty array
        setFilteredProducts([]);
      } else if (error.response && error.response.status === 500) {
        // if there is some internal server error
        enqueueSnackbar(error.response.data.message, { variant: "error" });
        setFilteredProducts(productDetails);
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON",
          { variant: "error" }
        );
      }
    }
    // stop loading
    setIsLoading(false);
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    let text = event.target.value;

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    let timeOut = setTimeout(() => {
      performSearch(text);
    }, 500);

    setTimeoutId(timeOut);
  };

  const handleAddToCart = (item) => {
    // console.log("handleAddToCart", item);
    addToCart(token, cartItems, productDetails, item, 1);
  };

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(generateCartItemsFrom(response.data, productDetails));
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    let present = false;
    items.forEach((item) => {
      if (item.productId === productId) present = true;
    });
    return present;
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    // console.log("addToCart", token, items, products, productId, qty);
    if (token) {
      if (!isItemInCart(items, productId)) {
        // console.log("checking isItemInCart", isItemInCart(items, productId));
        // add this product to the cart
        addInCart(productId, qty);
      } else {
        enqueueSnackbar(
          "item already in cart",
          { variant: "warning" }
        );
      }
    } else {
      enqueueSnackbar("Login is required to add an item to the cart", {
        variant: "warning",
      });
    }
  };

  const addInCart = async (productId, qty) => {
    // create a post request and send the data to be added to the cart
    try {
      let response = await axios.post(
        `${config.endpoint}/cart`,
        {
          productId: productId,
          qty: qty,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log("response addInCart", response);
      // set items to the cart
      setCartItems(generateCartItemsFrom(response.data, productDetails));
    } catch (error) {
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not able to add the item to the cart. Something went wrong.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const generateCartItemsFrom = (cartData, productData) => {
    let cartProducts = [];
    if (cartData.length && productData.length) {
      for (let i = 0; i < cartData.length; i++) {
        for (let j = 0; j < productData.length; j++) {
          if (cartData[i].productId === productData[j]._id) {
            cartProducts.push({ ...productData[j], ...cartData[i] });
          }
        }
      }
    }
    // console.log("generateCartItemsFrom", cartProducts);
    return cartProducts;
  };

  const handleQuantity = (productId, qty) => {
    addInCart(productId, qty);
  };

  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
          className="search-desktop"
          size="small"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(e) => debounceSearch(e, timeoutId)}
        />
      </Header>
      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
      <Grid container>
        <Grid item className="product-grid">
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
        </Grid>
      </Grid>

      {isLoading ? (
        <>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            py={10}
          >
            <CircularProgress size={40} />
            <h4>Loading Products...</h4>
          </Box>
        </>
      ) : (
        <Grid container>
          <Grid
            container
            item
            spacing={1}
            direction="row"
            justifyContent="center"
            alignItems="center"
            my={3}
            xs
            md
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Grid item key={product["_id"]} xs={6} md={3}>
                  <ProductCard
                    product={product}
                    handleAddToCart={handleAddToCart}
                  />
                </Grid>
              ))
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                py={10}
              >
                <SentimentDissatisfied size={40} />
                <h4>No products found</h4>
              </Box>
            )}
          </Grid>
          {username && (
            <Grid container item xs={12} md={3}>
              <Cart
                products={productDetails}
                items={cartItems}
                handleQuantity={handleQuantity}
              />
            </Grid>
          )}
        </Grid>
      )}

      <Footer />
    </div>
  );
};

export default Products;
