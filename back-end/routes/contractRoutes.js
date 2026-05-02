const express = require('express');
const {
  createContract,
  getContracts,
  getMyContracts,
  getContractById,
  getContractsByInfluencer,
  getContractsByBrand,
  updateContract,
  updateContractStatus,
} = require('../controllers/contractController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, authorize('brand'), createContract);
router.get('/', protect, getContracts);
router.get('/my', protect, getMyContracts);
router.get('/influencer/:influencerId', protect, getContractsByInfluencer);
router.get('/brand/:brandId', protect, getContractsByBrand);
router.put('/:id/status', protect, updateContractStatus);
router.put('/:id', protect, authorize('brand', 'admin'), updateContract);
router.get('/:id', protect, getContractById);

module.exports = router;
