import { Router } from 'express';
    // Import your admin discounts controller functions
    // import * as discountController from '@controllers/admin/discounts.controller';

    const router = Router();
    const path = '/admin/discounts';

    // Example placeholder route
    router.get(`${path}`, (req, res) => {
        // Replace with actual controller call
        res.status(200).json({ discounts: [], message: 'Admin Discounts Data' });
    });

    export default { path, router };