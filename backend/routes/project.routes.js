import { Router } from "express";
import { body } from "express-validator";
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

// ✅ Create project
router.post(
    '/create',
    authMiddleware.authUser,
    body('name').isString().withMessage('Name is required'),
    projectController.createProject
);

// ✅ Get all projects
router.get(
    '/all',
    authMiddleware.authUser,
    projectController.getAllProjects
);

// ✅ Add user to project
router.put(
    '/add-user',
    authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users')
        .isArray({ min: 1 }).withMessage('users is required')
        .bail()
        .custom((users) => users.every(user => typeof user === 'string'))
        .withMessage('users must be an array of strings'),
    projectController.addUserToProject
);

// ✅ Get project by ID
router.get(
    '/get-projects/:projectId',
    authMiddleware.authUser,
    projectController.getProjectById
);

// 🔥 NEW ROUTE (FIXED YOUR ERROR)
router.put('/upsate-file-tree',
    authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree is required'),
    projectController.updateFileTree
);

export default router;