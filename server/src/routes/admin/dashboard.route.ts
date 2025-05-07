import { Router } from 'express';
    // Import your admin dashboard controller functions
    // import * as adminController from '@controllers/admin/dashboard.controller';

    const router = Router();
    const path = '/admin';

    // Example placeholder route
    router.get(`${path}`, (req, res) => {
       // Replace with actual controller call
        res.status(200).json({ message: 'Admin Dashboard Data' });
    });

    export default { path, router };