import { Router } from 'express';
import TokenAuth from '../middleware/TokenAuth';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import UsersController from '../controllers/UsersController';


const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

router.post('/users', UsersController.postNew);
router.get('/users/me', TokenAuth.getTokenUser, UsersController.getMe);

router.get('/files', TokenAuth.getTokenUser, FilesController.getIndex);
router.get('/files/:id', TokenAuth.getTokenUser, FilesController.getShow);
router.post('/files', TokenAuth.getTokenUser, FilesController.postUpload);
router.put('/files/:id/publish', TokenAuth.getTokenUser, FilesController.putPublish)
router.put('/files/:id/unpublish', TokenAuth.getTokenUser, FilesController.putUnpublish)
router.get('/files/:id/data', FilesController.getFile)
export default router;
