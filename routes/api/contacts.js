const express = require("express");
const router = express.Router();

const ctrl = require("../../controllers/contacts");

const { validateBody, isValidId, authenticate } = require("../../middlewares");

const schemas = require("../../schemas/contacts");

router.get("/", authenticate, ctrl.listContacts);

router.get("/:contactId", authenticate, isValidId, ctrl.getContactById);

router.post(
  "/",
  authenticate,
  validateBody(schemas.addSchema),
  ctrl.addContact
);

router.delete("/:contactId", authenticate, isValidId, ctrl.removeContact);

router.put(
  "/:contactId",
  authenticate,
  isValidId,
  validateBody(schemas.addSchema),
  ctrl.updateContact
);

router.patch(
  "/:contactId/favorite",
  authenticate,
  isValidId,
  validateBody(schemas.updateFavoriteSchema),
  ctrl.updateStatusContact
);

module.exports = router;

/* Використання роутів 04 урок
 * REST API =================================
 * POST       /users            - create user
 * GET        /users            - get all users
 * GET        /users/<userID>   - get one user by id
 * PUT/PATCH  /users/<userID>   - update user by id
 * DELETE     /users/<userID>   - delete user by id
 */

// router.post('/', createUser);
// router.get('/', getAllUsers);
// router.get('/:id', checkUserId, getOneUser);
// router.patch('/:id', checkUserId, updateUser);
// router.delete('/:id', checkUserId, deleteUser);

// router
//   .route('/')
//   .post(createUser)
//   .get(getAllUsers);

// router.use('/:id', checkUserId);
// router
//   .route('/:id')
//   .get(getOneUser)
//   .patch(updateUser)
//   .delete(deleteUser);
