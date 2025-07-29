import './config'; // Load environment variables
import { getCustomers} from './models/customerModel' 
import express, {Express} from 'express';
import { handleCustomerAndRepair, handleRepairForCustomer, handleRepairPickup, handleRepairStatusUpdate } from './controllers/repairController';
import { handleCreateCustomerOrder, handleCreateOrderForCustomer, handleCreateCompleteOrder } from './controllers/orderController';
import { handleCreateCustomerInstall, handleCreateInstallForCustomer } from './controllers/installController';
import { handleGetCustomers, handleAddCustomer, handleSearchCustomers} from './controllers/customerController';
import { handleGetInstallSummaries, handleGetOrderSummaries, handleGetRepairSummaries } from './controllers/summaryController';
import { handleSearchItems, handleGetOrderItems, handleAddOrderItem, handleUpdateOrderItem, handleRemoveOrderItem } from './controllers/itemController';




const PORT = process.env.PORT;
const app: Express = express();
app.use(express.json());
app.use(express.urlencoded( {extended: true}));
app.use(express.static('public', {extensions: ['html']}));
app.use(express.json());


// Endpoints
app.post('/createCustomer', handleAddCustomer); 
app.post('/repairs/create-customer-repair', handleCustomerAndRepair);
app.post('/repairs/create-repair', handleRepairForCustomer ); 
app.post('/repairs/:repairId/pickup', handleRepairPickup);
app.post('/repairs/:repairId/status', handleRepairStatusUpdate);
app.post('/orders/create-customer-order', handleCreateCustomerOrder);
app.post('/orders/create-order', handleCreateOrderForCustomer);
app.post('/orders/create-complete-order', handleCreateCompleteOrder);
app.post('/installs/create-customer-install', handleCreateCustomerInstall);
app.post('/create-install', handleCreateInstallForCustomer);

app.get('/api/customers', handleGetCustomers);
app.get('/api/customers/search', handleSearchCustomers);

app.get('/api/items/search', handleSearchItems);
app.get('/api/orders/:orderId/items', handleGetOrderItems);
app.post('/api/order-items', handleAddOrderItem);
app.put('/api/order-items/:orderItemId', handleUpdateOrderItem);
app.delete('/api/order-items/:orderItemId', handleRemoveOrderItem);

app.get('/summary/installs', handleGetInstallSummaries);
app.get('/summary/orders', handleGetOrderSummaries);
app.get('/summary/repairs', handleGetRepairSummaries);



const customers = await getCustomers();
app.listen(PORT, () => {
    console.log(`Server listening on  http://localhost:${PORT}`);
    
    console.log(customers);
});




