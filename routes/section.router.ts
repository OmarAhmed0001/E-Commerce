import { Router } from 'express';

import { protectedMiddleware } from '../middlewares/protected.middleware';
// import { validate } from "../middlewares/validation.middleware";
import {
  getSectionByIdValidator,
  createSectionValidator,
  updateSectionValidator,
  deleteSectionValidator,
} from '../validations/section.validator';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';

import {
  createSection,
  deleteSection,
  getAllSections,
  getSectionById,
  getSectionByName,
  updateSection,
} from './../controllers/section.controller';

const sectionRouter = Router();

sectionRouter
  .route('/')
  .get(getSectionByIdValidator, getAllSections)
  .post(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    createSectionValidator,
    createSection,
  );
sectionRouter.route('/sectionName/:sectionName').get(getSectionByName);
sectionRouter
  .route('/:id')
  .get(getSectionById)
  .put(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    updateSectionValidator,
    updateSection,
  )
  .delete(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    deleteSectionValidator,
    deleteSection,
  );

export default sectionRouter;
