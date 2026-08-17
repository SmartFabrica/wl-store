import express from "express";
import userRouter from "./routes/user.route";
import categoryRouter from "./routes/category.route";
import brandRouter from "./routes/brand.route";
import brandModelRouter from "./routes/brand-model.route";
import authRouter from "./routes/auth.route";
import { protect } from "./middlewares/auth.middeware";
import cors from "cors";
import productRouter from "./routes/product.route";

const app = express();
const port = process.env.PORT ?? "3000";

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);
// app.use(protect);

app.use("/api/users", userRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/brands", brandRouter);
app.use("/api/brand-models", brandModelRouter);
app.use("/api/products", productRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
