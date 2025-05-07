import { Router } from 'express';
    // Import your admin reviews controller functions
    // import * as reviewsController from '@controllers/admin/reviews.controller';

    const router = Router();
    const path = '/admin/reviews';

    // Example placeholder route
    router.get(`${path}`, (req, res) => {
        // Replace with actual controller call
         res.status(200).json({ reviews: [], message: 'Admin Reviews Data' });
    });

    export default { path, router };