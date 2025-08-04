import './config'; // Load environment variables
import express, {Express} from 'express';
import { handleCustomerAndRepair, handleRepairForCustomer, handleRepairPickup, handleRepairStatusUpdate, handleAddRepairItem, handleGetRepairItems } from './controllers/repairController';
import { handleCreateCustomerOrder, handleCreateOrderForCustomer, handleCreateCompleteOrder, handleGetOrder, handleUpdateOrder } from './controllers/orderController';
import { handleCreateCustomerInstall, handleCreateInstallForCustomer, handleGetInstallItemsById, handleAddInstallItem, handleUpdateInstallItem, handleRemoveInstallItem, handleGetInstall, handleUpdateInstall } from './controllers/installController';
import { handleGetCustomers, handleAddCustomer, handleSearchCustomers, handleGetCustomersWithRecentVisits, handleUpdateCustomer, handleDeleteCustomer} from './controllers/customerController';
import { handleGetInstallSummaries, handleGetOrderSummaries, handleGetRepairSummaries } from './controllers/summaryController';
import { handleSearchItems, handleGetOrderItems, handleAddOrderItem, handleUpdateOrderItem, handleRemoveOrderItem, handleGetInstallItems, handleGetAllItems, handleGetItemById, handleCreateItem, handleUpdateItem, handleDeleteItem, handleGetSellableItems } from './controllers/itemController';




const PORT = process.env.PORT;
const app: Express = express();
app.use(express.json());
app.use(express.urlencoded( {extended: true}));
app.use(express.static('public', {extensions: ['html']}));
app.use(express.json());


// Endpointss
app.post('/createCustomer', handleAddCustomer); 
app.post('/repairs/create-customer-repair', handleCustomerAndRepair);
app.post('/repairs/create-repair', handleRepairForCustomer ); 
app.post('/repairs/:repairId/pickup', handleRepairPickup);
app.post('/repairs/:repairId/status', handleRepairStatusUpdate);
app.post('/repairs/add-item', handleAddRepairItem);
app.get('/api/repairs/:repairId/items', handleGetRepairItems);
app.post('/orders/create-customer-order', handleCreateCustomerOrder);
app.post('/orders/create-order', handleCreateOrderForCustomer);
app.post('/orders/create-complete-order', handleCreateCompleteOrder);

// Order API endpoints
app.get('/api/orders/:id', handleGetOrder);
app.put('/api/orders/:id', handleUpdateOrder);
app.post('/installs/create-customer-install', handleCreateCustomerInstall);
app.post('/create-install', handleCreateInstallForCustomer);

// Install API endpoints
app.get('/api/installs/:id', handleGetInstall);
app.put('/api/installs/:id', handleUpdateInstall);

// Install item management routes
app.get('/installs/:installId/items', handleGetInstallItemsById);
app.get('/api/installs/:installId/items', handleGetInstallItemsById);
app.post('/installs/add-item', handleAddInstallItem);
app.post('/api/install-items', handleAddInstallItem);
app.put('/installs/update-item', handleUpdateInstallItem);
app.put('/api/install-items/:installItemId', handleUpdateInstallItem);
app.delete('/installs/remove-item', handleRemoveInstallItem);
app.delete('/api/install-items/:installItemId', handleRemoveInstallItem);

// Route to get all items available for installs
app.get('/items/install', handleGetInstallItems);
app.get('/api/items/install', handleGetInstallItems);

app.get('/api/customers', handleGetCustomers);
app.get('/api/customers/search', handleSearchCustomers);
app.get('/api/customers/with-visits', handleGetCustomersWithRecentVisits);
app.put('/api/customers/:id', handleUpdateCustomer);
app.delete('/api/customers/:id', handleDeleteCustomer);

app.get('/api/items/search', handleSearchItems);
app.get('/api/items', handleGetAllItems);
app.get('/api/items/sell', handleGetSellableItems);
app.get('/api/items/:itemId', handleGetItemById);
app.post('/api/items', handleCreateItem);
app.put('/api/items/:itemId', handleUpdateItem);
app.delete('/api/items/:itemId', handleDeleteItem);
app.get('/api/orders/:orderId/items', handleGetOrderItems);
app.post('/api/order-items', handleAddOrderItem);
app.put('/api/order-items/:orderItemId', handleUpdateOrderItem);
app.delete('/api/order-items/:orderItemId', handleRemoveOrderItem);

app.get('/summary/installs', handleGetInstallSummaries);
app.get('/summary/orders', handleGetOrderSummaries);
app.get('/summary/repairs', handleGetRepairSummaries);

// Tax rate endpoint
app.get('/tax/current', async (req, res) => {
  try {
    const [rows]: any = await require('./dataSource').db.query(
      'SELECT rate FROM tax_log WHERE is_active = TRUE LIMIT 1'
    );
    const taxRate = rows[0]?.rate || 0;
    res.json({ rate: taxRate });
  } catch (error) {
    console.error('Error fetching tax rate:', error);
    res.status(500).json({ rate: 0 });
  }
});

app.listen(PORT, () => {
    console.log(`Server listening on  http://localhost:${PORT}`);
});




