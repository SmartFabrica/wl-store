import express from "express";
import userRouter from "./routes/user.route";
import categoryRouter from "./routes/category.route";
import brandRouter from "./routes/brand.route";
import brandModelRouter from "./routes/brand-model.route";
import authRouter from "./routes/auth.route";
import { protect } from "./middlewares/auth.middeware";
import cors from "cors";
import productRouter from "./routes/product.route";
import brandModelChassisRouter from "./routes/brand-model-chassis.route";
import { errorHandler } from "./middlewares/error.middleware";
import quoteRouter from "./routes/quote.route";
import dashboardRouter from "./routes/dashboard.route";
import uploadRouter from "./routes/upload.route";
import customerProductRouter from "./routes/customer-product.route";
import customerBrandRouter from "./routes/customer-brand.route";
import customerBrandModelRouter from "./routes/customer-brand-model.route";
import customerBrandModelChassisRouter from "./routes/customer-brand-model-chassis.route";
import customerCategoryRouter from "./routes/customer-category.route";

const app = express();
const port = process.env.PORT ?? "3000";

app.use(express.json({ limit: "10mb" }));
app.use(cors());

app.use("/api/auth", authRouter);
// app.use(protect);

app.use("/api/customer/products", customerProductRouter);
app.use("/api/customer/categories", customerCategoryRouter);
app.use("/api/customer/brands", customerBrandRouter);
app.use("/api/customer/models", customerBrandModelRouter);
app.use("/api/customer/chassis", customerBrandModelChassisRouter);

app.use("/api/users", userRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/brands", brandRouter);
app.use("/api/brand-models", brandModelRouter);
app.use("/api/brand-model-chassis", brandModelChassisRouter);
app.use("/api/products", productRouter);
app.use("/api/quotes", quoteRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/upload", uploadRouter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
