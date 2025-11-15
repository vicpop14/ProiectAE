require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const prisma = require('./prismaClient');
const productRoutes = require('./routes/product.routes');
const authRoutes = require('./routes/auth.routes');
const cartRoutes = require('./routes/cart.routes');
const pcBuildRoutes = require('./routes/pcBuild.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');


const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/builds', pcBuildRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'Backend is running 🎉' });
});

// test db
app.get('/test-db', async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
