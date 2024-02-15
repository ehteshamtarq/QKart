// import { AddShoppingCartOutlined } from "@mui/icons-material";
// import {
//   Button,
//   Card,
//   CardActions,
//   CardContent,
//   CardMedia,
//   Rating,
//   Typography, Box
// } from "@mui/material";
// import React from "react";
// import "./ProductCard.css";
// import { CardActionArea } from '@mui/material';

// const ProductCard = ({ product, handleAddToCart }) => {

//   return (
//     <Card className="card">
//     <CardMedia component={"img"} image={product.image} alt="product" />
//     <CardContent>
//       <Typography gutterBottom variant="body2" component={"div"}>
//         {product.name}
//       </Typography>
//       <Typography
//         variant="h6"
//         color="textPrimary"
//         sx={{ fontWeight: "bold" }}
//         mb={1}
//       >
//         ${product.cost}
//       </Typography>
//       <Box display={"flex"}>
//         <Rating value={product.rating} readOnly size="small" />
//         <Box sx={{ ml: 1 }}>{product.rating}</Box>
//       </Box>
//     </CardContent>
//     <CardActions className="card-actions">
//       <Button
//         color="primary"
//         variant="contained"
//         fullWidth
//         className="card-button"
//       >
//         <AddShoppingCartOutlined /> &nbsp; Add To Cart
//       </Button>
//     </CardActions>
//   </Card>
//   );
// };

// export default ProductCard;



import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
  Box,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  // console.log("productCard", product);
  return (
    <Card className="card">
      <CardMedia component={"img"} image={product.image} alt="product" />
      <CardContent>
        <Typography gutterBottom variant="body2" component={"div"}>
          {product.name}
        </Typography>
        <Typography
          variant="h6"
          color="textPrimary"
          sx={{ fontWeight: "bold" }}
          mb={1}
        >
          ${product.cost}
        </Typography>
        <Box display={"flex"}>
          <Rating value={product.rating} readOnly size="small" />
          <Box sx={{ ml: 1 }}>{product.rating}</Box>
        </Box>
      </CardContent>
      <CardActions className="card-actions">
        <Button
          color="primary"
          variant="contained"
          fullWidth
          className="card-button"
          onClick={()=>handleAddToCart(product["_id"])}
        >
          <AddShoppingCartOutlined /> &nbsp; Add To Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
